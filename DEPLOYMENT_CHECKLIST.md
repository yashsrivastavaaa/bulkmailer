# Deployment checklist

- [ ] Rotate the Google client secret that was previously shared in chat.
- [ ] Create a Google OAuth **Web application** client.
- [ ] Add local callback: `http://localhost:3000/api/auth/callback`.
- [ ] Add production callback: `https://YOUR-DOMAIN/api/auth/callback`.
- [ ] Configure Branding and Audience in Google Auth Platform.
- [ ] Add test users while app is in Testing.
- [ ] Complete Google verification before allowing unrestricted public users where required by Google's policies.
- [ ] Set all four environment variables in Vercel.
- [ ] Use a fresh 64-hex `APP_ENCRYPTION_KEY` in production.
- [ ] Deploy and test OAuth, recipient count, personalization, attachment and send flow.
- [ ] Add durable DB + encrypted token storage + background queue before scaling to many users/campaigns.
- [ ] Publish accurate privacy policy, terms and contact information.
