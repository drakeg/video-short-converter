# Auth integration notes

## 1. Add required Terraform provider

Because `auth.tf` uses `data "archive_file"`, add the archive provider to `terraform/app/versions.tf`:

```hcl
required_providers {
  aws = {
    source  = "hashicorp/aws"
    version = "~> 6.0"
  }

  tls = {
    source  = "hashicorp/tls"
    version = "~> 4.0"
  }

  archive = {
    source  = "hashicorp/archive"
    version = "~> 2.7"
  }
}
```

Keep your existing provider versions if they differ; just add `archive`.

## 2. Add Terraform files

Copy these into the existing repo:

```text
terraform/app/auth.tf
terraform/app/auth_variables.tf
terraform/app/auth_outputs.tf
terraform/app/lambda/profile_api.py
```

## 3. Add tfvars

Example for the CloudFront URL currently in use:

```hcl
cognito_domain_prefix = "video-short-converter-greg-prod"

auth_callback_urls = [
  "https://dje507jgadsgo.cloudfront.net/auth/callback/"
]

auth_logout_urls = [
  "https://dje507jgadsgo.cloudfront.net/login/"
]

auth_cors_allow_origin = "https://dje507jgadsgo.cloudfront.net"
```

If using a custom domain, use that instead, for example:

```hcl
auth_callback_urls = [
  "https://shorts.madmallards.com/auth/callback/"
]

auth_logout_urls = [
  "https://shorts.madmallards.com/login/"
]

auth_cors_allow_origin = "https://shorts.madmallards.com"
```

Then run:

```bash
cd terraform/app
terraform init
terraform plan
terraform apply
```

## 4. Add app files

Copy these into `src`:

```text
src/lib/auth.ts
src/components/AuthNav.tsx
src/components/RequireAuth.tsx
src/app/login/page.tsx
src/app/logout/page.tsx
src/app/auth/callback/page.tsx
src/app/profile/page.tsx
```

## 5. Update layout to show auth nav

In `src/app/layout.tsx`, add:

```tsx
import AuthNav from "@/components/AuthNav";
```

Then inside `<body>`, add this before `{children}`:

```tsx
<AuthNav />
```

Example:

```tsx
<body className="font-sans">
  <div className="fixed right-4 top-4 z-50">
    <ThemeToggle />
  </div>
  <AuthNav />
  {children}
</body>
```

## 6. Protect the video converter page

In `src/app/page.tsx`, add:

```tsx
import RequireAuth from "@/components/RequireAuth";
```

Then wrap the editor card area:

```tsx
<RequireAuth>
  <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-slate-900 dark:border dark:border-slate-700">
    <VideoEditor />
  </div>
</RequireAuth>
```

This keeps the title/instructions visible but requires sign-in before using the converter.

## 7. Add build-time GitHub variables

GitHub Actions needs the public auth config at build time because this is a static export.

Add repository variables:

```text
NEXT_PUBLIC_COGNITO_DOMAIN
NEXT_PUBLIC_COGNITO_CLIENT_ID
NEXT_PUBLIC_COGNITO_REDIRECT_URI
NEXT_PUBLIC_COGNITO_LOGOUT_URI
NEXT_PUBLIC_PROFILE_API_BASE_URL
```

Use `terraform output` to get:

```bash
terraform output cognito_hosted_ui_base_url
terraform output cognito_user_pool_client_id
terraform output profile_api_base_url
```

Then update the workflow build step using `GITHUB_ACTIONS_ENV_UPDATE.yml`.

## 8. Local development

Create `.env.local` from `.env.local.example` and run:

```bash
npm run build
npm run dev
```

For local auth callbacks, add local URLs to Terraform too:

```hcl
auth_callback_urls = [
  "https://dje507jgadsgo.cloudfront.net/auth/callback/",
  "http://localhost:3000/auth/callback/"
]

auth_logout_urls = [
  "https://dje507jgadsgo.cloudfront.net/login/",
  "http://localhost:3000/login/"
]
```
