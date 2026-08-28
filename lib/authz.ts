import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUserBySessionEmail } from '@/lib/app-user';

export async function requireUser() {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) } as const;
  const user = await getUserBySessionEmail(session.email);
  if (!user) return { error: NextResponse.json({ error: 'User account not found.' }, { status: 401 }) } as const;
  return { session, user } as const;
}

export async function requireAdmin() {
  const auth = await requireUser();
  if ('error' in auth) return auth;
  if (auth.user.role !== 'admin') return { error: NextResponse.json({ error: 'Forbidden: admin access required.' }, { status: 403 }) } as const;
  return auth;
}
