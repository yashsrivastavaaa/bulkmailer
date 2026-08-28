import Link from 'next/link';

const features = [
  ['01', 'Spreadsheet-native', 'Upload Excel or CSV and keep every column available for personalization.'],
  ['02', 'Human-scale control', 'Select exactly who receives the campaign. Nothing is sent until you review the final count.'],
  ['03', 'Gmail, securely', 'Connect with Google OAuth while secrets and refresh tokens stay server-side.'],
  ['04', 'Built for real work', 'Invoices, billing, recruiting, outreach and operational email all fit the same workflow.'],
];

export default function Landing() {
  return (
    <div className="landing-page">
      <div className="landing-orb orb-one" />
      <div className="landing-orb orb-two" />
      <header className="landing-nav floating-surface">
        <Link href="/" className="brand"><span className="brand-mark">B</span><span>bulkmailer</span></Link>
        <nav className="landing-links">
          <a href="#product">Product</a><a href="#workflow">Workflow</a><a href="#features">Features</a><Link href="/pricing">Pricing</Link>
        </nav>
        <div className="landing-nav-actions"><Link href="/help" className="nav-link">Help</Link><Link href="/dashboard" className="nav-cta">Open workspace <span>↗</span></Link></div>
      </header>

      <main>
        <section className="landing-hero" id="product">
          <div className="hero-copy">
            <div className="hero-kicker"><span className="pulse-dot" /> SPREADSHEET → GMAIL WORKFLOW</div>
            <h1>Email that feels <span>personal.</span><br />Operations that scale.</h1>
            <p>Bulkmailer turns your spreadsheet into a controlled email workspace. Map columns, choose recipients, personalize every message, attach files and review before anything leaves Gmail.</p>
            <div className="hero-actions"><Link href="/dashboard" className="hero-button">Start a campaign <span>→</span></Link><Link href="/pricing" className="hero-secondary">Explore plans</Link></div>
            <div className="trust-row"><span>✓ Excel + CSV</span><span>✓ Dynamic fields</span><span>✓ Gmail OAuth</span><span>✓ Review before send</span></div>
          </div>

          <div className="hero-visual" aria-label="Bulkmailer campaign preview">
            <div className="preview-float preview-mini"><span>CONNECTED</span><b>Gmail</b><small>Ready to send</small></div>
            <div className="mock-window floating-surface">
              <div className="mock-top"><span className="mock-dots"><i /><i /><i /></span><span>Campaign workspace</span><span className="mock-live">● Ready</span></div>
              <div className="mock-body">
                <div className="mock-stat"><div><span>Campaign</span><strong>Invoice follow-up</strong></div><div className="mock-count"><b>184</b><small>selected</small></div></div>
                <div className="mock-list">
                  <div className="mock-list-head"><span>SELECT</span><span>RECIPIENT</span><span>STATUS</span></div>
                  {['Aarav Sharma', 'Priya Singh', 'Rohan Mehta', 'Ananya Verma'].map((name, i) => <div className="mock-row" key={name}><span className="fake-check">✓</span><span><b>{name}</b><small>{name.toLowerCase().replace(' ', '.')}@company.com</small></span><span className="mock-status">Ready</span></div>)}
                </div>
                <div className="mock-fields"><span>{'{{name}}'}</span><span>{'{{Invoice Amount}}'}</span><span>{'{{Due Date}}'}</span></div>
                <div className="mock-send"><span><small>FINAL REVIEW</small><b>184 recipients · 1 attachment</b></span><span className="mock-send-btn">Review & send →</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="floating-strip" id="workflow">
          <div><span className="section-kicker">ONE WORKSPACE</span><h2>Upload. Map. Review. Send.</h2></div>
          <div className="strip-steps"><span><b>01</b> Load your data</span><span><b>02</b> Personalize</span><span><b>03</b> Review selection</span><span><b>04</b> Send through Gmail</span></div>
        </section>

        <section className="feature-section" id="features">
          <div className="section-intro"><div><span className="section-kicker">DESIGNED FOR CONTROL</span><h2>Powerful enough for work.<br /><em>Simple enough to trust.</em></h2></div><p>Every surface is built around one idea: make bulk email feel deliberate instead of dangerous.</p></div>
          <div className="feature-grid">{features.map(([n,title,text]) => <article className="feature-card floating-surface" key={n}><span className="feature-number">{n}</span><h3>{title}</h3><p>{text}</p><span className="feature-arrow">↗</span></article>)}</div>
        </section>

        <section className="usecase-section">
          <div className="usecase-copy"><span className="section-kicker">MORE THAN MARKETING</span><h2>Your spreadsheet already knows the context.</h2><p>Use any column as a merge field — invoice numbers, amounts, due dates, company names, order IDs, application status, account managers and more.</p><Link href="/dashboard" className="hero-secondary">Build a data-driven email →</Link></div>
          <div className="data-card floating-surface"><div className="data-head"><span>customers.xlsx</span><span>12 columns</span></div><div className="data-grid">{['Name','Email','Invoice','Amount','Due Date','Company'].map((x,i)=><span key={x} className={i===3?'highlight':''}>{x}</span>)}{['Priya','priya@acme.co','INV-2048','$2,400','Sep 02','Acme'].map((x,i)=><span key={i}>{x}</span>)}</div><div className="merge-preview"><small>MESSAGE PREVIEW</small><p>Hi <b>Priya</b>, your invoice <b>INV-2048</b> for <b>$2,400</b> is due on <b>Sep 02</b>.</p></div></div>
        </section>

        <section className="landing-cta floating-surface"><div><span className="section-kicker">READY WHEN YOU ARE</span><h2>Make your next campaign<br /><em>feel intentional.</em></h2></div><div><p>Start free. Upgrade only when your workflow needs more.</p><Link href="/dashboard" className="hero-button">Open Bulkmailer <span>→</span></Link></div></section>
      </main>

      <footer className="landing-footer"><Link href="/" className="brand"><span className="brand-mark">B</span><span>bulkmailer</span></Link><span>© 2026 Bulkmailer</span><div><Link href="/help">Help</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/pricing">Pricing</Link><a href="mailto:yashsrivns@gmail.com">Contact</a></div></footer>
    </div>
  );
}
