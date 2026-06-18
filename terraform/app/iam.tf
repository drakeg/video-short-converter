resource "aws_iam_role" "budget_kill_switch_lambda" {
  count = var.enable_budget_kill_switch ? 1 : 0

  name = "${local.name_prefix}-budget-kill-switch-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "budget_kill_switch_lambda" {
  count = var.enable_budget_kill_switch ? 1 : 0

  name = "${local.name_prefix}-budget-kill-switch-policy"
  role = aws_iam_role.budget_kill_switch_lambda[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudfront:GetDistributionConfig",
          "cloudfront:UpdateDistribution"
        ]
        Resource = aws_cloudfront_distribution.site.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}