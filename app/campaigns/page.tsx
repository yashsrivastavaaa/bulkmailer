'use client';
import Link from 'next/link';
import LoginRequired from '@/components/LoginRequired';
import LoadingScreen from '@/components/LoadingScreen';
import {useEffect,useMemo,useState} from 'react';

type Campaign={id:string;subject:string;source_name?:string;attachment_name?:string;total_recipients:number;sent_count:number;failed_count:number;status:string;created_at:string;completed_at?:string};

function statusLabel(status:string){return status.replaceAll('_',' ')}
function statusClass(status:string){if(status==='completed')return 'campaign-status success';if(status.includes('error')||status==='failed')return 'campaign-status danger';if(status==='sending')return 'campaign-status live';return 'campaign-status'}

export default function Campaigns(){
 const [auth,setAuth]=useState<'loading'|'guest'|'ready'>('loading'); const [items,setItems]=useState<Campaign[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [refreshing,setRefreshing]=useState(false); const [queryText,setQueryText]=useState('');
 async function load(showRefresh=false){if(showRefresh)setRefreshing(true);else setLoading(true);setError('');try{const r=await fetch('/api/campaigns',{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not load campaigns');setItems(d.campaigns||[])}catch(e:any){setError(e.message||'Could not load campaigns')}finally{setLoading(false);setRefreshing(false)}}
 useEffect(()=>{(async()=>{try{const sr=await fetch('/api/auth/status',{cache:'no-store'});const sd=await sr.json();if(!sd.connected){setAuth('guest');return;}setAuth('ready');await load()}catch{setAuth('guest')}})()},[]);
 const filtered=useMemo(()=>items.filter(x=>!queryText.trim()||x.subject.toLowerCase().includes(queryText.toLowerCase())||(x.source_name||'').toLowerCase().includes(queryText.toLowerCase())),[items,queryText]);
 const stats=useMemo(()=>({total:items.length,sent:items.reduce((n,x)=>n+x.sent_count,0),failed:items.reduce((n,x)=>n+x.failed_count,0),recipients:items.reduce((n,x)=>n+x.total_recipients,0)}),[items]);
 if(auth==='loading') return <LoadingScreen/>; if(auth==='guest') return <LoginRequired title="Your campaigns are private" description="Sign in with Google to view campaign history, delivery status and recipient details."/>;
 return <>
  <div className="floating-page-head campaigns-head"><div><div className="eyebrow">CAMPAIGNS</div><h1>Everything you’ve sent.</h1><p>A clean history of your campaigns, delivery results and source lists — synced to your workspace.</p></div><div className="head-stack"><button className="ghost-btn" onClick={()=>load(true)} disabled={refreshing}>{refreshing?<><span className="button-spinner"/>Refreshing…</>:'Refresh'}</button><Link href="/dashboard" className="btn btn-primary">New campaign <span>→</span></Link></div></div>
  {error&&<div className="floating-alert">{error}<button onClick={()=>load()} className="alert-action">Try again</button></div>}
  <section className="campaign-overview">
   <div className="campaign-overview-card"><span>Total campaigns</span><strong>{loading?'—':stats.total}</strong><small>Stored in PostgreSQL</small></div>
   <div className="campaign-overview-card"><span>Recipients processed</span><strong>{loading?'—':stats.recipients.toLocaleString()}</strong><small>Across all campaigns</small></div>
   <div className="campaign-overview-card"><span>Emails sent</span><strong className="success-text">{loading?'—':stats.sent.toLocaleString()}</strong><small>Successful deliveries</small></div>
   <div className="campaign-overview-card"><span>Failed</span><strong className={stats.failed?'danger-text':''}>{loading?'—':stats.failed.toLocaleString()}</strong><small>Needs attention</small></div>
  </section>
  <section className="campaigns-panel float-panel">
   <div className="campaigns-toolbar"><div><h2>Campaign history</h2><p>{loading ? `${filtered.length ? filtered.length : ''}` : `${filtered.length} ${filtered.length===1?'campaign':'campaigns'} shown`}</p></div><label className="search-wrap">⌕<input value={queryText} onChange={e=>setQueryText(e.target.value)} placeholder="Search campaigns…"/></label></div>
   {loading?<div className="campaign-loading-orb" role="status" aria-label="Loading campaigns"><div className="loading-orb"/></div>:!filtered.length?<div className="empty-state campaign-empty"><div className="empty-icon">▤</div><h2>{items.length?'No matching campaigns':'No campaigns yet'}</h2><p>{items.length?'Try a different search.':'Your completed campaigns will appear here with delivery details.'}</p>{!items.length&&<Link href="/dashboard" className="btn btn-secondary">Create your first campaign →</Link>}</div>:<div className="campaign-table"><div className="campaign-row campaign-header"><span>Campaign</span><span>Audience</span><span>Delivery</span><span>Status</span><span>Created</span></div>{filtered.map(x=>{const pct=x.total_recipients?Math.round((x.sent_count/x.total_recipients)*100):0;return <Link href={`/campaigns/${x.id}`} className="campaign-row campaign-row-link" key={x.id}><span className="campaign-main"><b>{x.subject||'Untitled campaign'}</b><small>{x.source_name||'Manual list'}{x.attachment_name?` · ${x.attachment_name}`:''}</small></span><span><b>{x.total_recipients.toLocaleString()}</b><small>recipients</small></span><span><b>{x.sent_count.toLocaleString()} sent</b><small className={x.failed_count?'danger-text':''}>{x.failed_count?`${x.failed_count} failed · `:''}{pct}% delivered</small></span><span><span className={statusClass(x.status)}><i/>{statusLabel(x.status)}</span>{x.completed_at&&<small>Completed</small>}</span><span><b>{new Date(x.created_at).toLocaleDateString()}</b><small>{new Date(x.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small></span></Link>})}</div>}
  </section>
 </>
}
