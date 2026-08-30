import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { upsertUser } from '@/lib/app-user';
export const runtime='nodejs';

export async function GET(_req:NextRequest,{params}:{params:Promise<{id:string}>}){
 const s=await getSession();
 if(!s)return NextResponse.json({error:'Unauthorized'},{status:401});
 const u=await upsertUser(s.email);
 const {id}=await params;
 const {rows}=await query(`SELECT id,subject,source_name,attachment_name,total_recipients,sent_count,failed_count,status,created_at,completed_at,scheduled_at,body,health_score,health_issues FROM campaigns WHERE id=$1 AND user_id=$2 LIMIT 1`,[id,u.id]);
 if(!rows[0])return NextResponse.json({error:'Campaign not found'},{status:404});
 const recipients=await query(`SELECT id,email,name,selected,status,provider_message_id,error,sent_at,data FROM campaign_recipients WHERE campaign_id=$1 ORDER BY id`,[id]);
 return NextResponse.json({campaign:rows[0],recipients:recipients.rows});
}

export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 const s=await getSession();if(!s)return NextResponse.json({error:'Unauthorized'},{status:401});
 const u=await upsertUser(s.email);const {id}=await params;const b=await req.json();
 const {rows}=await query(`UPDATE campaigns SET status=$1,failed_count=$2,completed_at=now() WHERE id=$3 AND user_id=$4 RETURNING *`,[b.status||'completed',Number(b.failed||0),id,u.id]);
 if(!rows[0])return NextResponse.json({error:'Campaign not found'},{status:404});
 return NextResponse.json({campaign:rows[0]});
}
