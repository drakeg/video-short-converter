output "site_bucket_name" {
  description = "S3 bucket that stores the exported Next.js site. Set this as GitHub variable S3_BUCKET."
  value       = aws_s3_bucket.site.bucket
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID. Set this as GitHub variable CLOUDFRONT_DISTRIBUTION_ID."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain for the deployed site."
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "github_actions_role_arn" {
  description = "IAM role ARN. Set this as GitHub variable AWS_ROLE_TO_ASSUME."
  value       = aws_iam_role.github_actions_deploy.arn
}

output "monthly_budget_name" {
  description = "AWS Budget name, if enabled."
  value       = var.enable_cost_budget ? aws_budgets_budget.monthly_cost[0].name : null
}
