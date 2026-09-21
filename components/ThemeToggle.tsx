"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle(){
  const [dark,setDark]=useState(false);
  useEffect(()=>{
    const media=window.matchMedia('(prefers-color-scheme: dark)');
    const apply=()=>{const saved=localStorage.getItem('bulkmailer-theme');const isDark=saved==='dark'||(!saved&&media.matches);document.documentElement.dataset.theme=isDark?'dark':'light';setDark(isDark)};
    apply();
    const onChange=()=>{if(!localStorage.getItem('bulkmailer-theme')) apply()};
    media.addEventListener?.('change',onChange);
    return()=>media.removeEventListener?.('change',onChange);
  },[]);
  function toggle(){const next=!dark;document.documentElement.dataset.theme=next?'dark':'light';localStorage.setItem('bulkmailer-theme',next?'dark':'light');setDark(next)}
  return <button type="button" className="theme-toggle" onClick={toggle} aria-label={dark?'Switch to light mode':'Switch to dark mode'} title={dark?'Switch to light mode':'Switch to dark mode'}><span className="theme-icon">{dark?'☀':'☾'}</span><span>{dark?'Light':'Dark'}</span></button>
}
