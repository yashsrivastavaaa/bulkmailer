import { NextRequest, NextResponse } from 'next/server';
import dns from 'node:dns/promises';
import { getSession } from '@/lib/session';

export const runtime='nodejs';
const emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req:NextRequest){
 const session=await getSession();
 if(!session)return NextResponse.json({error:'Unauthorized'},{status:401});
 const body=await req.json();
 const emails:string[]=Array.isArray(body.emails)?body.emails.map((x:any)=>String(x||'').trim().toLowerCase()).filter((x:string)=>Boolean(x)):[];
 if(!emails.length)return NextResponse.json({results:[]});
 const unique:string[]=[...new Set<string>(emails)];
 const results:any[]=[];
 for(let start=0;start<unique.length;start+=40){
  const chunk=unique.slice(start,start+40);
  results.push(...await Promise.all(chunk.map(async email=>{
   if(!emailRe.test(email)) return {email,valid:false,reason:'Invalid email format'};
   const domain=email.split('@')[1];
   try{
     const mx=await dns.resolveMx(domain);
     return {email,valid:mx.length>0,reason:mx.length?'Mailbox domain can receive email':'Domain has no mail exchanger'};
   }catch{
     try{
       await dns.resolve(domain);
       return {email,valid:true,warning:true,reason:'Domain exists, but mailbox could not be confirmed'};
     }catch{return {email,valid:false,reason:'Email domain could not be resolved'};}
   }
  })));
 }
 return NextResponse.json({results});
}
