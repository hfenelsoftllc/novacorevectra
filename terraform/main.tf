# AWS Provider Configuration
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # Backend configuration for state management
  backend "s3" {
    # These values should be configured during initialization
    # bucket = "novacorevectra-terraform-state"
    # key    = "infrastructure/terraform.tfstate"
    # region = "us-east-1"
    # dynamodb_table = "terraform-state-lock"
    # encrypt = true
  }
}

provider "aws" {
  region = var.aws_region
}

# Additional provider for ACM certificates (must be in us-east-1 for CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}

# Data source for AWS region
data "aws_region" "current" {}