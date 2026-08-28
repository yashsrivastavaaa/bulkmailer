import { NextRequest, NextResponse } from 'next/server';
import { oauthClient } from '@/lib/oauth';
import { clearOAuthState, setSession, verifyOAuthState } from '@/lib/session';
import { upsertUser, saveGoogleAccount } from '@/lib/app-user';

function emailFromIdToken(idToken?: string) {
  if (!idToken) return 'Google account';
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return 'Google account';
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as { email?: string };
    return typeof payload.email === 'string' && payload.email ? payload.email : 'Google account';
  } catch {
    return 'Google account';
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const googleError = req.nextUrl.searchParams.get('error');

  if (googleError) {
    await clearOAuthState();
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(googleError)}`, req.url));
  }

  if (!code || !state || !(await verifyOAuthState(state))) {
    return NextResponse.redirect(new URL('/?error=oauth_state', req.url));
  }

  try {
    const client = oauthClient();
    const { tokens } = await client.getToken(code);

    if (!tokens.refresh_token) {
      await clearOAuthState();
      return NextResponse.redirect(new URL('/?error=no_refresh_token', req.url));
    }

    // Gmail's users.getProfile() requires an additional scope and is not needed.
    // The ID token's email is display-only; the refresh token is what authorizes Gmail sends.
    const email = emailFromIdToken(tokens.id_token);
    await setSession(tokens.refresh_token, email);
    const user = await upsertUser(email);
    await saveGoogleAccount(user.id, email, tokens.refresh_token);
    await clearOAuthState();

    return NextResponse.redirect(new URL('/?connected=1', req.url));
  } catch (e: any) {
    console.error('OAuth callback failed:', e?.response?.data || e?.message || e);
    await clearOAuthState();
    const errorCode = e?.response?.data?.error || e?.code || 'oauth_failed';
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(String(errorCode))}`, req.url));
  }
}
