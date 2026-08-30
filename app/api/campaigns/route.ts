import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query, withTransaction } from '@/lib/db';
import { upsertUser, getUserPlan } from '@/lib/app-user';
export const runtime='nodejs';

export async function GET(){
 const s=await getSession();if(!s)return NextResponse.json({error:'Connect Gmail first.'},{status:401});
 const u=await upsertUser(s.email);const {rows}=await query(`SELECT id,subject,source_name,attachment_name,total_recipients,sent_count,failed_count,status,created_at,completed_at,scheduled_at,health_score,health_issues FROM campaigns WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50`,[u.id]);return NextResponse.json({campaigns:rows});
}
export async function POST(req:NextRequest){
 const s=await getSession();if(!s)return NextResponse.json({error:'Connect Gmail first.'},{status:401});
 const body=await req.json();const recipients=Array.isArray(body.recipients)?body.recipients:[];if(!recipients.length)return NextResponse.json({error:'No recipients supplied.'},{status:400});
 const u=await upsertUser(s.email);const plan=await getUserPlan(u.id);if(!plan)return NextResponse.json({error:'Unable to load your plan.'},{status:500});
 const selected=recipients.filter((r:any)=>r&&r.selected!==false);if(!selected.length)return NextResponse.json({error:'Select at least one recipient.'},{status:400});
 if(selected.length>plan.campaign_recipient_limit)return NextResponse.json({error:`Your ${plan.name} plan allows ${plan.campaign_recipient_limit.toLocaleString()} recipients per campaign.`},{status:403});
 const {rows:usage}=await query<{count:string}>(`SELECT COUNT(*)::text count FROM campaign_recipients cr JOIN campaigns c ON c.id=cr.campaign_id WHERE c.user_id=$1 AND cr.status='sent' AND c.created_at >= date_trunc('month',now())`,[u.id]);
 const used=Number(usage[0]?.count||0);if(used+selected.length>plan.monthly_send_limit)return NextResponse.json({error:`Monthly limit reached. ${plan.name} allows ${plan.monthly_send_limit.toLocaleString()} sends.`},{status:403});
 const healthIssues:any[]=[]; if(selected.some((r:any)=>!r.name)) healthIssues.push('Some recipients are missing a name.'); const healthScore=Math.max(0,100-healthIssues.length*5); const requestedStatus=body.mode==='draft'?'draft':body.scheduledAt?'scheduled':'sending'; const campaign=await withTransaction(async client=>{const c=await client.query(`INSERT INTO campaigns(user_id,subject,source_name,attachment_name,total_recipients,status,body,scheduled_at,health_score,health_issues) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,[u.id,String(body.subject||'Untitled campaign'),body.sourceName||null,body.attachmentName||null,selected.length,requestedStatus,String(body.body||''),body.scheduledAt||null,healthScore,JSON.stringify(healthIssues)]);for(const r of selected)await client.query(`INSERT INTO campaign_recipients(campaign_id,email,name,selected,data) VALUES($1,$2,$3,true,$4)`,[c.rows[0].id,String(r.email).trim().toLowerCase(),r.name||null,JSON.stringify(r.data||{})]);return c.rows[0].id as string});return NextResponse.json({ok:true,campaignId:campaign,health:{score:healthScore,issues:healthIssues},plan:{name:plan.name,monthlyLimit:plan.monthly_send_limit,used}});
}
