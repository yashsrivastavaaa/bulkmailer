# Bulkmailer Web

A production-oriented Next.js Gmail campaign UI. Google OAuth credentials stay server-side. Recipient files are parsed in the browser; the selected recipients are sent through Gmail API one at a time with confirmation and live progress.

## Local

1. Create a **Web application** OAuth client in Google Cloud.
2. Add `http://localhost:3000/api/auth/callback` as an authorized redirect URI.
3. Configure the OAuth consent screen. For testing, add your Gmail address under Test users.
4. Copy `.env.local.example` to `.env.local` and fill it in.
5. Generate the encryption key:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

6. Install and run:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Vercel

Set these environment variables in Vercel:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI=https://YOUR-DOMAIN/api/auth/callback`
- `APP_ENCRYPTION_KEY`

Add the same HTTPS callback URL to the Google OAuth Web client. Never commit `.env.local` or secrets.

## Production notes

This project intentionally keeps Google credentials and refresh tokens on the server. Before operating as a public multi-user SaaS, add durable encrypted database storage for users/tokens/campaigns, a background queue/worker for long campaigns, rate limiting, audit logs, CSRF/session hardening, and a production object-storage upload path for large attachments. Google OAuth verification and Gmail sending quotas still apply.

## OAuth callback note
The web version does not call Gmail `users.getProfile()` during OAuth callback because the requested scopes do not include Gmail profile access. It stores the refresh token server-side in an encrypted HttpOnly cookie and uses the ID token only for display email when available.

## UI / workflow updates
- Dark-first SaaS interface with a monochrome, editorial visual language.
- Landing page with feature/workflow sections and connected Privacy, Terms, Help, and App routes.
- Recipient input supports Excel/CSV upload **and** pasting multiple email addresses separated by commas, spaces, semicolons, or new lines.
- Duplicate and invalid pasted addresses are removed automatically.
- Recipient table supports search plus check/uncheck controls for visible rows and a clear-list action.
- Campaign composer includes one-click personalization variable buttons for `{{name}}` and `{{email}}`.

## Reference
The public landing visual direction was tuned toward a clean, dark, typography-led portfolio/SaaS aesthetic inspired by the supplied reference URL. The reference itself is not bundled or copied into the app.

## Database
Set `DATABASE_URL` in `.env.local`. The app creates the required PostgreSQL tables automatically. See `DB_SETUP.md`.

## Recipient controls
The dashboard supports Excel/CSV upload, multi-email paste, search, per-row checkboxes, check/uncheck visible, duplicate filtering, and a final exact-count confirmation before sending.
