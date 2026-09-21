import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { upsertUser } from '@/lib/app-user';
export const runtime='nodejs';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const s=await getSession();if(!s)return NextResponse.json({error:'Unauthorized'},{status:401});
 const u=await upsertUser(s.email);const {id}=await params;
 const c=await query<any>(`SELECT id,email,name,total_sent,total_failed,first_contacted_at,last_contacted_at,last_subject,last_status FROM contacts WHERE id=$1 AND user_id=$2 LIMIT 1`,[id,u.id]);
 if(!c.rows[0])return NextResponse.json({error:'Contact not found'},{status:404});
 const h=await query<any>(`SELECT cr.id,cr.email,cr.name,cr.status,cr.provider_message_id,cr.error,cr.sent_at,c.id campaign_id,c.subject,c.body,c.attachment_name,c.created_at FROM campaign_recipients cr JOIN campaigns c ON c.id=cr.campaign_id WHERE c.user_id=$1 AND lower(cr.email)=lower($2) ORDER BY COALESCE(cr.sent_at,c.created_at) DESC`,[u.id,c.rows[0].email]);
 return NextResponse.json({contact:c.rows[0],messages:h.rows});
}
