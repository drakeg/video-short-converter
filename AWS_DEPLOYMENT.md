# AWS Deployment (Dormant)

AWS hosting is intentionally disabled for this project. The repository no longer contains an AWS deployment GitHub Actions workflow, and ordinary development, pull requests, merges, Docker testing, and Vercel previews do not create or update AWS resources.

The Terraform under `terraform/` is retained only as historical/reference infrastructure-as-code in case AWS hosting is deliberately revisited later. Renovate ignores that directory while AWS deployment is dormant so Terraform/provider updates do not create maintenance PRs or CI churn for infrastructure that is not being used.

## Current deployment policy

- Do not automatically deploy to AWS.
- Do not automatically run `terraform plan` or `terraform apply` against AWS.
- Do not create S3, CloudFront, DynamoDB, IAM, Cognito, SNS, Budget, or other AWS resources from CI.
- Do not maintain Terraform/provider versions solely for dormant AWS infrastructure.
- Continue using local Node/Docker validation and Vercel preview deployments for application testing.

## Re-enabling AWS later

AWS should only be re-enabled through an explicit future sprint. That work should first review the retained Terraform against the then-current application architecture, current provider versions, current AWS pricing, and the desired authentication/deployment model. A new deployment workflow should be introduced only after that review and only with explicit authorization to incur AWS costs.

Until then, the `terraform/` directory should be treated as inactive reference material rather than an active deployment target.
