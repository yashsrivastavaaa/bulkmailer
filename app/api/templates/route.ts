import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { upsertUser } from '@/lib/app-user';
export const runtime='nodejs';
export async function GET(){const s=await getSession();if(!s)return NextResponse.json({error:'Connect Gmail first.'},{status:401});const u=await upsertUser(s.email);const {rows}=await query(`SELECT id,name,subject,body,created_at,updated_at FROM templates WHERE user_id=$1 ORDER BY updated_at DESC`,[u.id]);return NextResponse.json({templates:rows});}
export async function POST(req:NextRequest){const s=await getSession();if(!s)return NextResponse.json({error:'Connect Gmail first.'},{status:401});const b=await req.json();if(!b.name||!b.subject||!b.body)return NextResponse.json({error:'Name, subject and body are required.'},{status:400});const u=await upsertUser(s.email);const {rows}=await query(`INSERT INTO templates(user_id,name,subject,body) VALUES($1,$2,$3,$4) RETURNING *`,[u.id,b.name,b.subject,b.body]);return NextResponse.json({template:rows[0]});}
