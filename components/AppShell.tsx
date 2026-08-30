"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import LoginRequired from "@/components/LoginRequired";
import LoadingScreen from "@/components/LoadingScreen";
import { getAuthStatus, clearAuthStatusCache } from "@/lib/client-auth";

const items = [
  ["/dashboard", "⌂", "Dashboard"],
  ["/campaigns", "▤", "Campaigns"],
  ["/contacts", "◎", "Contacts"],
  ["/templates", "✦", "Templates"],
  ["/analytics", "◒", "Analytics"],
  ["/pricing", "◇", "Plans"],
  ["/settings", "⚙", "Settings"],
  ["/profile", "◉", "Profile"],
] as const;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const publicPage = ["/", "/pricing", "/help", "/privacy", "/terms"].includes(path);
  const [authLoading, setAuthLoading] = useState(!publicPage);
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<any>({ name: "Free", remainingThisMonth: 100, monthlySendLimit: 100 });
  const [role, setRole] = useState("user");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (publicPage) return;
    let cancelled = false;
    setAuthLoading(true);
    getAuthStatus().then((d) => {
      if (cancelled) return;
      setConnected(!!d.connected);
      setEmail(d.email || "");
      setPlan(d.plan || { name: "Free", remainingThisMonth: 100, monthlySendLimit: 100 });
      setRole(d.role || "user");
    }).catch(() => {}).finally(() => { if (!cancelled) setAuthLoading(false); });
    return () => { cancelled = true; };
  }, [publicPage]);

  useEffect(() => {
    if (!profileOpen) return;
    const close = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.profile-menu-wrap')) setProfileOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setProfileOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escape); };
  }, [profileOpen]);

  if (path === "/") return <>{children}</>;

  if (publicPage) return (
    <div className="public-shell">
      <header className="public-topbar">
        <Link href="/" className="floating-brand"><span className="logo-mark">B</span><span>bulkmailer</span></Link>
        <nav><Link href="/">Home</Link><a href="/#workflow">Workflow</a><a href="/#features">Features</a><Link href="/pricing">Pricing</Link><Link href="/help">Help</Link></nav>
        <div className="public-actions"><ThemeToggle/><Link href="/dashboard" className="btn btn-primary">Open workspace →</Link></div>
      </header>
      <main className="public-content">{children}</main>
    </div>
  );

  if (authLoading) return <LoadingScreen label="Loading workspace"/>;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearAuthStatusCache();
    window.location.href = "/";
  }

  if (!connected) return (
    <div className="guest-shell">
      <header className="guest-topbar"><Link href="/" className="floating-brand"><span className="logo-mark">B</span><span>bulkmailer</span></Link><div className="guest-actions"><ThemeToggle/><Link href="/" className="ghost-btn">Back to home</Link></div></header>
      <main className="guest-content"><LoginRequired title="Sign in to open your workspace" description="Connect your Google account to access campaigns, contacts, templates, analytics and sending tools." /></main>
    </div>
  );

  return (
    <div className="app-shell">
      <nav className="floating-nav" aria-label="Primary navigation">
        <Link href="/" className="floating-brand" aria-label="Bulkmailer home">
          <span className="logo-mark">B</span><span>bulkmailer</span>
        </Link>
        <div className="floating-nav-items">
          <div className="nav-caption">Workspace</div>
          {items.slice(0, 5).map(([href, icon, label]) => {
            const active = path === href || (href !== "/dashboard" && path.startsWith(href));
            return <Link key={href} href={href} className={`floating-nav-item ${active ? "active" : ""}`}><span className="floating-nav-icon">{icon}</span><span>{label}</span></Link>;
          })}
          <div className="nav-caption">Account</div>
          {items.slice(5).map(([href, icon, label]) => {
            const active = path === href || path.startsWith(href);
            return <Link key={href} href={href} className={`floating-nav-item ${active ? "active" : ""}`}><span className="floating-nav-icon">{icon}</span><span>{label}</span></Link>;
          })}
          {role === "admin" && <Link href="/admin" className={`floating-nav-item admin-nav ${path.startsWith("/admin") ? "active" : ""}`}><span className="floating-nav-icon">◆</span><span>Admin</span></Link>}
        </div>
        <div className="sidebar-spacer" />
        <div className="sidebar-plan">
          <div className="sidebar-plan-top"><strong>{plan?.name || "Free"}</strong><span>PLAN</span></div>
          <small>{Number(plan?.remainingThisMonth ?? plan?.monthlySendLimit ?? 100).toLocaleString()} sends remaining this month</small>
        </div>
      </nav>

      <div className="main-area">
        <header className="floating-topbar">
          <div className="topbar-context"><span className="context-dot" /><span>{path === "/dashboard" ? "Workspace" : path.split("/")[1]?.replace(/-/g, " ") || "Workspace"}</span></div>
          <div className="topbar-spacer" />
          <div className="topbar-status"><span className={`status-dot ${connected ? "online" : ""}`} /><span>{connected ? "Gmail connected" : "Gmail not connected"}</span></div>
          <div className="topbar-tools"><ThemeToggle /><div className="profile-menu-wrap">
            <button type="button" className={`account-pill profile-trigger ${profileOpen ? "open" : ""}`} aria-expanded={profileOpen} onClick={() => setProfileOpen(v => !v)}>
              <span className="avatar">{email.slice(0, 1).toUpperCase() || "B"}</span>
              <span className="profile-trigger-copy"><b>{email ? email.split("@")[0] : "Workspace"}</b><small>{email || "Free plan"}</small></span>
              <span className="profile-chevron">⌄</span>
            </button>
            {profileOpen && <div className="profile-menu">
              <div className="profile-menu-head"><span className="avatar large">{email.slice(0, 1).toUpperCase() || "B"}</span><div><b>{email || "Workspace user"}</b><small>{plan?.name || "Free"} plan · Gmail connected</small></div></div>
              <div className="profile-menu-stat"><span>Monthly sends</span><b>{Number(plan?.remainingThisMonth ?? 100).toLocaleString()} remaining</b></div>
              <Link href="/profile" onClick={() => setProfileOpen(false)}>Profile settings <span>→</span></Link>
              <button type="button" className="profile-logout" onClick={logout}>Log out <span>↗</span></button>
            </div>}
          </div></div>
        </header>
        <main className="content">{children}</main>
      </div>

      <div className="mobile-nav-wrap">
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {items.map(([href, icon, label]) => {
            const active = path === href || (href !== "/dashboard" && path.startsWith(href));
            return <Link key={href} href={href} className={active ? "active" : ""}><span>{icon}</span><small>{label}</small></Link>;
          })}
        </nav>
      </div>
    </div>
  );
}
