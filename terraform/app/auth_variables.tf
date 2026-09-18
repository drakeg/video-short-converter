# Drop into terraform/app/auth_variables.tf.
# These are separated from variables.tf so they can be added without merging first.

variable "cognito_domain_prefix" {
  description = "Globally unique Cognito hosted UI domain prefix. Example: video-short-converter-greg-prod"
  type        = string
}

variable "auth_callback_urls" {
  description = "Allowed OAuth callback URLs. Include CloudFront/custom domain callback paths. Static export uses trailing slash."
  type        = list(string)
}

variable "auth_logout_urls" {
  description = "Allowed OAuth logout redirect URLs. Include CloudFront/custom domain login paths. Static export uses trailing slash."
  type        = list(string)
}

variable "auth_cors_allow_origin" {
  description = "Primary browser origin allowed to call the profile API, for example https://shorts.example.com. HTTPS deployment origins are also allowed by the API CORS policy."
  type        = string
}

variable "profile_api_log_retention_days" {
  description = "CloudWatch log retention for the profile API Lambda."
  type        = number
  default     = 7
}

variable "profile_api_throttling_burst_limit" {
  description = "API Gateway burst limit to prevent accidental runaway usage."
  type        = number
  default     = 20
}

variable "profile_api_throttling_rate_limit" {
  description = "API Gateway steady-state requests per second limit to prevent accidental runaway usage."
  type        = number
  default     = 5
}
