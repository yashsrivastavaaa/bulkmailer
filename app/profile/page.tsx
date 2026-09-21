'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { getAuthStatus } from '@/lib/client-auth';
export default function Profile(){
 const [data,setData]=useState<any>(null); const [loading,setLoading]=useState(true);
 useEffect(()=>{getAuthStatus().then(setData).catch(()=>{}).finally(()=>setLoading(false))},[]);
 const email=data?.email||''; const initial=email.slice(0,1).toUpperCase()||'B';
 return <div className="profile-page"><div className="floating-page-head"><div><div className="eyebrow">PROFILE</div><h1>Your profile.</h1><p>Manage your account identity and the way Bulkmailer looks on this device.</p></div></div>
  <div className="profile-layout">
   <section className="panel float-panel profile-hero-card"><div className="profile-avatar-large">{initial}</div><div className="profile-identity"><span className="section-kicker">ACCOUNT</span><h2>{loading ? <span className="text-skeleton" aria-hidden="true"/> : email||'Guest workspace'}</h2><p>{data?.connected?'Google account connected':'Connect Google to unlock sending features.'}</p></div><div className={`profile-status ${data?.connected?'online':''}`}><span/> {data?.connected?'Connected':'Not connected'}</div></section>
   <section className="panel float-panel"><div className="setting-title"><span className="setting-icon">◈</span><div><h2>Appearance</h2><p>Choose the theme that feels best for your workspace.</p></div></div><div className="appearance-row"><div><b>Light / dark mode</b><span>Saved locally and applied across the entire app.</span></div><ThemeToggle/></div></section>
   <section className="panel float-panel"><div className="setting-title"><span className="setting-icon">✓</span><div><h2>Workspace</h2><p>Your current account and plan information.</p></div></div><div className="profile-facts"><div><span>Plan</span><b>{data?.plan?.name||'Free'}</b></div><div><span>Monthly sends</span><b>{(data?.plan?.monthlySendLimit??100).toLocaleString()}</b></div><div><span>Gmail</span><b>{data?.connected?'Connected':'Not connected'}</b></div></div></section>
   <section className="panel float-panel profile-links"><h2>Quick settings</h2><div><Link href="/settings">Workspace settings <span>→</span></Link><Link href="/pricing">Plans & limits <span>→</span></Link></div></section>
  </div></div>
}