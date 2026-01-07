# CloudWatch Alarms for S3 and CloudFront Monitoring

# SNS Topic for CloudWatch Alarms
resource "aws_sns_topic" "cloudwatch_alerts" {
  name = "${var.project_name}-${var.environment}-cloudwatch-alerts"

  tags = {
    Name        = "${var.project_name}-${var.environment}-cloudwatch-alerts"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "CloudWatch Alerts"
  }
}

# SNS Topic Policy to allow CloudWatch to publish
resource "aws_sns_topic_policy" "cloudwatch_alerts" {
  arn = aws_sns_topic.cloudwatch_alerts.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudWatchAlarmsToPublish"
        Effect = "Allow"
        Principal = {
          Service = "cloudwatch.amazonaws.com"
        }
        Action   = "sns:Publish"
        Resource = aws_sns_topic.cloudwatch_alerts.arn
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })
}

# CloudWatch Alarm for CloudFront 4xx Error Rate
resource "aws_cloudwatch_metric_alarm" "cloudfront_4xx_error_rate" {
  alarm_name          = "${var.project_name}-${var.environment}-cloudfront-4xx-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "4xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Average"
  threshold           = "5"
  alarm_description   = "This metric monitors CloudFront 4xx error rate"
  alarm_actions       = [aws_sns_topic.cloudwatch_alerts.arn]
  ok_actions          = [aws_sns_topic.cloudwatch_alerts.arn]

  dimensions = {
    DistributionId = aws_cloudfront_distribution.website_ncv_cf_dist.id
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-cloudfront-4xx-error-rate"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "CloudFront 4xx Error Rate Monitoring"
  }
}

# CloudWatch Alarm for CloudFront 5xx Error Rate
resource "aws_cloudwatch_metric_alarm" "cloudfront_5xx_error_rate" {
  alarm_name          = "${var.project_name}-${var.environment}-cloudfront-5xx-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Average"
  threshold           = "1"
  alarm_description   = "This metric monitors CloudFront 5xx error rate"
  alarm_actions       = [aws_sns_topic.cloudwatch_alerts.arn]
  ok_actions          = [aws_sns_topic.cloudwatch_alerts.arn]

  dimensions = {
    DistributionId = aws_cloudfront_distribution.website_ncv_cf_dist.id
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-cloudfront-5xx-error-rate"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "CloudFront 5xx Error Rate Monitoring"
  }
}

# CloudWatch Alarm for CloudFront Origin Latency
resource "aws_cloudwatch_metric_alarm" "cloudfront_origin_latency" {
  alarm_name          = "${var.project_name}-${var.environment}-cloudfront-origin-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "3"
  metric_name         = "OriginLatency"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Average"
  threshold           = "5000"
  alarm_description   = "This metric monitors CloudFront origin latency (in milliseconds)"
  alarm_actions       = [aws_sns_topic.cloudwatch_alerts.arn]
  ok_actions          = [aws_sns_topic.cloudwatch_alerts.arn]

  dimensions = {
    DistributionId = aws_cloudfront_distribution.website_ncv_cf_dist.id
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-cloudfront-origin-latency"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "CloudFront Origin Latency Monitoring"
  }
}

# CloudWatch Alarm for S3 4xx Errors
resource "aws_cloudwatch_metric_alarm" "s3_4xx_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-s3-4xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "4xxErrors"
  namespace           = "AWS/S3"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors S3 4xx errors"
  alarm_actions       = [aws_sns_topic.cloudwatch_alerts.arn]
  ok_actions          = [aws_sns_topic.cloudwatch_alerts.arn]

  dimensions = {
    BucketName = aws_s3_bucket.website.bucket
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-s3-4xx-errors"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "S3 4xx Error Monitoring"
  }
}

# CloudWatch Alarm for S3 5xx Errors
resource "aws_cloudwatch_metric_alarm" "s3_5xx_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-s3-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "5xxErrors"
  namespace           = "AWS/S3"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "This metric monitors S3 5xx errors"
  alarm_actions       = [aws_sns_topic.cloudwatch_alerts.arn]
  ok_actions          = [aws_sns_topic.cloudwatch_alerts.arn]

  dimensions = {
    BucketName = aws_s3_bucket.website.bucket
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-s3-5xx-errors"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "S3 5xx Error Monitoring"
  }
}

# CloudWatch Log Group for deployment logs
resource "aws_cloudwatch_log_group" "deployment_logs" {
  name              = "/aws/deployment/${var.project_name}-${var.environment}"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-deployment-logs"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Deployment Logs"
  }
}

# Custom CloudWatch Metric for Deployment Success/Failure
resource "aws_cloudwatch_log_metric_filter" "deployment_success" {
  name           = "${var.project_name}-${var.environment}-deployment-success"
  log_group_name = aws_cloudwatch_log_group.deployment_logs.name
  pattern        = "[timestamp, request_id, level=\"SUCCESS\", ...]"

  metric_transformation {
    name      = "DeploymentSuccess"
    namespace = "Custom/Deployment"
    value     = "1"
    default_value = "0"
  }
}

resource "aws_cloudwatch_log_metric_filter" "deployment_failure" {
  name           = "${var.project_name}-${var.environment}-deployment-failure"
  log_group_name = aws_cloudwatch_log_group.deployment_logs.name
  pattern        = "[timestamp, request_id, level=\"ERROR\", ...]"

  metric_transformation {
    name      = "DeploymentFailure"
    namespace = "Custom/Deployment"
    value     = "1"
    default_value = "0"
  }
}

# CloudWatch Alarm for Deployment Failures
resource "aws_cloudwatch_metric_alarm" "deployment_failure" {
  alarm_name          = "${var.project_name}-${var.environment}-deployment-failure"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "DeploymentFailure"
  namespace           = "Custom/Deployment"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "This metric monitors deployment failures"
  alarm_actions       = [aws_sns_topic.cloudwatch_alerts.arn]
  treat_missing_data  = "notBreaching"

  tags = {
    Name        = "${var.project_name}-${var.environment}-deployment-failure"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Deployment Failure Monitoring"
  }
}

# CloudWatch Dashboard for monitoring overview
resource "aws_cloudwatch_dashboard" "website_monitoring" {
  dashboard_name = "${var.project_name}-${var.environment}-monitoring"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/CloudFront", "Requests", "DistributionId", aws_cloudfront_distribution.website_ncv_cf_dist.id],
            [".", "BytesDownloaded", ".", "."],
            [".", "BytesUploaded", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "CloudFront Traffic"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/CloudFront", "4xxErrorRate", "DistributionId", aws_cloudfront_distribution.website_ncv_cf_dist.id],
            [".", "5xxErrorRate", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "CloudFront Error Rates"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/CloudFront", "OriginLatency", "DistributionId", aws_cloudfront_distribution.website_ncv_cf_dist.id]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "CloudFront Origin Latency"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/S3", "BucketSizeBytes", "BucketName", aws_s3_bucket.website.bucket, "StorageType", "StandardStorage"],
            [".", "NumberOfObjects", ".", ".", ".", "AllStorageTypes"]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "S3 Bucket Metrics"
          period  = 86400
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 24
        height = 6

        properties = {
          metrics = [
            ["Custom/Deployment", "DeploymentSuccess"],
            [".", "DeploymentFailure"]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Deployment Metrics"
          period  = 300
        }
      }
    ]
  })
}