'use client';
import Link from 'next/link';
import LoginRequired from '@/components/LoginRequired';
import LoadingScreen from '@/components/LoadingScreen';
import {useEffect,useMemo,useState} from 'react';
import { getAuthStatus } from '@/lib/client-auth';
import SelectMenu from '@/components/SelectMenu';

type Campaign={id:string;subject:string;source_name?:string;attachment_name?:string;total_recipients:number;sent_count:number;failed_count:number;status:string;created_at:string;completed_at?:string};

function statusLabel(status:string){return status.replaceAll('_',' ')}
function statusClass(status:string){if(status==='completed')return 'campaign-status success';if(status.includes('error')||status==='failed')return 'campaign-status danger';if(status==='sending')return 'campaign-status live';return 'campaign-status'}

export default function Campaigns(){
 const [auth,setAuth]=useState<'loading'|'guest'|'ready'>('loading'); const [items,setItems]=useState<Campaign[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [refreshing,setRefreshing]=useState(false); const [queryText,setQueryText]=useState(''); const [statusFilter,setStatusFilter]=useState('all');
 async function load(showRefresh=false){if(showRefresh)setRefreshing(true);else setLoading(true);setError('');try{const r=await fetch('/api/campaigns',{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not load campaigns');setItems(d.campaigns||[])}catch(e:any){setError(e.message||'Could not load campaigns')}finally{setLoading(false);setRefreshing(false)}}
 useEffect(()=>{(async()=>{try{const sd=await getAuthStatus();if(!sd.connected){setAuth('guest');return;}setAuth('ready');await load()}catch{setAuth('guest')}})()},[]);
 const filtered=useMemo(()=>items.filter(x=>{const q=queryText.trim().toLowerCase();const matchesSearch=!q||x.subject.toLowerCase().includes(q)||(x.source_name||'').toLowerCase().includes(q);const matchesStatus=statusFilter==='all'||x.status===statusFilter;return matchesSearch&&matchesStatus}),[items,queryText,statusFilter]);
 const stats=useMemo(()=>({total:items.length,sent:items.reduce((n,x)=>n+x.sent_count,0),failed:items.reduce((n,x)=>n+x.failed_count,0),recipients:items.reduce((n,x)=>n+x.total_recipients,0)}),[items]);
 if(auth==='loading') return <LoadingScreen/>; if(auth==='guest') return <LoginRequired title="Your campaigns are private" description="Sign in with Google to view campaign history, delivery status and recipient details."/>;
 return <>
  <div className="floating-page-head campaigns-head"><div><div className="eyebrow">CAMPAIGNS</div><h1>Everything you’ve sent.</h1><p>A clean history of your campaigns, delivery results and source lists — synced to your workspace.</p></div><div className="head-stack"><button className="ghost-btn" onClick={()=>load(true)} disabled={refreshing}>{refreshing?<span className="button-loading-skeleton" aria-hidden="true"/>:'Refresh'}</button><Link href="/dashboard" className="btn btn-primary">New campaign <span>→</span></Link></div></div>
  {error&&<div className="floating-alert">{error}<button onClick={()=>load()} className="alert-action">Try again</button></div>}
  <section className="campaign-overview">
   <div className="campaign-overview-card"><span>Total campaigns</span><strong>{loading?'—':stats.total}</strong><small>Stored in PostgreSQL</small></div>
   <div className="campaign-overview-card"><span>Recipients processed</span><strong>{loading?'—':stats.recipients.toLocaleString()}</strong><small>Across all campaigns</small></div>
   <div className="campaign-overview-card"><span>Emails sent</span><strong className="success-text">{loading?'—':stats.sent.toLocaleString()}</strong><small>Successful deliveries</small></div>
   <div className="campaign-overview-card"><span>Failed</span><strong className={stats.failed?'danger-text':''}>{loading?'—':stats.failed.toLocaleString()}</strong><small>Needs attention</small></div>
  </section>
  <section className="campaigns-panel float-panel">
   <div className="campaigns-toolbar"><div><h2>Campaign history</h2><p>{loading ? `${filtered.length ? filtered.length : ''}` : `${filtered.length} ${filtered.length===1?'campaign':'campaigns'} shown`}</p></div><div className="filter-row"><label className="search-wrap">⌕<input value={queryText} onChange={e=>setQueryText(e.target.value)} placeholder="Search campaigns…"/></label><SelectMenu className="filter-select" value={statusFilter} onChange={setStatusFilter} options={[{value:'all',label:'All statuses'},{value:'draft',label:'Drafts'},{value:'scheduled',label:'Scheduled'},{value:'sending',label:'Sending'},{value:'completed',label:'Completed'},{value:'completed_with_errors',label:'Completed with errors'},{value:'failed',label:'Failed'}]} aria-label="Campaign status" /></div></div>
   {loading?<div className="campaign-loading" role="status" aria-label="Loading campaigns">
      <div className="campaign-skeleton-head"><span/><span/><span/><span/><span/></div>
      {Array.from({length:5}).map((_,i)=><div className="campaign-skeleton-row" key={i}><span/><span/><span/><span/><span/></div>)}
      
    </div>:!filtered.length?<div className="empty-state campaign-empty"><div className="empty-icon">▤</div><h2>{items.length?'No matching campaigns':'No campaigns yet'}</h2><p>{items.length?'Try a different search.':'Your completed campaigns will appear here with delivery details.'}</p>{!items.length&&<Link href="/dashboard" className="btn btn-secondary">Create your first campaign →</Link>}</div>:<div className="campaign-table"><div className="campaign-row campaign-header"><span>Campaign</span><span>Audience</span><span>Sent</span><span>Failed</span><span>Delivery</span><span>Date</span></div>{filtered.map(x=>{const total=Math.max(0,Number(x.total_recipients)||0);const sent=Math.min(total,Math.max(0,Number(x.sent_count)||0));const pct=total?Math.round((sent/total)*100):0;return <Link href={`/campaigns/${x.id}`} className="campaign-row campaign-row-link" key={x.id}><span className="campaign-main"><span className="campaign-name-row"><b>{x.subject||'Untitled campaign'}</b><i className={`campaign-status-dot ${x.status==='completed'?'is-complete':''}`} aria-hidden="true" /></span><span className="campaign-meta-row"><em>{statusLabel(x.status)}</em><span>{x.source_name||'Manual list'}</span>{x.attachment_name&&<><span className="campaign-meta-sep">•</span><span className="campaign-file" title={x.attachment_name}>{x.attachment_name}</span></>}</span></span><span><b>{x.total_recipients.toLocaleString()}</b></span><span><b className="success-text">{x.sent_count.toLocaleString()}</b></span><span><b className={x.failed_count?'danger-text':''}>{x.failed_count.toLocaleString()}</b></span><span className="campaign-delivery-cell"><b>{pct}%</b><i className="mini-progress" aria-label={`${pct}% delivered`}><em style={{width:`${pct}%`}} /></i></span><span><b>{new Date(x.created_at).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</b><small>{new Date(x.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small></span></Link>})}</div>}
  </section>
 </>
}
