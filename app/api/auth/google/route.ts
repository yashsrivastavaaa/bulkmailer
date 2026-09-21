import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { oauthClient, SCOPES } from '@/lib/oauth';
import { setOAuthState } from '@/lib/session';

export async function GET() {
  const state = crypto.randomBytes(24).toString('base64url');
  await setOAuthState(state);
  const url = oauthClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: true,
    scope: SCOPES,
    state,
  });
  return NextResponse.redirect(url);
}
