import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { upsertUser, getUserPlan, getUsage } from '@/lib/app-user';
export const runtime='nodejs';
export async function GET(){const s=await getSession();if(!s)return NextResponse.json({error:'Unauthorized'},{status:401});const u=await upsertUser(s.email);const plan=await getUserPlan(u.id);const used=await getUsage(u.id);const totals=await query<any>(`SELECT COUNT(*) FILTER(WHERE status='sent')::int sent,COUNT(*) FILTER(WHERE status='failed')::int failed,COUNT(*) FILTER(WHERE status='pending')::int pending,COUNT(*)::int total FROM campaign_recipients cr JOIN campaigns c ON c.id=cr.campaign_id WHERE c.user_id=$1 AND c.created_at>=date_trunc('month',now())`,[u.id]);return NextResponse.json({used,limit:Number(plan?.monthly_send_limit||0),remaining:Math.max(0,Number(plan?.monthly_send_limit||0)-used),totals:totals.rows[0]||{}})}