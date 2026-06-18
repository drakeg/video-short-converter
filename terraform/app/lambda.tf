data "archive_file" "budget_kill_switch_lambda" {
  count = var.enable_budget_kill_switch ? 1 : 0

  type        = "zip"
  output_path = "${path.module}/budget-kill-switch.zip"

  source {
    filename = "lambda_function.py"
    content  = <<PY
import os
import json
import boto3

cloudfront = boto3.client("cloudfront")

def lambda_handler(event, context):
    distribution_id = os.environ["CLOUDFRONT_DISTRIBUTION_ID"]

    print("Budget alert received:")
    print(json.dumps(event))

    response = cloudfront.get_distribution_config(Id=distribution_id)
    config = response["DistributionConfig"]
    etag = response["ETag"]

    if not config.get("Enabled", True):
        print(f"CloudFront distribution {distribution_id} is already disabled.")
        return {"status": "already_disabled"}

    config["Enabled"] = False

    cloudfront.update_distribution(
        Id=distribution_id,
        IfMatch=etag,
        DistributionConfig=config
    )

    print(f"Disabled CloudFront distribution {distribution_id}.")
    return {"status": "disabled", "distribution_id": distribution_id}
PY
  }
}

resource "aws_lambda_function" "budget_kill_switch" {
  count = var.enable_budget_kill_switch ? 1 : 0

  function_name    = "${local.name_prefix}-budget-kill-switch"
  role             = aws_iam_role.budget_kill_switch_lambda[0].arn
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.12"
  filename         = data.archive_file.budget_kill_switch_lambda[0].output_path
  source_code_hash = data.archive_file.budget_kill_switch_lambda[0].output_base64sha256
  timeout          = 60

  environment {
    variables = {
      CLOUDFRONT_DISTRIBUTION_ID = aws_cloudfront_distribution.site.id
    }
  }

  tags = local.common_tags
}

resource "aws_lambda_permission" "allow_budget_sns" {
  count = var.enable_budget_kill_switch ? 1 : 0

  statement_id  = "AllowExecutionFromBudgetSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.budget_kill_switch[0].function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.budget_kill_switch[0].arn
}

resource "aws_sns_topic_subscription" "budget_kill_switch_lambda" {
  count = var.enable_budget_kill_switch ? 1 : 0

  topic_arn = aws_sns_topic.budget_kill_switch[0].arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.budget_kill_switch[0].arn
}