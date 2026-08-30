import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { upsertUser } from '@/lib/app-user';
export const runtime='nodejs';
export async function GET(req:Request){
 const s=await getSession();if(!s)return NextResponse.json({error:'Unauthorized'},{status:401});
 const u=await upsertUser(s.email);const url=new URL(req.url);const q=(url.searchParams.get('q')||'').trim();const page=Math.max(1,Number(url.searchParams.get('page')||1));const limit=Math.min(100,Math.max(10,Number(url.searchParams.get('limit')||50)));const search=q?`%${q}%`:'';
 const where=`user_id=$1 AND ($2='' OR lower(email) LIKE lower($2) OR lower(COALESCE(name,'')) LIKE lower($2))`;
 const [r,total]=await Promise.all([
  query<any>(`SELECT id,email,name,total_sent,total_failed,first_contacted_at,last_contacted_at,last_subject,last_status,updated_at FROM contacts WHERE ${where} ORDER BY updated_at DESC LIMIT $3 OFFSET $4`,[u.id,search,limit,(page-1)*limit]),
  query<{count:string}>(`SELECT COUNT(*)::text count FROM contacts WHERE ${where}`,[u.id,search]),
 ]);
 return NextResponse.json({contacts:r.rows,pagination:{page,limit,total:Number(total.rows[0]?.count||0),pages:Math.max(1,Math.ceil(Number(total.rows[0]?.count||0)/limit))}});
}
