import { google } from 'googleapis';
export const SCOPES = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/drive.readonly',
];
export function oauthClient() {
  const id = process.env.GOOGLE_CLIENT_ID, secret = process.env.GOOGLE_CLIENT_SECRET, redirect = process.env.GOOGLE_REDIRECT_URI;
  if (!id || !secret || !redirect) throw new Error('Google OAuth environment variables are missing.');
  return new google.auth.OAuth2(id, secret, redirect);
}
