# S3 bucket for static website hosting
resource "aws_s3_bucket" "website" {
  bucket = "${var.project_name}-${var.environment}"

  tags = {
    Name        = "${var.project_name}-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Static Website Hosting"
  }
}

# S3 bucket versioning configuration
resource "aws_s3_bucket_versioning" "website" {
  bucket = aws_s3_bucket.website.id
  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Suspended"
  }
}

# S3 bucket server-side encryption configuration
resource "aws_s3_bucket_server_side_encryption_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# S3 bucket public access block (initially restrictive, will be modified for website hosting)
resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 bucket website configuration
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }

  depends_on = [aws_s3_bucket_public_access_block.website]
}

# S3 bucket CORS configuration
resource "aws_s3_bucket_cors_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = [
      "https://${var.domain_name}",
      var.environment == "staging" ? "https://staging.${var.domain_name}" : "https://${var.domain_name}"
    ]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# S3 bucket policy for public read access
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.website.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.website]
}

# S3 bucket lifecycle configuration for cost optimization
resource "aws_s3_bucket_lifecycle_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    id     = "delete_old_versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 30
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  depends_on = [aws_s3_bucket_versioning.website]
}

# S3 bucket for access logs (optional)
resource "aws_s3_bucket" "logs" {
  count  = var.enable_logging ? 1 : 0
  bucket = "${var.project_name}-${var.environment}-logs"

  tags = {
    Name        = "${var.project_name}-${var.environment}-logs"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Access Logs"
  }
}

# S3 bucket server-side encryption for logs
resource "aws_s3_bucket_server_side_encryption_configuration" "logs" {
  count  = var.enable_logging ? 1 : 0
  bucket = aws_s3_bucket.logs[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# S3 bucket public access block for logs (keep private)
resource "aws_s3_bucket_public_access_block" "logs" {
  count  = var.enable_logging ? 1 : 0
  bucket = aws_s3_bucket.logs[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket logging configuration
resource "aws_s3_bucket_logging" "website" {
  count  = var.enable_logging ? 1 : 0
  bucket = aws_s3_bucket.website.id

  target_bucket = aws_s3_bucket.logs[0].id
  target_prefix = "access-logs/"
}