# Ludo Auth Foundation

I want to start a CLEAN NEW VERSION of my existing Ludo battle web app.

IMPORTANT:

Do NOT rebuild the complete application.

For this first task, use the minimum possible credits and ONLY create the authentication foundation and clean project structure.

PROJECT PURPOSE:

This is a Ludo battle application with a professional mobile-first interface.

CLEAN SOURCE REQUIREMENTS:

- Do NOT include any developer/creator personal information.

- Do NOT include my name, personal email, phone number, GitHub username, personal URLs, or personal social links.

- Do NOT copy old README author information.

- Do NOT copy old Git history.

- Do NOT include comments identifying the original creator.

- Do NOT include personal test data.

- Do NOT hard-code secrets, API keys, service-role keys, OAuth client secrets, passwords, or private credentials.

- Do not expose any secret in frontend code.

- Use generic application branding only.

- Application name: REAL LUDO PLAYER

- Do not mention Lovable, the original developer, or the original repository inside the application's UI.

AUTHENTICATION:

Create ONLY the authentication page and the minimum routing required for it.

The auth screen must be:

- Mobile-first

- Professional

- Clean

- Fast

- Responsive

- Suitable for Android WebView/PWA

- Modern gaming/Ludo visual style

- No unnecessary animations

Authentication options:

1. Google Sign In

2. Email + Password Sign Up

3. Email + Password Sign In

4. Forgot Password

5. Phone Number OTP authentication, ONLY if Supabase Phone Auth is configured with an SMS provider.

IMPORTANT FOR PHONE OTP:

Do NOT invent or create a fake SMS API.

Do NOT create a fake OTP.

Do NOT store OTP in localStorage.

Do NOT display OTP on screen.

Do NOT bypass OTP verification.

Use Supabase Auth's official phone OTP flow if phone authentication is available.

The code should be structured so that an SMS provider can be configured later from Supabase Auth settings without rewriting the authentication UI.

AUTH FLOW:

New user:

Phone number

→ Send OTP

→ Verify OTP

→ Create authenticated Supabase user

→ Redirect to the authenticated home page.

Existing user:

Phone number

→ Send OTP

→ Verify OTP

→ Sign in

→ Redirect to home.

Email:

Email + password

→ Supabase Auth

→ Sign up/sign in

→ Redirect to home.

Google:

Continue with Google

→ Supabase OAuth

→ Google authentication

→ Redirect to home.

Forgot password:

Email

→ Supabase password reset flow

→ Reset password page.

SECURITY:

- Use Supabase Auth.

- Never implement authentication using localStorage.

- Never implement fake authentication.

- Never store passwords manually.

- Never store OTP manually.

- Never expose Supabase service-role credentials.

- Use the public/publishable Supabase key only on the frontend.

- Keep authentication logic modular.

DATABASE:

For this first task, DO NOT create a large new database schema.

Only create the minimum profile/auth integration required for authentication if absolutely necessary.

Do not modify battle, wallet, payment, withdrawal, KYC, complaint, admin, or other application modules yet.

ROUTING:

Create:

- /auth

- /forgot-password

- /reset-password

- authenticated placeholder home route

If an authenticated user opens /auth, redirect them to the authenticated home route.

If an unauthenticated user opens the protected home route, redirect them to /auth.

DESIGN:

Use the application name:

REAL LUDO PLAYER

Create a clean gaming-style logo treatment using text/iconography only.

Do not copy copyrighted logos or assets from other applications.

AUTH PAGE CONTENT:

REAL LUDO PLAYER

"Play. Battle. Enjoy."

[ Continue with Google ]

OR

Mobile Number

[ +91 _________ ]

[ Send OTP ]

After OTP is sent:

Enter OTP

[ _ _ _ _ _ _ ]

[ Verify OTP ]

Also provide:

[ Continue with Email ]

Email

Password

[ Sign In ]

[ Create Account ]

[ Forgot Password ]

Keep the wording generic and professional.

IMPORTANT:

Do not spend credits implementing the full Ludo game, wallet, admin panel, battles, payments, withdrawals, KYC, complaints, reports, or other modules.

This task is ONLY:

1. Clean project foundation

2. Authentication UI

3. Supabase Auth integration structure

4. Google OAuth integration structure

5. Email/password authentication

6. Forgot password

7. Phone OTP integration using Supabase Auth when an SMS provider is configured

8. Protected routing

9. Clean generic branding

At the end, provide a concise summary of:

- files created/modified

- authentication methods implemented

- Supabase configuration still required

- environment variables required

Do not add unnecessary features.

Do not redesign the entire application.

Optimize for minimum credit usage.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ludoplayers.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/61999153-8d6a-4698-b8b1-8639362f9a7f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
