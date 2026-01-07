# Route53 Hosted Zone for the domain
resource "aws_route53_zone" "main" {
  name = var.domain_name

  tags = {
    Name        = "${var.project_name}-hosted-zone"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "DNS Management"
  }
}

# A record pointing to CloudFront distribution
resource "aws_route53_record" "website_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.environment == "staging" ? "staging.${var.domain_name}" : var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website_ncv_cf_dist.domain_name
    zone_id                = aws_cloudfront_distribution.website_ncv_cf_dist.hosted_zone_id
    evaluate_target_health = false
  }

  depends_on = [aws_cloudfront_distribution.website_ncv_cf_dist]
}

# AAAA record (IPv6) pointing to CloudFront distribution
resource "aws_route53_record" "website_aaaa" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.environment == "staging" ? "staging.${var.domain_name}" : var.domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.website_ncv_cf_dist.domain_name
    zone_id                = aws_cloudfront_distribution.website_ncv_cf_dist.hosted_zone_id
    evaluate_target_health = false
  }

  depends_on = [aws_cloudfront_distribution.website_ncv_cf_dist]
}

# WWW redirect for production environment only
resource "aws_route53_record" "website_www_a" {
  count   = var.environment == "production" ? 1 : 0
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website_ncv_cf_dist.domain_name
    zone_id                = aws_cloudfront_distribution.website_ncv_cf_dist.hosted_zone_id
    evaluate_target_health = false
  }

  depends_on = [aws_cloudfront_distribution.website_ncv_cf_dist]
}

resource "aws_route53_record" "website_www_aaaa" {
  count   = var.environment == "production" ? 1 : 0
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.website_ncv_cf_dist.domain_name
    zone_id                = aws_cloudfront_distribution.website_ncv_cf_dist.hosted_zone_id
    evaluate_target_health = false
  }

  depends_on = [aws_cloudfront_distribution.website_ncv_cf_dist]
}

# MX record for Google SMTP
resource "aws_route53_record" "mx" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "MX"
  ttl     = 3600  # 1 hour

  records = [
    "smtp.google.com"
  ]
}

# Health check for the website (production only)
resource "aws_route53_health_check" "website" {
  count                           = var.environment == "production" ? 1 : 0
  fqdn                           = var.domain_name
  port                           = 443
  type                           = "HTTPS"
  resource_path                  = "/"
  failure_threshold              = 3
  request_interval               = 30
  measure_latency                = true
  enable_sni                     = true

  tags = {
    Name        = "${var.project_name}-health-check"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Health Monitoring"
  }
}

# CloudWatch alarm for health check failures (production only)
resource "aws_cloudwatch_metric_alarm" "website_health" {
  count               = var.environment == "production" ? 1 : 0
  alarm_name          = "${var.project_name}-website-health-alarm"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HealthCheckStatus"
  namespace           = "AWS/Route53"
  period              = "60"
  statistic           = "Minimum"
  threshold           = "1"
  alarm_description   = "This metric monitors website health"
  alarm_actions       = [] # Add SNS topic ARN for notifications

  dimensions = {
    HealthCheckId = aws_route53_health_check.website[0].id
  }

  tags = {
    Name        = "${var.project_name}-health-alarm"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Health Monitoring"
  }
}