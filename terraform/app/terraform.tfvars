aws_region    = "us-east-1"
project_name  = "video-short-converter"
environment   = "prod"
github_owner  = "drakeg"
github_repo   = "video-short-converter"
github_branch = "main"

# If your AWS account already has token.actions.githubusercontent.com as an IAM OIDC provider,
# set this to false before terraform apply.
create_github_oidc_provider = true

enable_cost_budget = true
budget_alert_email = "greg@madmallards.com"
monthly_budget_usd = 5

domain_names        = ["shorts.madmallards.com"]
acm_certificate_arn = "arn:aws:acm:us-east-1:495872157039:certificate/cefb7196-2a42-4292-8cf7-3280471f3e09"

cognito_domain_prefix = "video-short-converter-greg-prod"

auth_callback_urls = [
  "https://shorts.madmallards.com/auth/callback",
  "https://dje507jgadsgo.cloudfront.net/auth/callback",
  "http://localhost:3000/auth/callback",
  "https://video-short-converter.vercel.app/auth/callback"
]

auth_logout_urls = [
  "https://shorts.madmallards.com",
  "https://dje507jgadsgo.cloudfront.net",
  "http://localhost:3000",
  "https://video-short-converter.vercel.app"
]

auth_cors_allow_origin = "https://shorts.madmallards.com"