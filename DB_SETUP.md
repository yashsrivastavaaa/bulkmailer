# PostgreSQL / Neon setup

Set `DATABASE_URL` in `.env.local`. Keep the real Neon connection string server-side and never commit it.

The app automatically creates the required tables on the first database-backed request. You can also run:

```bash
npm run db:init
```

Tables created automatically:
- `users`
- `google_accounts`
- `campaigns`
- `campaign_recipients`
- `templates`

No manual table creation is required.

OAuth refresh tokens are encrypted with `APP_ENCRYPTION_KEY` before database storage.
