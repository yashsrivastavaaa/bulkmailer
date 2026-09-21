import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
export const runtime='nodejs';
export async function GET(){
 const auth=await requireAdmin(); if('error' in auth)return auth.error;
 const [users,plans,features]=await Promise.all([
  query(`SELECT u.id,u.email,u.role,u.created_at,u.updated_at,COALESCE(p.slug,'free') plan_key,COALESCE(p.name,'Free') plan_name,COALESCE(s.status,'active') subscription_status FROM users u LEFT JOIN user_subscriptions s ON s.user_id=u.id LEFT JOIN plans p ON p.id=s.plan_id ORDER BY u.created_at DESC LIMIT 500`),
  query(`SELECT id,slug AS key,name,price_monthly_cents AS price_cents,monthly_send_limit,max_recipients_per_campaign AS campaign_recipient_limit,max_attachment_mb AS attachment_limit_mb,max_custom_columns,features FROM plans ORDER BY sort_order`),
  query(`SELECT id,key,label AS name,description,enabled,created_at FROM feature_definitions ORDER BY label`)
 ]); return NextResponse.json({users:users.rows,plans:plans.rows,features:features.rows});
}
export async function PATCH(req:NextRequest){
 const auth=await requireAdmin(); if('error' in auth)return auth.error; const b=await req.json();
 if(b.action==='set-role'){if(!['user','admin'].includes(b.role)||!b.userId)return NextResponse.json({error:'Invalid role request.'},{status:400});if(b.userId===auth.user.id&&b.role!=='admin')return NextResponse.json({error:'You cannot remove your own admin access.'},{status:400});const {rows}=await query(`UPDATE users SET role=$1,updated_at=now() WHERE id=$2 RETURNING id,email,role`,[b.role,b.userId]);if(!rows[0])return NextResponse.json({error:'User not found.'},{status:404});return NextResponse.json({user:rows[0]});}
 if(b.action==='set-plan'){if(!b.userId||!b.planKey)return NextResponse.json({error:'User and plan are required.'},{status:400});const {rows}=await query(`SELECT id FROM plans WHERE slug=$1`,[b.planKey]);if(!rows[0])return NextResponse.json({error:'Plan not found.'},{status:404});await query(`INSERT INTO user_subscriptions(user_id,plan_id,status,current_period_start,current_period_end) VALUES($1,$2,'active',date_trunc('month',now()),date_trunc('month',now())+interval '1 month') ON CONFLICT(user_id) DO UPDATE SET plan_id=excluded.plan_id,status='active',current_period_start=excluded.current_period_start,current_period_end=excluded.current_period_end,updated_at=now()`,[b.userId,rows[0].id]);return NextResponse.json({ok:true});}
 if(b.action==='set-feature'){if(!b.featureId||typeof b.enabled!=='boolean')return NextResponse.json({error:'Invalid feature request.'},{status:400});const {rows}=await query(`UPDATE feature_definitions SET enabled=$1 WHERE id=$2 RETURNING *`,[b.enabled,b.featureId]);if(!rows[0])return NextResponse.json({error:'Feature not found.'},{status:404});return NextResponse.json({feature:rows[0]});}
 return NextResponse.json({error:'Unknown admin action.'},{status:400});
}
