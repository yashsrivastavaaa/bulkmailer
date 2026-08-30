import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

const features = [
  ['01', 'Bring your data', 'Drop in Excel or CSV files, paste addresses, and keep every useful column available for personalization.'],
  ['02', 'Personalize naturally', 'Turn spreadsheet fields into merge tokens and preview exactly what each recipient will receive.'],
  ['03', 'Review before send', 'Verify the audience, spot issues, choose recipients, and approve the final campaign before Gmail sends it.'],
  ['04', 'Stay in control', 'Track activity, respect monthly limits, schedule campaigns, and keep the whole workflow in one workspace.'],
];

const stats = [
  ['01', 'Audience', 'Import CSV / Excel', '✓'],
  ['02', 'Message', 'Personalize fields', '✦'],
  ['03', 'Review', 'Verify recipients', '✓'],
  ['04', 'Send', 'Through Gmail', '→'],
];

export default function Landing() {
  return (
    <div className="landing-page-new">
      <div className="landing-grid-bg" />
      <div className="landing-glow landing-glow-one" />
      <div className="landing-glow landing-glow-two" />

      <header className="landing-header-new">
        <Link href="/" className="landing-brand-new" aria-label="Bulkmailer home">
          <span className="brand-mark">B</span>
          <span>bulkmailer</span>
        </Link>

        <nav className="landing-nav-new" aria-label="Landing navigation">
          <a href="#workflow">Workflow</a>
          <a href="#features">Features</a>
          <Link href="/pricing">Pricing</Link>
          <Link href="/help">Help</Link>
        </nav>

        <div className="landing-header-actions">
          <ThemeToggle />
          <Link href="/dashboard" className="landing-login">Open workspace</Link>
        </div>
      </header>

      <main>
        <section className="landing-hero-new" id="product">
          <div className="landing-hero-copy">
            <div className="landing-status"><span /> GMAIL CAMPAIGNS, WITHOUT THE CHAOS</div>
            <h1>Send at scale.<br /><em>Stay in control.</em></h1>
            <p>Bulkmailer turns your spreadsheet into a focused Gmail campaign workspace. Import your audience, personalize every message, verify the final list, and send with confidence.</p>
            <div className="landing-hero-actions">
              <Link href="/dashboard" className="landing-primary-cta">Build a campaign <span>↗</span></Link>
              <Link href="/pricing" className="landing-secondary-cta">See pricing</Link>
            </div>
            <div className="landing-proof">
              <span><b>✓</b> Excel & CSV</span>
              <span><b>✓</b> Personalization</span>
              <span><b>✓</b> Gmail OAuth</span>
              <span><b>✓</b> Review before send</span>
            </div>
          </div>

          <div className="landing-product-stage" aria-label="Bulkmailer product preview">
            <div className="stage-orbit orbit-a" />
            <div className="stage-orbit orbit-b" />
            <div className="product-window-new">
              <div className="product-window-bar">
                <div className="window-dots"><i /><i /><i /></div>
                <span>New campaign</span>
                <div className="window-connected"><span /> Gmail connected</div>
              </div>
              <div className="product-window-body">
                <div className="campaign-title-row">
                  <div><small>CAMPAIGN</small><h3>Invoice follow-up</h3></div>
                  <span className="ready-badge">Ready</span>
                </div>

                <div className="campaign-stepper">
                  {stats.map(([num, title, sub, icon], index) => (
                    <div className={`campaign-step ${index === 0 ? 'current' : ''}`} key={num}>
                      <span className="campaign-step-icon">{icon}</span>
                      <div><b>{num} {title}</b><small>{sub}</small></div>
                    </div>
                  ))}
                </div>

                <div className="product-columns">
                  <div className="audience-mini-card">
                    <div className="mini-card-head"><span>Audience</span><b>184 selected</b></div>
                    <div className="mini-progress"><span /></div>
                    {['Priya Singh', 'Aarav Sharma', 'Ananya Verma'].map((name, i) => (
                      <div className="mini-recipient" key={name}>
                        <span className="mini-avatar">{name[0]}</span>
                        <div><b>{name}</b><small>{['priya@acme.co', 'aarav@acme.co', 'ananya@acme.co'][i]}</small></div>
                        <span className="mini-check">✓</span>
                      </div>
                    ))}
                  </div>

                  <div className="email-mini-card">
                    <div className="mini-card-head"><span>Message preview</span><b>Priya Singh ▾</b></div>
                    <div className="email-paper">
                      <div className="email-line wide" /><div className="email-line" />
                      <p>Hi <strong>Priya</strong>,</p>
                      <p>Your invoice <strong>INV-2048</strong> for <strong>$2,400</strong> is due on Sep 02.</p>
                      <div className="email-button">View invoice</div>
                      <small>Sent through your connected Gmail</small>
                    </div>
                  </div>
                </div>

                <div className="review-bar-new">
                  <div><small>FINAL REVIEW</small><b>184 recipients · 1 attachment</b></div>
                  <span>Review & send <b>→</b></span>
                </div>
              </div>
            </div>
            <div className="stage-float float-usage"><small>MONTHLY REMAINING</small><b>24,980</b><span>Business plan</span></div>
            <div className="stage-float float-verified"><span>✓</span><div><b>Audience verified</b><small>184 valid recipients</small></div></div>
          </div>
        </section>

        <section className="landing-marquee" aria-label="Bulkmailer workflow">
          <span>BUILT AROUND YOUR WORKFLOW</span>
          <div><b>Import</b><i>→</i><b>Map</b><i>→</i><b>Personalize</b><i>→</i><b>Verify</b><i>→</i><b>Send</b></div>
        </section>

        <section className="landing-workflow" id="workflow">
          <div className="landing-section-heading">
            <div><span>THE WORKFLOW</span><h2>Everything you need.<br /><em>Nothing you don't.</em></h2></div>
            <p>One calm workspace for operational email. Keep the spreadsheet context, make the message personal, and keep the final send deliberate.</p>
          </div>
          <div className="workflow-grid-new">
            {stats.map(([num, title, sub, icon]) => (
              <article className="workflow-card-new" key={num}>
                <div className="workflow-card-top"><span>{num}</span><b>{icon}</b></div>
                <h3>{title}</h3><p>{sub}</p>
                <div className="workflow-card-line" />
              </article>
            ))}
          </div>
        </section>

        <section className="landing-features-new" id="features">
          <div className="landing-section-heading compact">
            <div><span>WHY BULKMAILER</span><h2>Bulk email, <em>rethought.</em></h2></div>
            <p>Designed for teams that need scale without giving up visibility or control.</p>
          </div>
          <div className="feature-grid-new">
            {features.map(([num, title, text]) => (
              <article className="feature-card-new" key={num}>
                <span className="feature-index">{num}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="feature-corner">↗</span>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-data-section">
          <div className="data-story-copy">
            <span>YOUR DATA STAYS USEFUL</span>
            <h2>Let the spreadsheet<br /><em>do the personalizing.</em></h2>
            <p>Use any column as a merge field — invoice numbers, amounts, due dates, company names, account managers, order IDs and more.</p>
            <Link href="/dashboard" className="landing-text-link">Create a data-driven campaign <span>→</span></Link>
          </div>
          <div className="spreadsheet-showcase">
            <div className="sheet-toolbar"><span className="sheet-dot" /><b>customers.xlsx</b><small>12 columns</small></div>
            <div className="sheet-table">
              {['Name','Email','Invoice','Amount','Due Date','Company'].map((x, i) => <span className={i === 3 ? 'sheet-highlight' : ''} key={x}>{x}</span>)}
              {['Priya','priya@acme.co','INV-2048','$2,400','Sep 02','Acme'].map((x, i) => <span key={i}>{x}</span>)}
              {['Aarav','aarav@north.co','INV-2049','$1,850','Sep 04','North'].map((x, i) => <span key={i}>{x}</span>)}
            </div>
            <div className="sheet-message"><small>PERSONALIZED PREVIEW</small><p>Hi <b>Priya</b>, your invoice <b>INV-2048</b> for <b>$2,400</b> is due on <b>Sep 02</b>.</p></div>
          </div>
        </section>

        <section className="landing-final-cta">
          <div><span>READY WHEN YOU ARE</span><h2>Make your next campaign<br /><em>feel intentional.</em></h2></div>
          <div><p>Start with the workflow you already know.</p><Link href="/dashboard" className="landing-primary-cta">Open Bulkmailer <span>↗</span></Link></div>
        </section>
      </main>

      <footer className="landing-footer-new">
        <Link href="/" className="landing-brand-new"><span className="brand-mark">B</span><span>bulkmailer</span></Link>
        <span>© 2026 Bulkmailer</span>
        <div><Link href="/help">Help</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/pricing">Pricing</Link><a href="mailto:yashsrivns@gmail.com">Contact</a></div>
      </footer>
    </div>
  );
}
