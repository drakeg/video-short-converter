# Authentication/profile increment for video-short-converter.
# Drop this file into terraform/app/auth.tf.

resource "aws_cognito_user_pool" "users" {
  name = "${local.name_prefix}-users"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  password_policy {
    minimum_length                   = 12
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = false
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  mfa_configuration = "OFF"

  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    required            = false
    mutable             = true
  }

  lifecycle {
    ignore_changes = [
      schema
    ]
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${local.name_prefix}-web-client"
  user_pool_id = aws_cognito_user_pool.users.id

  generate_secret = false

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  supported_identity_providers         = ["COGNITO"]

  callback_urls = var.auth_callback_urls
  logout_urls   = var.auth_logout_urls

  prevent_user_existence_errors = "ENABLED"

  access_token_validity  = 60
  id_token_validity      = 60
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
}

resource "aws_cognito_user_pool_domain" "users" {
  domain       = var.cognito_domain_prefix
  user_pool_id = aws_cognito_user_pool.users.id
}

resource "aws_dynamodb_table" "user_profiles" {
  name         = "${local.name_prefix}-user-profiles"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }
}

resource "aws_cloudwatch_log_group" "profile_api" {
  name              = "/aws/lambda/${local.name_prefix}-profile-api"
  retention_in_days = var.profile_api_log_retention_days
}

resource "aws_iam_role" "profile_api_lambda" {
  name = "${local.name_prefix}-profile-api-lambda"

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
}

resource "aws_iam_role_policy" "profile_api_lambda" {
  name = "${local.name_prefix}-profile-api-lambda"
  role = aws_iam_role.profile_api_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ]
        Resource = aws_dynamodb_table.user_profiles.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.profile_api.arn}:*"
      }
    ]
  })
}

data "archive_file" "profile_api" {
  type        = "zip"
  source_file = "${path.module}/lambda/profile_api.py"
  output_path = "${path.module}/profile-api.zip"
}

resource "aws_lambda_function" "profile_api" {
  function_name    = "${local.name_prefix}-profile-api"
  role             = aws_iam_role.profile_api_lambda.arn
  handler          = "profile_api.lambda_handler"
  runtime          = "python3.12"
  filename         = data.archive_file.profile_api.output_path
  source_code_hash = data.archive_file.profile_api.output_base64sha256
  timeout          = 10

  environment {
    variables = {
      USER_PROFILES_TABLE = aws_dynamodb_table.user_profiles.name
      CORS_ALLOW_ORIGIN   = var.auth_cors_allow_origin
    }
  }

  depends_on = [aws_cloudwatch_log_group.profile_api]
}

resource "aws_apigatewayv2_api" "profile" {
  name          = "${local.name_prefix}-profile-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_credentials = false
    allow_headers     = ["authorization", "content-type"]
    allow_methods     = ["GET", "POST", "OPTIONS"]
    allow_origins     = [var.auth_cors_allow_origin]
    max_age           = 300
  }
}

resource "aws_apigatewayv2_authorizer" "profile" {
  api_id           = aws_apigatewayv2_api.profile.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${local.name_prefix}-cognito-jwt"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.web.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.users.id}"
  }
}

resource "aws_apigatewayv2_integration" "profile_lambda" {
  api_id                 = aws_apigatewayv2_api.profile.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.profile_api.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "profile_get" {
  api_id             = aws_apigatewayv2_api.profile.id
  route_key          = "GET /profile"
  target             = "integrations/${aws_apigatewayv2_integration.profile_lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.profile.id
}

resource "aws_apigatewayv2_route" "profile_post" {
  api_id             = aws_apigatewayv2_api.profile.id
  route_key          = "POST /profile"
  target             = "integrations/${aws_apigatewayv2_integration.profile_lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.profile.id
}

resource "aws_apigatewayv2_stage" "profile" {
  api_id      = aws_apigatewayv2_api.profile.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = var.profile_api_throttling_burst_limit
    throttling_rate_limit  = var.profile_api_throttling_rate_limit
  }
}

resource "aws_lambda_permission" "allow_profile_api" {
  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.profile_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.profile.execution_arn}/*/*"
}
