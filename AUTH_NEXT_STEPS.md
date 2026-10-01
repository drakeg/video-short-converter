# Authentication and profile historical deployment notes

> AWS deployment is dormant. This document records the original auth/profile rollout context; it is not an instruction to apply Terraform or recreate AWS deployment automation. Follow `AWS_DEPLOYMENT.md` unless a future explicitly approved sprint re-enables AWS.

This package adds a low-cost auth foundation without introducing fixed hourly services.

## What it adds

- Cognito User Pool
- Cognito Hosted UI with OAuth Authorization Code + PKCE
- Public browser client, no client secret
- DynamoDB `user_profiles` table in on-demand mode
- Lambda profile API
- HTTP API Gateway with Cognito JWT authorizer
- Client-side login, callback, logout, profile page, and protected app wrapper

## Cost posture

This stays serverless/pay-per-use:

- Cognito is generally free/low-cost at small user counts.
- DynamoDB on-demand profile reads/writes should be pennies for light use.
- Lambda/API Gateway should be free-tier/pennies for light use.
- No RDS, NAT Gateway, ALB, ECS, or always-on compute.

## Historical apply order (do not execute while AWS is dormant)

1. Add Terraform auth files.
2. Add app files.
3. Add tfvars callback/logout/origin settings.
4. Run `terraform init && terraform plan && terraform apply`.
5. Add the `NEXT_PUBLIC_*` GitHub Actions variables from Terraform outputs.
6. Update the workflow build step to pass the `NEXT_PUBLIC_*` variables.
7. Push and let GitHub Actions deploy.
8. Visit `/login/`, create an account, and then test `/profile/`.

## Important static-export note

Because the app is statically exported, the `NEXT_PUBLIC_*` variables are baked into the generated JavaScript at build time. Any changes to Cognito domain, client ID, callback URL, or API URL require a rebuild/redeploy.

## Future paid access path

Later, add fields to DynamoDB:

```text
stripe_customer_id
subscription_status
plan
current_period_end
```

Then protect premium operations by checking those fields in the backend API, not only in the browser.
