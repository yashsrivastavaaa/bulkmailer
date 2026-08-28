# Bulkmailer production setup

## Local
1. `npm install`
2. Copy `.env.local.example` to `.env.local`.
3. Create a **Web application** OAuth client in Google Cloud.
4. Add `http://localhost:3000/api/auth/callback` as an authorized redirect URI.
5. Add your Google account under OAuth Audience -> Test users while the app is in Testing.
6. Generate `APP_ENCRYPTION_KEY` with:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
7. `npm run dev`

## Vercel
Set these environment variables in Vercel:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI=https://YOUR-DOMAIN/api/auth/callback`
- `APP_ENCRYPTION_KEY`

Add the exact HTTPS callback URL to the Google OAuth Web client.

## Security
- Never commit `.env.local` or OAuth client secrets.
- Rotate any client secret that has been exposed publicly.
- Keep the app in Google OAuth Testing until verification is complete if only approved testers should use it.
- For a public multi-user SaaS at scale, add persistent encrypted token storage and a background job/queue before high-volume sending.

## Production RBAC
Set `ADMIN_EMAILS` to a comma-separated list of trusted administrator emails. Admin authorization is enforced server-side on `/admin` and `/api/admin`; hiding the link is not the security boundary.
