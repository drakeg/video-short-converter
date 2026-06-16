# AWS Deployment Guide — Video Short Converter

This project is currently a browser-only/static Next.js app. AWS hosting is:

- S3 private bucket for exported static files
- CloudFront for HTTPS/public access
- CloudFront Origin Access Control so the S3 bucket remains private
- GitHub Actions deploys `out/` to S3 and invalidates CloudFront
- Terraform state stored remotely in AWS using S3 + DynamoDB
- GitHub Actions uses OIDC/IAM role assumption, not long-lived AWS access keys

## Current repository layout

```text
terraform/
  backend/        # one-time Terraform state bucket + DynamoDB lock table
  app/            # S3 site bucket, CloudFront, IAM/OIDC deploy role
.github/
  workflows/
    deploy-aws.yml
```

## 1. Local build requirements

`next.config.ts` should include static export settings:

```ts
output: "export",
trailingSlash: true,
images: {
  unoptimized: true,
},
```

Because this app currently uses the older `@ffmpeg/ffmpeg` API, keep the package pinned unless/until the code is migrated to the newer API:

```bash
npm install @ffmpeg/ffmpeg@0.11.6
```

For Next.js 16 with the current Webpack config, `package.json` should force Webpack:

```json
"scripts": {
  "build": "next build --webpack"
}
```

Test locally:

```bash
npm ci
npm run build
ls -la out
```

## 2. Bootstrap Terraform remote state

Terraform cannot use an S3 backend until the state bucket/table already exist. Run this once:

```bash
cd terraform/backend
terraform init
terraform apply
```

This creates the S3 state bucket and DynamoDB lock table.

## 3. Deploy app infrastructure

Then deploy the app infrastructure:

```bash
cd ../app
terraform init
terraform apply
```

Collect these outputs:

```bash
terraform output site_bucket_name
terraform output cloudfront_distribution_id
terraform output cloudfront_domain_name
terraform output github_actions_role_arn
```

## 4. GitHub Actions repository variables

The workflow uses **repository variables**, not secrets, for these values:

| Variable name | Value |
|---|---|
| `AWS_REGION` | Example: `us-east-1` |
| `AWS_ROLE_TO_ASSUME` | Terraform output `github_actions_role_arn` |
| `S3_BUCKET` | Terraform output `site_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | Terraform output `cloudfront_distribution_id` |

Add them in GitHub:

```text
Repository → Settings → Secrets and variables → Actions → Variables
```

Important: use **Variables**, not **Secrets**, unless you also change the workflow from `vars.X` to `secrets.X`.

The role ARN, bucket name, distribution ID, and region are not credentials by themselves. The actual AWS access is controlled by the GitHub OIDC trust policy and IAM role permissions.

## 5. GitHub Actions workflow

Create this file:

```text
.github/workflows/deploy-aws.yml
```

```yaml
name: Deploy to AWS

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

concurrency:
  group: deploy-aws-static-site
  cancel-in-progress: true

jobs:
  deploy:
    name: Build and deploy static site
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build static site
        run: npm run build

      - name: Validate required variables
        run: |
          test -n "${{ vars.AWS_REGION }}" || (echo "Missing repository variable: AWS_REGION" && exit 1)
          test -n "${{ vars.AWS_ROLE_TO_ASSUME }}" || (echo "Missing repository variable: AWS_ROLE_TO_ASSUME" && exit 1)
          test -n "${{ vars.S3_BUCKET }}" || (echo "Missing repository variable: S3_BUCKET" && exit 1)
          test -n "${{ vars.CLOUDFRONT_DISTRIBUTION_ID }}" || (echo "Missing repository variable: CLOUDFRONT_DISTRIBUTION_ID" && exit 1)

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_ROLE_TO_ASSUME }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Deploy immutable assets to S3
        run: |
          aws s3 sync out/ "s3://${{ vars.S3_BUCKET }}" \
            --delete \
            --cache-control "public,max-age=31536000,immutable" \
            --exclude "*.html" \
            --exclude "*.json"

      - name: Deploy HTML and JSON to S3
        run: |
          aws s3 sync out/ "s3://${{ vars.S3_BUCKET }}" \
            --delete \
            --cache-control "public,max-age=0,must-revalidate" \
            --exclude "*" \
            --include "*.html" \
            --include "*.json"

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id "${{ vars.CLOUDFRONT_DISTRIBUTION_ID }}" \
            --paths "/*"
```

## 6. Trigger deploy

Commit and push:

```bash
git add .github/workflows/deploy-aws.yml AWS_DEPLOYMENT.md package.json package-lock.json next.config.ts
git commit -m "Add AWS static site deployment"
git push
```

Or manually run:

```text
GitHub → Actions → Deploy to AWS → Run workflow
```

## 7. Verify S3 upload

If CloudFront returns AccessDenied, first confirm the bucket has files:

```bash
aws s3 ls s3://YOUR_SITE_BUCKET/
aws s3 ls s3://YOUR_SITE_BUCKET/index.html
```

If empty, the workflow did not deploy or is missing variables.

Manually deploy once if needed:

```bash
npm run build
aws s3 sync out/ s3://YOUR_SITE_BUCKET --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

Then open the CloudFront URL:

```text
https://YOUR_CLOUDFRONT_DOMAIN.cloudfront.net/
```

Do not use the S3 bucket URL. The S3 bucket is intentionally private.

## 8. Troubleshooting

### `aws-region` missing

The workflow could not read `vars.AWS_REGION`.

Fix: create repository variable:

```text
AWS_REGION=us-east-1
```

### `Could not load credentials from any providers`

Usually means `AWS_ROLE_TO_ASSUME` is missing or empty.

Fix: create repository variable:

```text
AWS_ROLE_TO_ASSUME=arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME
```

### `aws s3 sync out/ s3:// --delete`

This means `S3_BUCKET` is missing or empty.

Fix: create repository variable:

```text
S3_BUCKET=<terraform output site_bucket_name>
```

### CloudFront invalidation fails

Usually means `CLOUDFRONT_DISTRIBUTION_ID` is missing or is set to the domain name instead of the ID.

Correct value looks like:

```text
E123ABC456XYZ
```

Incorrect value looks like:

```text
dje507jgadsgo.cloudfront.net
```

### GitHub push rejected for large Terraform files

Never commit `.terraform/` directories. Use this `.gitignore` entry:

```gitignore
**/.terraform/
*.tfstate
*.tfstate.*
```

If accidentally staged:

```bash
git rm -r --cached terraform/app/.terraform terraform/backend/.terraform
```

