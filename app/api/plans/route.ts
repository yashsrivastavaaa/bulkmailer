import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { rows } = await query(`SELECT id,slug AS key,name,description,price_monthly_cents AS price_cents,currency,monthly_send_limit,max_recipients_per_campaign AS campaign_recipient_limit,max_attachment_mb AS attachment_limit_mb,max_custom_columns,features,is_active,sort_order FROM plans WHERE is_active=true ORDER BY sort_order ASC`);
  return NextResponse.json({ plans: rows });
}
