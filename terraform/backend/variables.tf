variable "aws_region" {
  description = "AWS region for Terraform backend resources."
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

variable "state_bucket_name" {
  description = "Globally unique S3 bucket name for Terraform state. Leave null to generate one using account ID."
  type        = string
  default     = null
}

variable "lock_table_name" {
  description = "DynamoDB table name for Terraform state locking."
  type        = string
  default     = "video-short-converter-terraform-locks"
}

variable "noncurrent_state_version_expiration_days" {
  description = "Expire old noncurrent Terraform state object versions after this many days."
  type        = number
  default     = 90
}
