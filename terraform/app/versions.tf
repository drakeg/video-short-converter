terraform {
  required_version = ">= 1.15.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.60"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.3"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.8"
    }
  }
}
