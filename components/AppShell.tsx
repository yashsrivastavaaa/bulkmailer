'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const items = [
  ['/dashboard', '⌂', 'Dashboard'],
  ['/campaigns', '▤', 'Campaigns'],
  ['/templates', '✦', 'Templates'],
  ['/pricing', '◇', 'Plans'],
  ['/settings', '⚙', 'Settings'],
] as const;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(); const publicPage = path === '/';
  const [connected,setConnected]=useState(false),[email,setEmail]=useState(''),[plan,setPlan]=useState<any>({name:'Free',remainingThisMonth:100,monthlySendLimit:100}),[role,setRole]=useState('user');
  useEffect(()=>{fetch('/api/auth/status',{cache:'no-store'}).then(r=>r.json()).then(d=>{setConnected(!!d.connected);setEmail(d.email||'');setPlan(d.plan||{name:'Free',remainingThisMonth:100,monthlySendLimit:100});setRole(d.role||'user')}).catch(()=>{})},[path]);
  if(publicPage) return <>{children}</>;
  return <div className="app-shell">
    <aside className="floating-sidebar">
      <Link href="/" className="logo"><span className="logo-mark">B</span><span>bulkmailer</span></Link>
      <div className="sidebar-caption">WORKSPACE</div>
      <nav>{items.map(([href,icon,label])=>{const active=path===href||(href!=='/dashboard'&&path.startsWith(href));return <Link key={href} href={href} className={`nav-item ${active?'active':''}`}><span>{icon}</span><b>{label}</b></Link>})}</nav>{role==='admin'&&<><div className="sidebar-caption">ADMIN</div><nav><Link href="/admin" className={`nav-item ${path.startsWith('/admin')?'active':''}`}><span>◆</span><b>Admin</b></Link></nav></>}
      <div className="sidebar-bottom">
        <div className="mini-plan"><span>Current plan</span><b>{plan.name}</b><strong className="mini-plan-remaining">{Number(plan.remainingThisMonth ?? plan.monthlySendLimit ?? 100).toLocaleString()} mails left</strong><div className="mini-progress"><i style={{width:`${Math.min(100,Math.max(0,(Number(plan.remainingThisMonth ?? 0)/Math.max(1,Number(plan.monthlySendLimit ?? 100)))*100))}%`}}/></div><Link href="/pricing">Manage plan →</Link></div>
        <div className={`connection-card ${connected?'ok':''}`}><div className="connection-dot"/><div><strong>{connected?'Gmail connected':'Gmail not connected'}</strong><small>{connected?email:'Connect to start sending'}</small></div></div>
        {!connected&&<Link className="connect-side" href="/api/auth/google">Connect Gmail →</Link>}
        <div className="sidebar-links"><Link href="/help">Help</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
      </div>
    </aside>
    <div className="main-area"><header className="floating-topbar"><div className="mobile-brand"><span className="logo-mark">B</span>bulkmailer</div><div className="topbar-spacer"/><div className="account-pill"><span className="avatar">{email.slice(0,1).toUpperCase()||'B'}</span><span>{connected?email:'Guest workspace'}</span></div></header><main className="content">{children}</main></div>
  </div>
}
