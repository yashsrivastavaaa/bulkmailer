import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUserBySessionEmail, getUserPlan } from '@/lib/app-user';
import { query } from '@/lib/db';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ connected:false, email:null, plan:null });
  const user = await getUserBySessionEmail(s.email);
  const plan = user ? await getUserPlan(user.id) : null;
  if (!user || !plan) return NextResponse.json({ connected:true, email:s.email, userId:user?.id ?? null, role:user?.role ?? 'user', plan:null });
  const { rows: usageRows } = await query<{count:string}>(`SELECT COUNT(*)::text AS count FROM campaign_recipients cr JOIN campaigns c ON c.id=cr.campaign_id WHERE c.user_id=$1 AND cr.status='sent' AND c.created_at >= date_trunc('month', now())`, [user.id]);
  const used = Number(usageRows[0]?.count || 0);
  const remaining = Math.max(0, Number(plan.monthly_send_limit) - used);
  return NextResponse.json({ connected:true, email:s.email, userId:user.id, role:user.role ?? 'user', plan: { key:plan.key, name:plan.name, monthlySendLimit:Number(plan.monthly_send_limit), usedThisMonth:used, remainingThisMonth:remaining, campaignRecipientLimit:Number(plan.campaign_recipient_limit), attachmentLimitMb:Number(plan.attachment_limit_mb), maxCustomColumns:Number(plan.max_custom_columns), features:plan.features } });
}
