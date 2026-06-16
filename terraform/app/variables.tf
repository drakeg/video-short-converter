variable "aws_region" {
  description = "AWS region for S3 and IAM resources. CloudFront is global."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short project name used for AWS resource names."
  type        = string
  default     = "video-short-converter"
}

variable "environment" {
  description = "Environment name."
  type        = string
  default     = "prod"
}

variable "github_owner" {
  description = "GitHub organization or username that owns the repo."
  type        = string
  default     = "drakeg"
}

variable "github_repo" {
  description = "GitHub repository name."
  type        = string
  default     = "video-short-converter"
}

variable "github_branch" {
  description = "GitHub branch allowed to deploy."
  type        = string
  default     = "main"
}

variable "create_github_oidc_provider" {
  description = "Set to false if your AWS account already has the GitHub Actions OIDC provider."
  type        = bool
  default     = true
}
