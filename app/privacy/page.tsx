import Link from 'next/link';

const sections = [
    { id: 'information', label: 'Information we process' },
    { id: 'google-data', label: 'Google data' },
    { id: 'how-we-use', label: 'How we use information' },
    { id: 'security', label: 'Security' },
    { id: 'sharing', label: 'Data sharing' },
    { id: 'retention', label: 'Retention & deletion' },
    { id: 'choices', label: 'Your choices' },
    { id: 'children', label: "Children's privacy" },
    { id: 'changes', label: 'Changes to this policy' },
    { id: 'contact', label: 'Contact' },
];

export default function Privacy() {
    return (
        <main className="privacy-page">
            <header className="privacy-nav">
                <Link href="/" className="privacy-brand">
                    <span className="privacy-brand-icon">✉</span>
                    <span>Bulkmailer</span>
                </Link>

                <Link href="/" className="privacy-back">
                    ← Back to Bulkmailer
                </Link>
            </header>

            <section className="privacy-hero">
                <div className="privacy-hero-content">
                    <span className="privacy-eyebrow">LEGAL</span>

                    <h1>Privacy Policy</h1>

                    <p>
                        Bulkmailer is a Gmail campaign workspace that helps users create,
                        personalize, and send email campaigns using their own Google
                        account.
                    </p>

                    <div className="privacy-updated">
                        <span>◷</span>
                        Last updated: August 28, 2026
                    </div>
                </div>

                <div className="privacy-hero-art" aria-hidden="true">
                    <div className="privacy-shield">
                        <span>⌕</span>
                    </div>
                </div>
            </section>

            <div className="privacy-layout">
                <aside className="privacy-sidebar">
                    <div className="privacy-toc">
                        <div className="privacy-toc-title">ON THIS PAGE</div>

                        {sections.map((section) => (
                            <a key={section.id} href={`#${section.id}`}>
                                {section.label}
                            </a>
                        ))}
                    </div>

                    <div className="privacy-note">
                        <div className="privacy-note-icon">✓</div>

                        <div>
                            <strong>Your privacy matters</strong>
                            <p>
                                Bulkmailer is designed to use only the information required
                                to provide its email campaign features.
                            </p>
                        </div>
                    </div>
                </aside>

                <article className="privacy-content">
                    <section id="information" className="privacy-card">
                        <div className="privacy-card-icon purple">▣</div>

                        <div>
                            <h2>Information we process</h2>

                            <p>
                                When you use Bulkmailer, we may process information required
                                to provide the service, including:
                            </p>

                            <ul>
                                <li>Your Google account email address and basic account information.</li>
                                <li>OAuth authorization information and the refresh token required to send messages through your connected Google account.</li>
                                <li>Recipient email addresses, names, and other fields you provide through Excel, CSV, or manual input.</li>
                                <li>Campaign subjects, message content, templates, and personalization fields.</li>
                                <li>Campaign delivery information, including pending, sent, and failed statuses.</li>
                                <li>Files or spreadsheet information that you explicitly provide for campaign creation.</li>
                            </ul>
                        </div>
                    </section>

                    <section id="google-data" className="privacy-card">
                        <div className="privacy-card-icon google">G</div>

                        <div>
                            <h2>Google data we access</h2>

                            <p>
                                Bulkmailer uses Google OAuth permissions to connect your
                                Google account and provide features that you explicitly
                                request.
                            </p>

                            <h3>Gmail</h3>

                            <p>
                                Bulkmailer uses the Gmail <code>gmail.send</code> permission
                                to send messages that you explicitly initiate through the
                                application.
                            </p>

                            <p>
                                Bulkmailer does not use the Gmail send permission to read,
                                search, modify, or delete messages in your mailbox.
                            </p>

                            <h3>Google Drive</h3>

                            <p>
                                Bulkmailer may use Google Drive access to support spreadsheet
                                and file-import functionality. Drive information is accessed
                                only for features that require it and is used to provide the
                                functionality requested by you.
                            </p>

                            <p className="privacy-highlight">
                                Bulkmailer does not sell Google user data. Google user data
                                is not used for advertising or unrelated purposes.
                            </p>

                            <p>
                                Bulkmailer's use of information received from Google APIs
                                adheres to the Google API Services User Data Policy,
                                including the Limited Use requirements.
                            </p>
                        </div>
                    </section>

                    <section id="how-we-use" className="privacy-card">
                        <div className="privacy-card-icon blue">↗</div>

                        <div>
                            <h2>How we use information</h2>

                            <p>We use information to:</p>

                            <ul>
                                <li>Authenticate your Bulkmailer account.</li>
                                <li>Connect your authorized Google account.</li>
                                <li>Create and send email campaigns.</li>
                                <li>Personalize messages using recipient information.</li>
                                <li>Import spreadsheet and recipient data.</li>
                                <li>Track campaign delivery status.</li>
                                <li>Store campaign history and templates.</li>
                                <li>Apply account plans, usage limits, and feature permissions.</li>
                                <li>Maintain the security and reliability of the service.</li>
                            </ul>
                        </div>
                    </section>

                    <section id="security" className="privacy-card">
                        <div className="privacy-card-icon green">✓</div>

                        <div>
                            <h2>Security</h2>

                            <p>
                                We take reasonable measures to protect information processed
                                by Bulkmailer.
                            </p>

                            <ul>
                                <li>Google client secrets are stored as server-side environment variables.</li>
                                <li>Database credentials are kept server-side and are not intended to be exposed to the browser.</li>
                                <li>OAuth session information is protected using encrypted application storage and HttpOnly cookies.</li>
                                <li>Production traffic is served over HTTPS.</li>
                                <li>Database infrastructure may provide encryption at rest and other security controls.</li>
                            </ul>

                            <p>
                                No method of electronic storage or transmission can be
                                guaranteed to be completely secure.
                            </p>
                        </div>
                    </section>

                    <section id="sharing" className="privacy-card">
                        <div className="privacy-card-icon pink">↔</div>

                        <div>
                            <h2>Data sharing</h2>

                            <p>
                                Bulkmailer does not sell your personal information, recipient
                                information, or Google user data.
                            </p>

                            <p>
                                Information may be processed by service providers that are
                                necessary to operate Bulkmailer, such as hosting,
                                database, and Google API infrastructure.
                            </p>

                            <p>
                                When you send a campaign, the message and recipient
                                information required to deliver that message are transmitted
                                to Google's Gmail API through your authorized Google account.
                            </p>
                        </div>
                    </section>

                    <section id="retention" className="privacy-card">
                        <div className="privacy-card-icon orange">↻</div>

                        <div>
                            <h2>Retention & deletion</h2>

                            <p>
                                Campaign metadata, templates, recipient information, and
                                delivery information may remain in the Bulkmailer database
                                so that campaign history and workspace features can continue
                                to work.
                            </p>

                            <ul>
                                <li>You can revoke Bulkmailer's Google access from your Google Account.</li>
                                <li>You can stop using the service at any time.</li>
                                <li>You may request deletion of stored account information by contacting us.</li>
                                <li>Previously stored campaign information may remain until it is deleted through the applicable deletion process.</li>
                            </ul>

                            <p>
                                Revoking Google access prevents future use of the revoked
                                authorization, but does not automatically delete information
                                that was previously stored in Bulkmailer.
                            </p>
                        </div>
                    </section>

                    <div className="privacy-mini-grid">
                        <section id="choices" className="privacy-mini-card">
                            <div className="privacy-mini-icon green">●</div>
                            <h2>Your choices</h2>
                            <p>
                                You control the Google account you connect to Bulkmailer.
                                You can revoke access and request deletion of stored data.
                            </p>
                        </section>

                        <section id="children" className="privacy-mini-card">
                            <div className="privacy-mini-icon orange">●</div>
                            <h2>Children's privacy</h2>
                            <p>
                                Bulkmailer is not intended for children under the applicable
                                minimum age for using Google accounts or online services.
                            </p>
                        </section>

                        <section id="changes" className="privacy-mini-card">
                            <div className="privacy-mini-icon blue">●</div>
                            <h2>Changes to this policy</h2>
                            <p>
                                We may update this policy when our service, data practices,
                                or legal requirements change.
                            </p>
                        </section>
                    </div>

                    <section id="contact" className="privacy-contact">
                        <div className="privacy-contact-icon">✉</div>

                        <div>
                            <h2>Contact us</h2>

                            <p>
                                For privacy questions, data deletion requests, or questions
                                about Google account access, contact:
                            </p>

                            <a href="mailto:yashsrivns@gmail.com">
                                yashsrivns@gmail.com
                            </a>
                        </div>
                    </section>
                </article>
            </div>

            <footer className="privacy-footer">
                © 2026 Bulkmailer. All rights reserved.
            </footer>
        </main>
    );
}