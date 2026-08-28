import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { sendEmail } from '@/lib/gmail';
import { query } from '@/lib/db';
import { upsertUser } from '@/lib/app-user';
export const runtime='nodejs';
const emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function sameOrigin(req:NextRequest){const origin=req.headers.get('origin');if(!origin)return true;return origin===new URL(req.url).origin}
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return NextResponse.json({error:'Invalid request origin.'},{status:403});
 const session=await getSession();if(!session)return NextResponse.json({error:'Connect Gmail first.'},{status:401});
 let body:any={};
 try{
  body=await req.json(); const to=String(body.to||'').trim().toLowerCase(); const subject=String(body.subject||'').trim(); const html=String(body.html||'').trim();
  if(!emailRe.test(to))return NextResponse.json({error:`Invalid recipient: ${to}`},{status:400}); if(!subject)return NextResponse.json({error:'Subject is required.'},{status:400}); if(!html)return NextResponse.json({error:'Email body is required.'},{status:400});
  const attachment=body.attachment?{filename:String(body.attachment.filename||'attachment'),contentType:String(body.attachment.contentType||'application/octet-stream'),data:String(body.attachment.data||'')}:undefined;
  if(attachment&&attachment.data.length>5_800_000)return NextResponse.json({error:'Attachment is too large for this deployment flow.'},{status:400});
  const id=await sendEmail({refreshToken:session.refreshToken,to,subject,html,attachment});
  if(body.campaignId){await query(`UPDATE campaign_recipients SET status='sent',provider_message_id=$1,sent_at=now() WHERE campaign_id=$2 AND email=$3`,[id,body.campaignId,to]);await query(`UPDATE campaigns SET sent_count=sent_count+1 WHERE id=$1`,[body.campaignId]);}
  return NextResponse.json({ok:true,id});
 }catch(e:any){
  if(body?.campaignId && body?.to){ try { await query(`UPDATE campaign_recipients SET status='failed',error=$1 WHERE campaign_id=$2 AND email=$3`,[String(e?.message||'Failed to send email.'),body.campaignId,String(body.to).toLowerCase()]); await query(`UPDATE campaigns SET failed_count=failed_count+1 WHERE id=$1`,[body.campaignId]); } catch {} } console.error('Send failed:',e?.response?.data||e?.message||e); return NextResponse.json({error:e?.message||'Failed to send email.'},{status:500});
 }
}
