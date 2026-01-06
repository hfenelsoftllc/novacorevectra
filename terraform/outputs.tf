# Output values for use in CI/CD pipeline and other integrations

output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.website.bucket
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.website.arn
}

output "s3_website_endpoint" {
  description = "S3 website endpoint"
  value       = aws_s3_bucket_website_configuration.website.website_endpoint
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.website.arn
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "route53_name_servers" {
  description = "Route53 name servers for domain configuration"
  value       = aws_route53_zone.main.name_servers
}

output "ssl_certificate_arn" {
  description = "ACM SSL certificate ARN"
  value       = aws_acm_certificate_validation.website.certificate_arn
}

output "website_url" {
  description = "Website URL"
  value       = var.environment == "staging" ? "https://staging.${var.domain_name}" : "https://${var.domain_name}"
}

output "logs_bucket_name" {
  description = "Name of the logs S3 bucket"
  value       = var.enable_logging ? aws_s3_bucket.logs[0].bucket : null
}

output "health_check_id" {
  description = "Route53 health check ID"
  value       = var.environment == "production" ? aws_route53_health_check.website[0].id : null
}

# CloudWatch Monitoring Outputs
output "sns_topic_arn" {
  description = "SNS topic ARN for CloudWatch alerts"
  value       = aws_sns_topic.cloudwatch_alerts.arn
}

output "cloudwatch_log_group_name" {
  description = "CloudWatch log group name for deployment logs"
  value       = aws_cloudwatch_log_group.deployment_logs.name
}

output "cloudwatch_dashboard_url" {
  description = "CloudWatch dashboard URL"
  value       = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.website_monitoring.dashboard_name}"
}

# Notification Outputs
output "pipeline_events_topic_arn" {
  description = "SNS topic ARN for pipeline events"
  value       = aws_sns_topic.pipeline_events.arn
}

output "slack_lambda_function_name" {
  description = "Slack notification Lambda function name"
  value       = var.slack_webhook_url != "" ? aws_lambda_function.slack_notifier[0].function_name : null
}

output "pipeline_slack_lambda_function_name" {
  description = "Pipeline Slack notification Lambda function name"
  value       = var.slack_webhook_url != "" ? aws_lambda_function.pipeline_slack_notifier[0].function_name : null
}