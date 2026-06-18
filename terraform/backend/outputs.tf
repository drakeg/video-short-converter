output "terraform_state_bucket_name" {
  description = "S3 bucket used for Terraform remote state."
  value       = aws_s3_bucket.terraform_state.bucket
}

output "terraform_lock_table_name" {
  description = "DynamoDB table used for Terraform state locking."
  value       = aws_dynamodb_table.terraform_locks.name
}

output "backend_config_example" {
  description = "Copy these values into terraform/app/backend.tf."
  value = {
    bucket         = aws_s3_bucket.terraform_state.bucket
    key            = "video-short-converter/app/terraform.tfstate"
    region         = var.aws_region
    dynamodb_table = aws_dynamodb_table.terraform_locks.name
    encrypt        = true
  }
}
