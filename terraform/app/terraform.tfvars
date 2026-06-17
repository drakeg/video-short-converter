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