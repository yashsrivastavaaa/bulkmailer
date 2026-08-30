'use client';
import Link from 'next/link';
import {useCallback,useEffect,useMemo,useState} from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import SelectMenu from '@/components/SelectMenu';

type Recipient={id:string;email:string;name?:string;selected:boolean;status:string;error?:string;sent_at?:string;provider_message_id?:string};
type Campaign={id:string;subject:string;source_name?:string;attachment_name?:string;total_recipients:number;sent_count:number;failed_count:number;status:string;created_at:string;completed_at?:string};

function label(v:string){return v.replaceAll('_',' ')}
function statusClass(v:string){if(v==='sent')return 'campaign-status success';if(v==='failed')return 'campaign-status danger';if(v==='sending')return 'campaign-status live';return 'campaign-status'}

export default function CampaignDetail({params}:{params:Promise<{id:string}>}){
 const [campaign,setCampaign]=useState<Campaign|null>(null);const [recipients,setRecipients]=useState<Recipient[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [search,setSearch]=useState(''); const [statusFilter,setStatusFilter]=useState('all');
 const load=useCallback(async()=>{try{const {id}=await params;const r=await fetch(`/api/campaigns/${id}`,{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not load campaign');setCampaign(d.campaign);setRecipients(d.recipients||[]);setError('')}catch(e:any){setError(e.message||'Could not load campaign')}finally{setLoading(false)}},[params]);
 useEffect(()=>{load()},[load]);
 useEffect(()=>{if(campaign?.status!=='sending')return;const timer=setInterval(load,4000);return()=>clearInterval(timer)},[campaign?.status,load]);
 const filtered=useMemo(()=>recipients.filter(r=>{const q=search.trim().toLowerCase();const matchesSearch=!q||r.email.toLowerCase().includes(q)||(r.name||'').toLowerCase().includes(q);const matchesStatus=statusFilter==='all'||r.status===statusFilter;return matchesSearch&&matchesStatus}),[recipients,search,statusFilter]);
 const counts=useMemo(()=>recipients.reduce((a,r)=>{a[r.status]=(a[r.status]||0)+1;return a},{pending:0,sending:0,sent:0,failed:0} as Record<string,number>),[recipients]);
 if(loading)return <LoadingScreen label="Loading campaign"/>;
 if(error||!campaign)return <div className="floating-alert">{error||'Campaign not found.'} <Link href="/campaigns" className="alert-action">Back to campaigns</Link></div>;
 return <div>
  <div className="floating-page-head">
   <div><Link href="/campaigns" className="back-link">← Campaigns</Link><div className="eyebrow">CAMPAIGN DETAILS</div><h1>{campaign.subject}</h1><p>{campaign.source_name||'Manual list'}{campaign.attachment_name?` · ${campaign.attachment_name}`:''} · Created {new Date(campaign.created_at).toLocaleString()}</p></div>
   <div className="head-stack"><span className={statusClass(campaign.status)}><i/>{label(campaign.status)}</span><button className="ghost-btn" onClick={load}>Refresh</button></div>
  </div>
  <section className="campaign-overview">
   <div className="campaign-overview-card"><span>Total recipients</span><strong>{campaign.total_recipients.toLocaleString()}</strong><small>Recipients in this campaign</small></div>
   <div className="campaign-overview-card"><span>Sent</span><strong className="success-text">{counts.sent.toLocaleString()}</strong><small>Successfully delivered</small></div>
   <div className="campaign-overview-card"><span>Failed</span><strong className={counts.failed?'danger-text':''}>{counts.failed.toLocaleString()}</strong><small>Need attention</small></div>
   <div className="campaign-overview-card"><span>Pending</span><strong>{(counts.pending+counts.sending).toLocaleString()}</strong><small>{counts.sending?'Currently sending':'Awaiting delivery'}</small></div>
  </section>
  <section className="float-panel campaigns-panel">
   <div className="campaigns-toolbar"><div><h2>Recipient activity</h2><p>Live delivery activity for every recipient. Status refreshes automatically while sending.</p></div><div className="filter-row"><label className="search-wrap">⌕<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search email or name…"/></label><SelectMenu className="filter-select" value={statusFilter} onChange={setStatusFilter} options={[{value:"all",label:"All statuses"},{value:"sent",label:"Sent"},{value:"sending",label:"Sending"},{value:"pending",label:"Pending"},{value:"failed",label:"Failed"}]} aria-label="Recipient status" /></div></div>
   {!filtered.length?<div className="empty-state campaign-empty"><h2>No recipients found</h2><p>Try another search.</p></div>:<div className="campaign-table recipient-status-table"><div className="campaign-row campaign-header"><span>Recipient</span><span>Status</span><span>Sent at</span><span>Message ID</span><span>Details</span></div>{filtered.map(r=><div className="campaign-row" key={r.id}><span className="campaign-main"><b>{r.name||r.email.split('@')[0]}</b><small>{r.email}</small></span><span><span className={statusClass(r.status)}><i/>{label(r.status)}</span></span><span><b>{r.sent_at?new Date(r.sent_at).toLocaleDateString():'—'}</b><small>{r.sent_at?new Date(r.sent_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):r.status==='pending'?'Waiting':'—'}</small></span><span><small className="mono-text">{r.provider_message_id||'—'}</small></span><span><small className={r.error?'danger-text':''}>{r.error|| (r.status==='sent'?'Delivered successfully':r.status==='sending'?'Sending now':'Waiting to send')}</small></span></div>)}</div>}
  </section>
 </div>
}
