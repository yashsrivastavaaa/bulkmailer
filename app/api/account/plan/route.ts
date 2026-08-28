import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUserBySessionEmail, getUserPlan, getUsage } from '@/lib/app-user';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getSession();

  if (!session) return NextResponse.json({ plan: null }, { status: 401 });

  const user = await getUserBySessionEmail(session.email);
  if (!user) return NextResponse.json({ plan: null }, { status: 404 });

  const plan = await getUserPlan(user.id);
  if (!plan) return NextResponse.json({ plan: null }, { status: 404 });

  const used = await getUsage(user.id);
  const limit = Number(plan.monthly_send_limit ?? plan.monthlySendLimit ?? 0);

  return NextResponse.json({
    plan,
    usage: { used, limit, remaining: Math.max(0, limit - used) },
  });
}
