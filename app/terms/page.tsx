import Link from 'next/link';

const sections = [
  ['overview', 'Overview'],
  ['acceptable-use', 'Acceptable use'],
  ['account', 'Google account'],
  ['campaigns', 'Campaigns & content'],
  ['sending', 'Email sending'],
  ['plans', 'Plans & limits'],
  ['data', 'Data & privacy'],
  ['availability', 'Service availability'],
  ['liability', 'Limitation of liability'],
  ['changes', 'Changes to terms'],
  ['contact', 'Contact'],
];

export default function Terms() {
  return (
    <main className="legal-page">
      <header className="legal-nav">
        <Link href="/" className="legal-brand">
          <span className="legal-brand-icon">✉</span>
          <span>Bulkmailer</span>
        </Link>
        <Link href="/" className="legal-back">← Back to Bulkmailer</Link>
      </header>

      <section className="legal-hero">
        <div className="legal-hero-content">
          <span className="legal-eyebrow">LEGAL</span>
          <h1>Terms of Service</h1>
          <p>
            These terms explain the rules for using Bulkmailer, including your
            responsibilities when creating, managing, and sending email campaigns.
          </p>
          <div className="legal-updated"><span>◷</span> Last updated: August 28, 2026</div>
        </div>
        <div className="legal-hero-art" aria-hidden="true">
          <div className="legal-document"><span>✓</span></div>
        </div>
      </section>

      <div className="legal-layout">
        <aside className="legal-sidebar">
          <nav className="legal-toc" aria-label="Terms sections">
            <div className="legal-toc-title">ON THIS PAGE</div>
            {sections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
          </nav>
          <div className="legal-note">
            <div className="legal-note-icon">!</div>
            <div>
              <strong>Use Bulkmailer responsibly</strong>
              <p>You are responsible for your campaigns, recipients, content, and compliance with applicable laws.</p>
            </div>
          </div>
        </aside>

        <article className="legal-content">
          <section id="overview" className="legal-card">
            <div className="legal-card-icon purple">§</div>
            <div>
              <h2>Overview</h2>
              <p>Bulkmailer is an email campaign workspace that allows users to connect their Google account, import recipient data, create personalized campaigns, and send messages through authorized Google services.</p>
              <p>By accessing or using Bulkmailer, you agree to these Terms of Service. If you do not agree with these terms, you should not use the service.</p>
            </div>
          </section>

          <section id="acceptable-use" className="legal-card">
            <div className="legal-card-icon red">!</div>
            <div>
              <h2>Acceptable use</h2>
              <p>You must use Bulkmailer responsibly and in accordance with applicable laws, regulations, and the policies of the services you connect to Bulkmailer.</p>
              <p>You must not use Bulkmailer for:</p>
              <ul>
                <li>Spam or unlawful unsolicited commercial messages.</li>
                <li>Phishing, scams, fraud, or deceptive communications.</li>
                <li>Impersonation of another person, company, or organization.</li>
                <li>Malware, malicious links, or harmful content.</li>
                <li>Harassment, threats, or abusive communications.</li>
                <li>Content that violates applicable laws or third-party rights.</li>
                <li>Attempts to bypass Gmail, Google, or Bulkmailer limits.</li>
              </ul>
            </div>
          </section>

          <section id="account" className="legal-card">
            <div className="legal-card-icon blue">G</div>
            <div>
              <h2>Google account</h2>
              <p>Bulkmailer allows you to connect a Google account using Google's OAuth authorization process.</p>
              <p>You authorize Bulkmailer to perform the Google actions requested through the OAuth consent screen and explicitly initiated by you.</p>
              <p>You are responsible for maintaining the security of your Google account. You may revoke Bulkmailer's access through your Google Account settings.</p>
            </div>
          </section>

          <section id="campaigns" className="legal-card">
            <div className="legal-card-icon purple">✎</div>
            <div>
              <h2>Campaigns &amp; content</h2>
              <p>You are responsible for all information and material you upload or enter into Bulkmailer.</p>
              <ul>
                <li>Recipient email addresses and recipient lists.</li>
                <li>Names and personalization fields.</li>
                <li>Email subjects and message content.</li>
                <li>Templates and campaign data.</li>
                <li>Attachments and imported spreadsheet information.</li>
              </ul>
              <p>You must have the necessary rights, permissions, and lawful basis to use recipient information and send your messages.</p>
            </div>
          </section>

          <section id="sending" className="legal-card">
            <div className="legal-card-icon orange">➤</div>
            <div>
              <h2>Email sending</h2>
              <p>Bulkmailer uses your authorized Google account to send messages that you explicitly initiate.</p>
              <p>Actual delivery may depend on Gmail availability, account restrictions, recipient servers, spam filtering, quotas, and other factors outside Bulkmailer's control.</p>
              <p>Bulkmailer does not guarantee that every message will be delivered, opened, or accepted by a recipient.</p>
            </div>
          </section>

          <section id="plans" className="legal-card">
            <div className="legal-card-icon green">◆</div>
            <div>
              <h2>Plans &amp; limits</h2>
              <p>Bulkmailer may provide different account plans with different sending limits, recipient limits, attachment limits, and feature availability.</p>
              <p>Your available limits and features are determined by the plan associated with your account and may be displayed in the Bulkmailer dashboard.</p>
              <p>Bulkmailer may change, suspend, or discontinue a plan or feature where reasonably necessary to operate or improve the service.</p>
            </div>
          </section>

          <section id="data" className="legal-card">
            <div className="legal-card-icon blue">⌁</div>
            <div>
              <h2>Data &amp; privacy</h2>
              <p>Your use of Bulkmailer is also governed by our Privacy Policy, which explains how account information, Google authorization data, recipient information, campaign data, and other information are processed.</p>
              <Link href="/privacy" className="legal-inline-link">Read the Privacy Policy →</Link>
            </div>
          </section>

          <section id="availability" className="legal-card">
            <div className="legal-card-icon purple">◌</div>
            <div>
              <h2>Service availability</h2>
              <p>We aim to keep Bulkmailer reliable and available, but the service may occasionally be unavailable because of maintenance, infrastructure issues, third-party services, network failures, or other circumstances.</p>
              <p>Bulkmailer does not guarantee uninterrupted or error-free operation.</p>
            </div>
          </section>

          <section id="liability" className="legal-card">
            <div className="legal-card-icon red">◇</div>
            <div>
              <h2>Limitation of liability</h2>
              <p>To the extent permitted by applicable law, Bulkmailer and its operator are not responsible for losses arising from misuse of the service, unlawful campaigns, recipient actions, Gmail or Google service interruptions, rejected messages, or circumstances outside the reasonable control of the service.</p>
              <p>You remain responsible for ensuring that your use of Bulkmailer complies with applicable laws and third-party service policies.</p>
            </div>
          </section>

          <div className="legal-mini-grid">
            <section id="changes" className="legal-mini-card">
              <div className="legal-mini-icon blue">✎</div>
              <h2>Changes to terms</h2>
              <p>We may update these terms when the service, features, or applicable requirements change. Updated terms will be published on this page.</p>
            </section>
            <section className="legal-mini-card">
              <div className="legal-mini-icon green">✓</div>
              <h2>Your responsibility</h2>
              <p>Use accurate recipient information and send only messages you are authorized and legally permitted to send.</p>
            </section>
            <section className="legal-mini-card">
              <div className="legal-mini-icon orange">→</div>
              <h2>Google policies</h2>
              <p>Your use of connected Google services remains subject to Google's applicable terms and policies.</p>
            </section>
          </div>

          <section id="contact" className="legal-contact">
            <div className="legal-contact-icon">✉</div>
            <div>
              <h2>Contact us</h2>
              <p>Questions about these Terms of Service can be sent to:</p>
              <a href="mailto:yashsrivns@gmail.com">yashsrivns@gmail.com</a>
            </div>
          </section>
        </article>
      </div>

      <footer className="legal-footer">
        <div><strong>Bulkmailer</strong><span>Simple email campaigns, responsibly.</span></div>
        <div className="legal-footer-links"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/">Home</Link></div>
        <div className="legal-copyright">© 2026 Bulkmailer. All rights reserved.</div>
      </footer>
    </main>
  );
}
