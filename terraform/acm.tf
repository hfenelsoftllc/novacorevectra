# AWS Certificate Manager SSL Certificate
# Note: ACM certificates for CloudFront must be created in us-east-1 region
resource "aws_acm_certificate" "website_ncv_cert" {
  provider = aws.us_east_1

  domain_name = var.environment == "staging" ? "staging.${var.domain_name}" : var.domain_name

  subject_alternative_names = var.environment == "staging" ? [] : ["www.${var.domain_name}"]

  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-certificate"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "SSL Certificate"
  }
}

# Certificate validation using Route53 DNS records
resource "aws_acm_certificate_validation" "website_ncv_cert" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.website_ncv_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.certificate_validation : record.fqdn]

  timeouts {
    create = "20m"
  }

  depends_on = [aws_route53_record.certificate_validation]
}

# Route53 records for certificate validation
resource "aws_route53_record" "certificate_validation" {
  for_each = {
    for dvo in aws_acm_certificate.website_ncv_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.main.zone_id

  depends_on = [aws_route53_zone.main]
}