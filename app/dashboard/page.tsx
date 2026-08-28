'use client';
import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import ConnectCard from '@/components/ConnectCard';

type Recipient={email:string;name?:string;row?:number;source:'excel'|'paste'};
type Attachment={filename:string;contentType:string;data:string;size:number};
function normalizeEmail(v:unknown){return String(v??'').trim().toLowerCase()}
function escapeHtml(v:string){return v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}
function extractEmails(text:string){
 const tokens=text.split(/[\s,;]+/).map(s=>s.trim().replace(/^<|>$/g,'')).filter(Boolean);
 const found:string[]=[]; const seen=new Set<string>();
 for(const token of tokens){
   const match=token.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
   if(match){const email=normalizeEmail(match[0]); if(!seen.has(email)){seen.add(email);found.push(email)}}
 }
 return found;
}

export default function Dashboard(){
 const [connected,setConnected]=useState(false),[account,setAccount]=useState('');
 const [plan,setPlan]=useState<any>(null);
 const [recipients,setRecipients]=useState<Recipient[]>([]),[selected,setSelected]=useState<Set<string>>(new Set()),[fileName,setFileName]=useState('');
 const [paste,setPaste]=useState(''),[search,setSearch]=useState('');
 const [attachment,setAttachment]=useState<Attachment|null>(null),[subject,setSubject]=useState(''),[body,setBody]=useState('');
 const [logs,setLogs]=useState<string[]>([]),[sending,setSending]=useState(false),[error,setError]=useState(''),[done,setDone]=useState(0);
 const valid=useMemo(()=>recipients.filter(r=>r.email),[recipients]);
 const filtered=useMemo(()=>valid.filter(r=>!search.trim() || r.email.includes(search.trim().toLowerCase()) || (r.name||'').toLowerCase().includes(search.trim().toLowerCase())),[valid,search]);
 const selectedRecipients=useMemo(()=>valid.filter(r=>selected.has(r.email)),[valid,selected]);
 const allSelected=filtered.length>0 && filtered.every(r=>selected.has(r.email));
 async function status(){try{const r=await fetch('/api/auth/status',{cache:'no-store'});const d=await r.json();setConnected(d.connected);setAccount(d.email||'');setPlan(d.plan||null)}catch{}}
 useEffect(()=>{status();const p=new URLSearchParams(location.search);const e=p.get('error');if(e)setError(e==='oauth_failed'?'Google authorization failed. Check the server terminal/logs and OAuth client settings.':e==='no_refresh_token'?'Google did not return a refresh token. Disconnect/revoke Bulkmailer access in Google Account, then reconnect.':e==='oauth_state'?'OAuth session expired. Start Connect Gmail again.':'Google connection could not be completed.');if(p.has('connected'))window.history.replaceState({},'',location.pathname)},[]);
 function replaceRecipients(next:Recipient[], message:string){
   const map=new Map(recipients.map(r=>[r.email,r])); for(const r of next) if(!map.has(r.email)) map.set(r.email,r);
   const merged=[...map.values()]; setRecipients(merged); setSelected(prev=>{const s=new Set(prev);for(const r of next)s.add(r.email);return s});setLogs(v=>[...v,message]);
 }
 async function loadExcel(e:React.ChangeEvent<HTMLInputElement>){setError('');const f=e.target.files?.[0];if(!f)return;setFileName(f.name);try{const wb=XLSX.read(await f.arrayBuffer());const ws=wb.Sheets[wb.SheetNames[0]];const rows=XLSX.utils.sheet_to_json<any[]>(ws,{header:1,defval:''});if(!rows.length)throw new Error('Excel file is empty.');const header=rows[0].map((x:any)=>String(x).trim().toLowerCase());let emailIdx=header.findIndex(x=>['email','email address','e-mail'].includes(x));let nameIdx=header.findIndex(x=>['name','full name','recipient name'].includes(x));if(emailIdx<0)emailIdx=0;const out:Recipient[]=[];const incoming=new Set<string>();rows.slice(1).forEach((r:any[],i)=>{const email=normalizeEmail(r[emailIdx]);if(email && !incoming.has(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){incoming.add(email);out.push({email,name:nameIdx>=0?String(r[nameIdx]||'').trim():undefined,row:i+2,source:'excel'})}});if(!out.length)throw new Error('No valid recipient emails found. Put an Email column in the first sheet.');replaceRecipients(out,`Loaded ${out.length} unique recipients from ${f.name}`);setDone(0);}catch(err:any){setError(err.message||'Could not read Excel.')}}
 function addPastedEmails(){setError('');const emails=extractEmails(paste);if(!emails.length){setError('No valid email addresses found in the pasted text.');return}const before=recipients.length;replaceRecipients(emails.map(email=>({email,source:'paste'})),`Added ${emails.filter(e=>!recipients.some(r=>r.email===e)).length} new pasted recipients`);setPaste('');setDone(0);if(before===0)setFileName('Pasted emails')}
 async function loadAttachment(e:React.ChangeEvent<HTMLInputElement>){setError('');const f=e.target.files?.[0];if(!f)return;if(f.size>4*1024*1024){setError('For this web flow, attachments are limited to 4 MB.');return}const b=await f.arrayBuffer();let binary='';const bytes=new Uint8Array(b);for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));setAttachment({filename:f.name,contentType:f.type||'application/octet-stream',data:btoa(binary),size:f.size});}
 function clearRecipients(){setRecipients([]);setSelected(new Set());setFileName('');setPaste('');setDone(0);setLogs([])}
 async function send(){setError('');if(!connected)return setError('Connect Gmail first.');if(!selectedRecipients.length)return setError('Select at least one recipient.');if(!subject.trim()||!body.trim())return setError('Subject and email body are required.');if(!confirm(`You are about to send ${selectedRecipients.length} emails. Continue?`))return;setSending(true);setDone(0);setLogs([]);let success=0;let campaignId='';try{const cr=await fetch('/api/campaigns',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subject,sourceName:fileName,attachmentName:attachment?.filename,recipients:selectedRecipients})});const cd=await cr.json();if(!cr.ok)throw new Error(cd.error||'Could not create campaign');campaignId=cd.campaignId;}catch(e:any){setSending(false);return setError(e.message||'Could not create campaign.')}for(let i=0;i<selectedRecipients.length;i++){const r=selectedRecipients[i];setLogs(v=>[...v,`Sending ${i+1}/${selectedRecipients.length} → ${r.email}`]);const personalized=body.replaceAll('{{name}}',escapeHtml(r.name||'')).replaceAll('{{email}}',escapeHtml(r.email));try{const res=await fetch('/api/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:r.email,subject,html:personalized.replace(/\n/g,'<br>'),attachment,campaignId})});const d=await res.json();if(!res.ok)throw new Error(d.error||'Failed');success++;setDone(i+1);setLogs(v=>[...v,`✓ Sent ${i+1}/${selectedRecipients.length} → ${r.email}`]);}catch(err:any){setLogs(v=>[...v,`✗ Failed → ${r.email}: ${err.message||'Unknown error'}`]);}}setSending(false);await status();setLogs(v=>[...v,`Finished — ${success} sent, ${selectedRecipients.length-success} failed.`]);if(campaignId){await fetch(`/api/campaigns/${campaignId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:success===selectedRecipients.length?'completed':'completed_with_errors',failed:selectedRecipients.length-success})});}try{const existing=JSON.parse(localStorage.getItem('bulkmailer_campaigns')||'[]');existing.unshift({id:crypto.randomUUID(),date:new Date().toISOString(),file:fileName,subject,recipients:selectedRecipients.length,sent:success,failed:selectedRecipients.length-success,attachment:attachment?.filename||null});localStorage.setItem('bulkmailer_campaigns',JSON.stringify(existing.slice(0,25)));}catch{} }
 return <>
   <div className="floating-page-head">
     <div><div className="eyebrow">CAMPAIGN WORKSPACE</div><h1>Create something worth sending.</h1><p>Build, personalize and review your campaign before a single email leaves your Gmail.</p></div>
     <div className="head-stack"><div className={`connection-pill ${connected?'is-on':''}`}><span/> {connected ? `Gmail · ${account}` : 'Gmail not connected'}</div><div className="plan-pill"><b>{plan?.name || 'Free'}</b><span>{plan?.monthlySendLimit ?? 100} sends / month</span></div></div>
   </div>
   {error&&<div className="floating-alert">{error}</div>}
   {!connected&&<ConnectCard />}
   <section className="floating-metrics">
     <div className="float-stat"><span>Recipients</span><strong>{valid.length}</strong><small>{fileName||'Waiting for a list'}</small></div>
     <div className="float-stat"><span>Selected</span><strong>{selectedRecipients.length}</strong><small>{valid.length ? `${Math.round(selectedRecipients.length/valid.length*100)}% of loaded` : 'Nothing selected'}</small></div>
     <div className="float-stat"><span>Mails remaining</span><strong>{Number(plan?.remainingThisMonth ?? plan?.monthlySendLimit ?? 100).toLocaleString()}</strong><small>{plan?.name || 'Free'} · {Number(plan?.usedThisMonth ?? 0).toLocaleString()} used this month</small></div>
     <div className="float-stat"><span>This run</span><strong>{done}</strong><small>{sending?'Sending now':`${selectedRecipients.length} selected`}</small></div>
   </section>
   <div className="floating-workspace">
    <section className="float-panel recipients-panel">
      <div className="float-panel-head"><div><span className="step-badge">01</span><div><h2>Who are you sending to?</h2><p>Upload a spreadsheet or paste addresses. Every row stays selectable.</p></div></div><button className="ghost-btn" onClick={clearRecipients} disabled={!valid.length}>Clear</button></div>
      <div className="source-grid">
       <label className="drop-card"><input type="file" accept=".xlsx,.xls,.csv" onChange={loadExcel}/><div className="drop-icon">↑</div><b>Drop or choose spreadsheet</b><span>Excel / CSV · first sheet · email column detected</span></label>
       <div className="paste-card"><div className="card-label"><b>Paste addresses</b><span>comma · space · ; · newline</span></div><textarea value={paste} onChange={e=>setPaste(e.target.value)} placeholder={'name@example.com\nteam@example.com, billing@example.com'}/><button className="dark-btn small" onClick={addPastedEmails} disabled={!paste.trim()}>Add recipients</button></div>
      </div>
      {valid.length>0&&<>
       <div className="recipient-toolbar"><div className="toolbar-left"><label className="search-wrap">⌕<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search recipients..."/></label><span>{selectedRecipients.length} selected · {valid.length} loaded</span></div><div className="toolbar-actions"><button onClick={()=>setSelected(new Set(filtered.map(r=>r.email)))}>Check visible</button><button onClick={()=>setSelected(prev=>{const n=new Set(prev);filtered.forEach(r=>n.delete(r.email));return n})}>Uncheck visible</button></div></div>
       <div className="recipient-list">
        <div className="recipient-row recipient-head"><span></span><span>Recipient</span><span>Source</span><span>Status</span></div>
        {filtered.map(r=><label className="recipient-row" key={r.email}><input type="checkbox" checked={selected.has(r.email)} onChange={()=>setSelected(prev=>{const n=new Set(prev);n.has(r.email)?n.delete(r.email):n.add(r.email);return n})}/><span><b>{r.name||r.email.split('@')[0]}</b><small>{r.email}</small></span><span className="row-source">{r.source}</span><span className="row-status">Ready</span></label>)}
       </div>
      </>}
    </section>
    <section className="float-panel compose-panel">
      <div className="float-panel-head"><div><span className="step-badge">02</span><div><h2>Compose the message</h2><p>Personalize using your spreadsheet columns and review before sending.</p></div></div></div>
      <label className="field-label">Subject<input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Your subject line"/></label>
      <div className="merge-tools"><span>Insert field</span><button onClick={()=>setBody(v=>v+' {{name}}')}>Name</button><button onClick={()=>setBody(v=>v+' {{email}}')}>Email</button><span className="muted">Add more spreadsheet fields in the full composer.</span></div>
      <label className="field-label">Message<textarea className="message-box" value={body} onChange={e=>setBody(e.target.value)} placeholder="Write a clear, human email..."/></label>
      <label className="attachment-card"><input type="file" onChange={loadAttachment}/><div><b>{attachment?attachment.filename:'Attach a file'}</b><span>{attachment?`${(attachment.size/1024/1024).toFixed(2)} MB · ready for every selected recipient`:'Up to 4 MB in this browser flow'}</span></div><strong>+</strong></label>
      {attachment&&<button className="remove-link" onClick={()=>setAttachment(null)}>Remove attachment</button>}
      <div className="review-card"><div><span>Ready to send</span><strong>{selectedRecipients.length} recipients</strong></div><button className="send-btn" onClick={send} disabled={sending || !selectedRecipients.length}>{sending?`Sending ${done}/${selectedRecipients.length}`:'Review & send →'}</button></div>
    </section>
   </div>
   <section className="activity-float"><div className="activity-head"><div><span className="step-badge">03</span><div><h2>Sending activity</h2><p>Live delivery events for this campaign.</p></div></div><span className="activity-state">{sending?'LIVE':'IDLE'}</span></div><div className="log-box">{logs.length?logs.map((l,i)=><div key={i}>{l}</div>):<span>Your campaign activity will appear here.</span>}</div></section>
 </>;
}
