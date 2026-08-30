'use client';
import {useEffect,useState} from 'react';
import LoginRequired from '@/components/LoginRequired';
import LoadingScreen from '@/components/LoadingScreen';
import { getAuthStatus } from '@/lib/client-auth';

export default function Templates(){
 const [auth,setAuth]=useState<'loading'|'guest'|'ready'>('loading');
 const [templates,setTemplates]=useState<any[]>([]); const [query,setQuery]=useState(''); const [loading,setLoading]=useState(false); const [saving,setSaving]=useState(false); const [form,setForm]=useState({name:'',subject:'',body:''}); const [error,setError]=useState('');
 async function boot(){
   try{const sd=await getAuthStatus();if(!sd.connected){setAuth('guest');return;}setAuth('ready');setLoading(true);
   const r=await fetch('/api/templates',{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not load templates');setTemplates(d.templates||[])}
   catch(e:any){setError(e.message||'Could not load templates')}finally{setLoading(false)}
 }
 useEffect(()=>{boot()},[]);
 function insert(token:string){setForm(v=>({...v,body:v.body+token}))}
 async function add(){setError('');if(!form.name||!form.subject||!form.body){setError('Complete all template fields.');return}setSaving(true);try{const r=await fetch('/api/templates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not save');setTemplates(v=>[d.template,...v]);setForm({name:'',subject:'',body:''})}catch(e:any){setError(e.message||'Could not save')}finally{setSaving(false)}}
 const filteredTemplates=templates.filter(t=>!query.trim()||String(t.name||'').toLowerCase().includes(query.toLowerCase())||String(t.subject||'').toLowerCase().includes(query.toLowerCase())||String(t.body||'').toLowerCase().includes(query.toLowerCase()));
 if(auth==='loading')return <LoadingScreen/>;
 if(auth==='guest')return <LoginRequired title="Your templates are private" description="Sign in with Google to create, save and reuse message templates."/>;

 return <div>
  <div className="floating-page-head"><div><div className="eyebrow">TEMPLATES</div><h1>Your message library.</h1><p>Build reusable messages once, then personalize them for every recipient.</p></div></div>
  {error&&<div className="floating-alert">{error}</div>}
  <div className="templates-shell">
   <section className="float-panel template-composer">
    <div className="template-composer-header"><div><div className="template-form-kicker">NEW TEMPLATE</div><h2>Create a reusable message</h2><p>Keep frequently used outreach, invoices, updates and follow-ups ready to send.</p></div><span className="template-status">{templates.length} saved</span></div>
    <div className="template-input-wrap"><label>Name</label><input value={form.name} placeholder="e.g. Invoice reminder" onChange={e=>setForm({...form,name:e.target.value})}/></div>
    <div className="template-input-wrap"><label>Subject</label><input value={form.subject} placeholder="e.g. Your invoice {{Invoice Number}}" onChange={e=>setForm({...form,subject:e.target.value})}/></div>
    <div className="template-input-wrap"><label>Message <span>Dynamic fields supported</span></label><textarea value={form.body} placeholder="Hi {{name}},&#10;&#10;Write your message here…" onChange={e=>setForm({...form,body:e.target.value})}/></div>
    <div className="template-token-row"><button type="button" className="template-token" onClick={()=>insert('{{name}}')}>{'{{name}}'}</button><button type="button" className="template-token" onClick={()=>insert('{{email}}')}>{'{{email}}'}</button><span className="template-token">Any Excel column</span></div>
    <button className="btn btn-primary template-save-wide" onClick={add} disabled={saving}>{saving?<span className="button-loading-skeleton" aria-hidden="true"/>:'Save template'}</button>
   </section>
   <section className="template-library"><div className="template-filter-bar"><label className="search-wrap">⌕<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search templates…"/></label><span>{filteredTemplates.length} shown</span></div>
    {loading?<div className="float-panel template-library-empty template-loading-state"><div className="template-skeleton-card"><span/><span/><span/><span/></div><div className="template-skeleton-card"><span/><span/><span/><span/></div></div>:filteredTemplates.length?filteredTemplates.map(t=><article className="float-panel template-library-card" key={t.id}><span className="source-pill">SAVED</span><h3>{t.name}</h3><p>{t.subject}</p><p className="template-body">{t.body}</p></article>):<div className="float-panel template-library-empty"><div className="empty-icon">✦</div><h3>Your library is empty</h3><p>Save your first reusable message and it will appear here.</p></div>}
   </section>
  </div>
 </div>
}