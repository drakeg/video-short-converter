variable "aws_region" {
  description = "AWS region for S3, IAM, and Budget resources. CloudFront is global."
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

variable "owner" {
  description = "Resource owner tag."
  type        = string
  default     = "greg"
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

variable "cloudfront_price_class" {
  description = "PriceClass_100 is the lowest-cost CloudFront edge footprint."
  type        = string
  default     = "PriceClass_100"
}

variable "enable_cost_budget" {
  description = "Create an AWS monthly cost budget for this AWS account."
  type        = bool
  default     = true
}

variable "monthly_budget_limit_usd" {
  description = "Monthly budget threshold in USD."
  type        = string
  default     = "5"
}

variable "budget_alert_email" {
  description = "Email address for AWS Budget alerts. Required if enable_cost_budget is true."
  type        = string
  default     = ""
}

variable "enable_cloudfront_logging" {
  description = "Enable CloudFront standard logging. Disabled by default to avoid extra S3 storage/request costs."
  type        = bool
  default     = false
}

variable "cloudfront_log_retention_days" {
  description = "Expire CloudFront logs after this many days when logging is enabled."
  type        = number
  default     = 14
}

variable "site_noncurrent_version_expiration_days" {
  description = "If versioning is ever enabled on the site bucket, expire old versions after this many days."
  type        = number
  default     = 30
}

variable "monthly_budget_usd" {
  description = "Monthly AWS budget amount"
  type        = number
  default     = 5
}

variable "site_enabled" {
  description = "Enable or disable the CloudFront site."
  type        = bool
  default     = true
}

variable "enable_budget_kill_switch" {
  description = "Disable CloudFront automatically when actual budget threshold is exceeded."
  type        = bool
  default     = true
}

variable "budget_kill_switch_threshold_percent" {
  description = "Actual budget percentage that triggers CloudFront disable."
  type        = number
  default     = 100
}

variable "domain_names" {
  type    = list(string)
  default = []
}

variable "acm_certificate_arn" {
  type    = string
  default = ""

  validation {
    condition = (
      length(var.domain_names) == 0 ||
      can(regex("^arn:aws:acm:us-east-1:", var.acm_certificate_arn))
    )
    error_message = "acm_certificate_arn must be a valid ACM certificate ARN in us-east-1 when domain_names is set."

  }
}