'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function ConnectCard({ email }: { email?: string }) {
  const [loading, setLoading] = useState(false);
  return <div className="connect-hero connect-card-premium">
    <div className="connect-copy">
      <div className="connect-brand-row"><span className="google-mark">G</span><div><div className="eyebrow">STEP 1 · CONNECT</div><h2>Connect your Gmail account</h2></div></div>
      <p>Send from your own Gmail identity. Bulkmailer uses Google OAuth and never exposes your Gmail password or client secret to the browser.</p>
      <div className="connect-trust"><span>✓ OAuth secured</span><span>✓ Revoke anytime</span><span>✓ No password stored</span></div>
    </div>
    <Link href="/api/auth/google" className={`connect-google-btn${loading ? ' is-loading' : ''}`} onClick={(e) => { if (loading) { e.preventDefault(); return; } setLoading(true); }} aria-disabled={loading} aria-busy={loading}>
      <span className="google-button-icon">G</span><span>{loading ? 'Connecting…' : 'Continue with Google'}</span><span className="connect-arrow">{loading ? <span className="button-spinner light-spinner"/> : '→'}</span>
    </Link>
  </div>
}
