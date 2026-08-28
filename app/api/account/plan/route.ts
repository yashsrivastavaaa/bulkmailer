import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUserPlan, getUsage } from '@/lib/app-user';
export const runtime='nodejs';
export async function GET(){const s=await getSession();if(!s)return NextResponse.json({plan:null},{status:401});const plan=await getUserPlan(s.email);const used=await getUsage(s.email);const limit=plan.monthly_send_limit;return NextResponse.json({plan,usage:{used,limit,remaining:Math.max(0,limit-used)}})}
