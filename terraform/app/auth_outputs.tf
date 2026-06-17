# Drop into terraform/app/auth_outputs.tf.

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID."
  value       = aws_cognito_user_pool.users.id
}

output "cognito_user_pool_client_id" {
  description = "Cognito User Pool app client ID. Use as NEXT_PUBLIC_COGNITO_CLIENT_ID."
  value       = aws_cognito_user_pool_client.web.id
}

output "cognito_hosted_ui_base_url" {
  description = "Cognito Hosted UI base URL. Use as NEXT_PUBLIC_COGNITO_DOMAIN."
  value       = "https://${aws_cognito_user_pool_domain.users.domain}.auth.${var.aws_region}.amazoncognito.com"
}

output "profile_api_base_url" {
  description = "Profile API base URL. Use as NEXT_PUBLIC_PROFILE_API_BASE_URL."
  value       = aws_apigatewayv2_api.profile.api_endpoint
}

output "user_profiles_table_name" {
  description = "DynamoDB table for user profile records."
  value       = aws_dynamodb_table.user_profiles.name
}
