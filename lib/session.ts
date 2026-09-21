import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE = 'bulkmailer_session';
const STATE_COOKIE = 'bulkmailer_oauth_state';

function key() {
  const hex = process.env.APP_ENCRYPTION_KEY;
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) throw new Error('APP_ENCRYPTION_KEY must be 64 hex characters.');
  return Buffer.from(hex, 'hex');
}

export function seal(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

export function unseal(value: string) {
  const raw = Buffer.from(value, 'base64url');
  const iv = raw.subarray(0, 12), tag = raw.subarray(12, 28), data = raw.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

export async function setSession(refreshToken: string, email: string) {
  const jar = await cookies();
  jar.set(COOKIE, seal(JSON.stringify({ refreshToken, email })), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSession(): Promise<{refreshToken: string; email: string} | null> {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;
  try { return JSON.parse(unseal(value)); } catch { return null; }
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function setOAuthState(state: string) {
  (await cookies()).set(STATE_COOKIE, seal(state), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 600 });
}
export async function verifyOAuthState(state: string) {
  const value = (await cookies()).get(STATE_COOKIE)?.value;
  return !!value && unseal(value) === state;
}
export async function clearOAuthState() { (await cookies()).delete(STATE_COOKIE); }
