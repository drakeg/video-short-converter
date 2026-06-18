# AWS Static Hosting Deployment

This deploys the current browser-only Next.js video short converter to AWS using:

- S3 private bucket for static files
- CloudFront for HTTPS/public delivery
- CloudFront Origin Access Control for private S3 access
- CloudFront response headers required by FFmpeg.wasm
- GitHub Actions OIDC for deploys without long-lived AWS keys
- S3/DynamoDB Terraform remote state
- Cost guardrails: AWS Budget, tags, lifecycle cleanup, low-cost CloudFront price class, optional logging disabled by default

## Repository layout

```text
terraform/
  backend/
    main.tf
    variables.tf
    outputs.tf
    versions.tf
    terraform.tfvars.example
  app/
    backend.tf.example
    main.tf
    variables.tf
    outputs.tf
    versions.tf
    terraform.tfvars.example
.github/
  workflows/
    deploy-aws.yml
```

## 1. Confirm Next.js static export

`next.config.ts` should include:

```ts
output: "export",
trailingSlash: true,
images: {
  unoptimized: true,
},
```

Because this app currently uses the older `@ffmpeg/ffmpeg` API, keep the dependency pinned unless you migrate the code:

```bash
npm install @ffmpeg/ffmpeg@0.11.6
```

Your build script should force Webpack for now:

```json
"build": "next build --webpack"
```

Test locally:

```bash
npm ci
npm run build
```

You should see an `out/` directory.

## 2. Bootstrap Terraform remote state

Terraform cannot use an S3 backend until the state bucket and lock table already exist. Run this once:

```bash
cd terraform/backend
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

Save the output:

```bash
terraform output backend_config_example
```

## 3. Configure app Terraform backend

Create `terraform/app/backend.tf` from the example:

```bash
cd ../app
cp backend.tf.example backend.tf
```

Edit `backend.tf` using the values from `terraform/backend` output.

Example:

```hcl
terraform {
  backend "s3" {
    bucket         = "video-short-converter-prod-terraform-state-123456789012"
    key            = "video-short-converter/app/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "video-short-converter-terraform-locks"
    encrypt        = true
  }
}
```

## 4. Configure app variables

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit at least this value:

```hcl
budget_alert_email = "your-email@example.com"
```

Cost-related defaults:

```hcl
enable_cost_budget       = true
monthly_budget_limit_usd = "5"
cloudfront_price_class   = "PriceClass_100"

enable_cloudfront_logging     = false
cloudfront_log_retention_days = 14
```

Notes:

- `PriceClass_100` keeps CloudFront to the lower-cost edge footprint.
- CloudFront logging is disabled by default because logs add S3 storage and request costs.
- AWS Budget alerts fire at 50% actual, 80% forecasted, and 100% actual.
- Site and Terraform buckets include lifecycle rules to prevent stale versions/incomplete uploads from growing forever.

## 5. Create AWS infrastructure

```bash
terraform init
terraform plan
terraform apply
```

Save these outputs:

```bash
terraform output site_bucket_name
terraform output cloudfront_distribution_id
terraform output github_actions_role_arn
terraform output cloudfront_domain_name
```

## 6. Add GitHub Actions variables

In GitHub, go to:

```text
Settings -> Secrets and variables -> Actions -> Variables
```

Create these repository variables:

| Variable | Value |
|---|---|
| `AWS_REGION` | `us-east-1` |
| `AWS_ROLE_TO_ASSUME` | Terraform output `github_actions_role_arn` |
| `S3_BUCKET` | Terraform output `site_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | Terraform output `cloudfront_distribution_id` |

These are variables, not secrets, because the workflow uses GitHub OIDC and does not store long-lived AWS keys.

## 7. Deploy

Push to `main`, or run the workflow manually from the GitHub Actions tab.

The site URL is:

```bash
terraform output cloudfront_domain_name
```

## 8. Cost control checklist

### Already implemented in Terraform

- AWS monthly budget with email alerts.
- Low-cost CloudFront price class: `PriceClass_100`.
- Private S3 bucket behind CloudFront only.
- S3 lifecycle cleanup for incomplete uploads and old noncurrent versions.
- Optional CloudFront logging disabled by default.
- Default resource tags for cost allocation:
  - `Project`
  - `Environment`
  - `Owner`
  - `ManagedBy`
  - `CostCenter`

### Recommended in AWS Console

Enable the `Project`, `Environment`, and `CostCenter` tags as cost allocation tags:

```text
AWS Billing and Cost Management -> Cost Allocation Tags
```

This makes it easier to filter costs for this project.

## 9. If Terraform fails on the GitHub OIDC provider

If your AWS account already has the GitHub OIDC provider, edit `terraform/app/terraform.tfvars`:

```hcl
create_github_oidc_provider = false
```

Then rerun:

```bash
terraform plan
terraform apply
```

## 10. If the site shows AccessDenied

If you see XML like this:

```xml
<Error>
  <Code>AccessDenied</Code>
  <Message>Access Denied</Message>
</Error>
```

Check these:

1. Use the CloudFront URL, not the S3 bucket URL.
2. Make sure files were uploaded:

```bash
aws s3 ls s3://YOUR_SITE_BUCKET/index.html
```

3. Rerun the GitHub Action or deploy manually:

```bash
npm run build
aws s3 sync out/ s3://YOUR_SITE_BUCKET --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```
