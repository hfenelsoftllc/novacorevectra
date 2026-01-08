# CloudFront Origin Access Control for S3
resource "aws_cloudfront_origin_access_control" "website_ncv_cf" {
  name                              = "${var.project_name}-${var.environment}-oac"
  description                       = "Origin Access Control for ${var.project_name} ${var.environment}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Cache Policy for static assets
resource "aws_cloudfront_cache_policy" "static_assets" {
  name        = "${var.project_name}-${var.environment}-static-assets"
  comment     = "Cache policy for static assets"
  default_ttl = 86400    # 1 day
  max_ttl     = 31536000 # 1 year
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    query_strings_config {
      query_string_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    cookies_config {
      cookie_behavior = "none"
    }
  }
}

# CloudFront Cache Policy for HTML files
resource "aws_cloudfront_cache_policy" "html_files" {
  name        = "${var.project_name}-${var.environment}-html-files"
  comment     = "Cache policy for HTML files with shorter TTL"
  default_ttl = 3600  # 1 hour
  max_ttl     = 86400 # 1 day
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    query_strings_config {
      query_string_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    cookies_config {
      cookie_behavior = "none"
    }
  }
}

# CloudFront Response Headers Policy
resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name    = "${var.project_name}-${var.environment}-security-headers"
  comment = "Security headers policy"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      override                   = true
    }

    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
  }

  custom_headers_config {
    items {
      header   = "X-Robots-Tag"
      value    = var.environment == "staging" ? "noindex, nofollow" : "index, follow"
      override = true
    }
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "website_ncv_cf_dist" {
  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.website_ncv_cf.id
    origin_id                = "S3-${aws_s3_bucket.website.bucket}"
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} ${var.environment} distribution"
  default_root_object = "index.html"

  # Aliases (custom domain names)
  aliases = var.environment == "staging" ? ["staging.${var.domain_name}"] : [var.domain_name, "www.${var.domain_name}"]

  # Default cache behavior for HTML files
  default_cache_behavior {
    allowed_methods            = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = "S3-${aws_s3_bucket.website.bucket}"
    cache_policy_id            = aws_cloudfront_cache_policy.html_files.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # Cache behavior for static assets (CSS, JS, images)
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.website.bucket}"
    cache_policy_id        = aws_cloudfront_cache_policy.static_assets.id
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # Cache behavior for images - JPG
  ordered_cache_behavior {
    path_pattern           = "*.jpg"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.website.bucket}"
    cache_policy_id        = aws_cloudfront_cache_policy.static_assets.id
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # Cache behavior for images - PNG
  ordered_cache_behavior {
    path_pattern           = "*.png"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.website.bucket}"
    cache_policy_id        = aws_cloudfront_cache_policy.static_assets.id
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # Cache behavior for images - SVG
  ordered_cache_behavior {
    path_pattern           = "*.svg"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.website.bucket}"
    cache_policy_id        = aws_cloudfront_cache_policy.static_assets.id
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # Cache behavior for fonts - WOFF
  ordered_cache_behavior {
    path_pattern           = "*.woff"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.website.bucket}"
    cache_policy_id        = aws_cloudfront_cache_policy.static_assets.id
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # Cache behavior for fonts - WOFF2
  ordered_cache_behavior {
    path_pattern           = "*.woff2"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.website.bucket}"
    cache_policy_id        = aws_cloudfront_cache_policy.static_assets.id
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # Geographic restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL Certificate configuration
  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate_validation.website_ncv_cert.certificate_arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
    cloudfront_default_certificate = false
  }

  # Custom error responses
  custom_error_response {
    error_code         = 404
    response_code      = 404
    response_page_path = "/404.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 404
    response_page_path = "/404.html"
  }

  # Price class (use all edge locations for production, cheaper for staging)
  price_class = var.environment == "production" ? "PriceClass_All" : "PriceClass_100"

  tags = {
    Name        = "${var.project_name}-${var.environment}-distribution"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "CDN Distribution"
  }

  # Wait for deployment to complete
  wait_for_deployment = false
}

# Update S3 bucket policy to allow CloudFront OAC access
resource "aws_s3_bucket_policy" "website_cloudfront" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.website.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.website_ncv_cf_dist.arn
          }
        }
      }
    ]
  })

  depends_on = [
    aws_s3_bucket_public_access_block.website,
    aws_cloudfront_distribution.website_ncv_cf_dist
  ]
}