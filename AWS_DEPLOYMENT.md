# AWS Static Hosting Deployment

This deploys the current browser-only Next.js video short converter to AWS using:

- S3 private bucket for static files
- CloudFront for HTTPS/public delivery
- CloudFront Origin Access Control for private S3 access
- CloudFront response headers required by FFmpeg.wasm
- GitHub Actions OIDC for deploys without long-lived AWS keys

## 1. Confirm Next.js static export

`next.config.ts` should include:

```ts
output: "export",
trailingSlash: true,
images: {
  unoptimized: true,
},
```

Then test locally:

```bash
npm ci
npm run build
```

You should see an `out/` directory.

## 2. Create AWS infrastructure

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

Save these Terraform outputs:

```bash
terraform output site_bucket_name
terraform output cloudfront_distribution_id
terraform output github_actions_role_arn
terraform output cloudfront_domain_name
```

## 3. Add GitHub secrets

In GitHub, go to:

`Settings -> Secrets and variables -> Actions`

Create these repository secrets:

| Secret | Value |
|---|---|
| `AWS_ROLE_ARN` | Terraform output `github_actions_role_arn` |
| `AWS_S3_BUCKET` | Terraform output `site_bucket_name` |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | Terraform output `cloudfront_distribution_id` |

Optionally create this repository variable:

| Variable | Value |
|---|---|
| `AWS_REGION` | `us-east-1` |

## 4. Deploy

Push to `main`, or run the workflow manually from the GitHub Actions tab.

The site URL is the Terraform output:

```bash
terraform output cloudfront_domain_name
```

## Notes

The app uses FFmpeg.wasm, so CloudFront sends these headers:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

These are needed for cross-origin isolation and browser-side video processing.

## If Terraform fails on the GitHub OIDC provider

If your AWS account already has the GitHub OIDC provider, edit `terraform.tfvars`:

```hcl
create_github_oidc_provider = false
```

Then rerun:

```bash
terraform plan
terraform apply
```
