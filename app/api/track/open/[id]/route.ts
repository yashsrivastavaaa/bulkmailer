import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
export const runtime='nodejs';
const pixel=Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==','base64');
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 await query(`UPDATE campaign_recipients SET opened_at=COALESCE(opened_at,now()),open_count=open_count+1 WHERE id=$1`,[id]);
 return new NextResponse(pixel,{headers:{'Content-Type':'image/gif','Content-Length':String(pixel.length),'Cache-Control':'no-store, no-cache, must-revalidate, max-age=0'}});
}
