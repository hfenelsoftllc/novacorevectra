# SNS Subscriptions for Email and Slack Notifications

# Email subscription for CloudWatch alerts
resource "aws_sns_topic_subscription" "email_alerts" {
  count     = var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.cloudwatch_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email

  depends_on = [aws_sns_topic.cloudwatch_alerts]
}

# Lambda function for Slack notifications
resource "aws_iam_role" "slack_lambda_role" {
  count = var.slack_webhook_url != "" ? 1 : 0
  name  = "${var.project_name}-${var.environment}-slack-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-slack-lambda-role"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Slack Lambda Execution Role"
  }
}

# IAM policy for Lambda function
resource "aws_iam_role_policy" "slack_lambda_policy" {
  count = var.slack_webhook_url != "" ? 1 : 0
  name  = "${var.project_name}-${var.environment}-slack-lambda-policy"
  role  = aws_iam_role.slack_lambda_role[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"
      }
    ]
  })
}

# Lambda function for Slack notifications
resource "aws_lambda_function" "slack_notifier" {
  count         = var.slack_webhook_url != "" ? 1 : 0
  filename      = "slack_notifier.zip"
  function_name = "${var.project_name}-${var.environment}-slack-notifier"
  role          = aws_iam_role.slack_lambda_role[0].arn
  handler       = "index.handler"
  runtime       = "python3.12"
  timeout       = 30

  environment {
    variables = {
      SLACK_WEBHOOK_URL = var.slack_webhook_url
      PROJECT_NAME      = var.project_name
      ENVIRONMENT       = var.environment
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-slack-notifier"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Slack Notifications"
  }

  depends_on = [
    aws_iam_role_policy.slack_lambda_policy,
    aws_cloudwatch_log_group.slack_lambda_logs
  ]
}

# CloudWatch Log Group for Lambda function
resource "aws_cloudwatch_log_group" "slack_lambda_logs" {
  count             = var.slack_webhook_url != "" ? 1 : 0
  name              = "/aws/lambda/${var.project_name}-${var.environment}-slack-notifier"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-slack-lambda-logs"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Slack Lambda Logs"
  }
}

# Lambda permission for SNS to invoke the function
resource "aws_lambda_permission" "allow_sns" {
  count         = var.slack_webhook_url != "" ? 1 : 0
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.slack_notifier[0].function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.cloudwatch_alerts.arn
}

# SNS subscription for Slack notifications
resource "aws_sns_topic_subscription" "slack_alerts" {
  count     = var.slack_webhook_url != "" ? 1 : 0
  topic_arn = aws_sns_topic.cloudwatch_alerts.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.slack_notifier[0].arn

  depends_on = [aws_lambda_permission.allow_sns]
}

# Data source to create the Lambda deployment package
data "archive_file" "slack_notifier_zip" {
  count       = var.slack_webhook_url != "" ? 1 : 0
  type        = "zip"
  output_path = "slack_notifier.zip"

  source {
    content = templatefile("${path.module}/lambda/slack_notifier.py", {
      slack_webhook_url = var.slack_webhook_url
      project_name      = var.project_name
      environment       = var.environment
    })
    filename = "index.py"
  }
}

# SNS Topic for Pipeline Events (separate from CloudWatch alerts)
resource "aws_sns_topic" "pipeline_events" {
  name = "${var.project_name}-${var.environment}-pipeline-events"

  tags = {
    Name        = "${var.project_name}-${var.environment}-pipeline-events"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Pipeline Event Notifications"
  }
}

# Email subscription for pipeline events
resource "aws_sns_topic_subscription" "pipeline_email_alerts" {
  count     = var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.pipeline_events.arn
  protocol  = "email"
  endpoint  = var.alert_email

  depends_on = [aws_sns_topic.pipeline_events]
}

# Lambda function for pipeline Slack notifications
resource "aws_lambda_function" "pipeline_slack_notifier" {
  count         = var.slack_webhook_url != "" ? 1 : 0
  filename      = "pipeline_slack_notifier.zip"
  function_name = "${var.project_name}-${var.environment}-pipeline-slack-notifier"
  role          = aws_iam_role.slack_lambda_role[0].arn
  handler       = "index.handler"
  runtime       = "python3.12"
  timeout       = 30

  environment {
    variables = {
      SLACK_WEBHOOK_URL = var.slack_webhook_url
      PROJECT_NAME      = var.project_name
      ENVIRONMENT       = var.environment
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-pipeline-slack-notifier"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Pipeline Slack Notifications"
  }

  depends_on = [
    aws_iam_role_policy.slack_lambda_policy,
    aws_cloudwatch_log_group.pipeline_slack_lambda_logs
  ]
}

# CloudWatch Log Group for Pipeline Lambda function
resource "aws_cloudwatch_log_group" "pipeline_slack_lambda_logs" {
  count             = var.slack_webhook_url != "" ? 1 : 0
  name              = "/aws/lambda/${var.project_name}-${var.environment}-pipeline-slack-notifier"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-pipeline-slack-lambda-logs"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Pipeline Slack Lambda Logs"
  }
}

# Lambda permission for Pipeline SNS to invoke the function
resource "aws_lambda_permission" "allow_pipeline_sns" {
  count         = var.slack_webhook_url != "" ? 1 : 0
  statement_id  = "AllowExecutionFromPipelineSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.pipeline_slack_notifier[0].function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.pipeline_events.arn
}

# SNS subscription for pipeline Slack notifications
resource "aws_sns_topic_subscription" "pipeline_slack_alerts" {
  count     = var.slack_webhook_url != "" ? 1 : 0
  topic_arn = aws_sns_topic.pipeline_events.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.pipeline_slack_notifier[0].arn

  depends_on = [aws_lambda_permission.allow_pipeline_sns]
}

# Data source to create the Pipeline Lambda deployment package
data "archive_file" "pipeline_slack_notifier_zip" {
  count       = var.slack_webhook_url != "" ? 1 : 0
  type        = "zip"
  output_path = "pipeline_slack_notifier.zip"

  source {
    content = templatefile("${path.module}/lambda/pipeline_slack_notifier.py", {
      slack_webhook_url = var.slack_webhook_url
      project_name      = var.project_name
      environment       = var.environment
    })
    filename = "index.py"
  }
}