output "site_bucket_name" {
  description = "S3 bucket that stores the exported Next.js site."
  value       = aws_s3_bucket.site.bucket
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain for the deployed site."
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "github_actions_role_arn" {
  description = "IAM role ARN to store as GitHub secret AWS_ROLE_ARN."
  value       = aws_iam_role.github_actions_deploy.arn
}
