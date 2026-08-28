'use client';
import Link from 'next/link';
export default function LoginRequired({title='Sign in to continue',description='Connect your Google account to use this workspace.'}:{title?:string;description?:string}) {
  return <div className="login-required">
    <div className="login-required-orb">B</div>
    <div className="eyebrow">PRIVATE WORKSPACE</div>
    <h1>{title}</h1>
    <p>{description}</p>
    <Link href="/api/auth/google" className="login-google-cta"><span className="google-g">G</span><span>Continue with Google</span><span className="login-arrow">→</span></Link>
    <span className="login-note">Secure OAuth · no Google password stored</span>
  </div>
}
