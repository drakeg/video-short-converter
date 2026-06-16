terraform {
  backend "s3" {
    bucket         = "video-short-converter-terraform-state"
    key            = "video-short-converter/app/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "video-short-converter-terraform-locks"
    encrypt        = true
  }
}