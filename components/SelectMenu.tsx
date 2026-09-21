'use client';
import { useEffect, useRef, useState } from 'react';

type Option = { value: string; label: string };
type Props = { value:string; onChange:(value:string)=>void; options:Option[]; className?:string; disabled?:boolean; 'aria-label'?:string };

export default function SelectMenu({ value, onChange, options, className='', disabled=false, 'aria-label': ariaLabel }: Props) {
  const [open,setOpen]=useState(false);
  const [activeIndex,setActiveIndex]=useState(0);
  const ref=useRef<HTMLDivElement>(null);
  const triggerRef=useRef<HTMLButtonElement>(null);
  const optionRefs=useRef<Array<HTMLButtonElement|null>>([]);
  const selected=options.find(o=>o.value===value)?.label ?? value;

  useEffect(()=>{ const fn=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)}; document.addEventListener('mousedown',fn); return()=>document.removeEventListener('mousedown',fn)},[]);
  useEffect(()=>{ if(!open)return; const index=Math.max(0,options.findIndex(o=>o.value===value)); setActiveIndex(index); requestAnimationFrame(()=>optionRefs.current[index]?.focus()); },[open,options,value]);

  function choose(index:number){const option=options[index];if(!option)return;onChange(option.value);setOpen(false)}
  function onTriggerKeyDown(e:React.KeyboardEvent<HTMLButtonElement>){if(['ArrowDown','ArrowUp','Enter',' '].includes(e.key)){e.preventDefault();setOpen(true)}}
  function onOptionKeyDown(e:React.KeyboardEvent<HTMLButtonElement>,index:number){
    if(e.key==='Escape'){e.preventDefault();setOpen(false);triggerRef.current?.focus();return}
    if(e.key==='Tab'){setOpen(false);return}
    if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(index);return}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='Home'||e.key==='End'){
      e.preventDefault(); const next=e.key==='Home'?0:e.key==='End'?options.length-1:(index+(e.key==='ArrowDown'?1:-1)+options.length)%options.length;
      setActiveIndex(next); optionRefs.current[next]?.focus();
    }
  }
  return <div ref={ref} className={`select-menu ${className} ${open?'is-open':''}`}>
    <button ref={triggerRef} type="button" className="select-menu-trigger" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel} onClick={()=>setOpen(v=>!v)} onKeyDown={onTriggerKeyDown}><span>{selected}</span><span className="select-menu-chevron" aria-hidden="true">⌄</span></button>
    {open && <div className="select-menu-popover" role="listbox" aria-label={ariaLabel}>
      {options.map((o,index)=><button ref={node=>{optionRefs.current[index]=node}} type="button" role="option" tabIndex={index===activeIndex?0:-1} aria-selected={o.value===value} className={`select-menu-option ${o.value===value?'selected':''}`} key={o.value} onClick={()=>choose(index)} onKeyDown={e=>onOptionKeyDown(e,index)}><span>{o.label}</span>{o.value===value&&<span className="select-menu-check">✓</span>}</button>)}
    </div>}
  </div>
}
