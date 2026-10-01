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

AWS is dormant. Do **not** run Terraform against AWS as part of ordinary development. The retained Terraform is reference-only unless a future sprint explicitly re-enables AWS under the policy in `AWS_DEPLOYMENT.md`.

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

## 7. Historical deployed-environment configuration

The Cognito/profile `NEXT_PUBLIC_*` values below are historical deployed-environment configuration. There is no active AWS deployment workflow, and ordinary development must not add repository variables or recreate a deployment workflow from these notes. If AWS is explicitly re-enabled later, review all current public build settings (including auth/profile and developer feature flags) against the then-current application before creating a new workflow. See `AWS_DEPLOYMENT.md`.

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
