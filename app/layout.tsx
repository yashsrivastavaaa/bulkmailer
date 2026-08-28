import './globals.css';
import type { Metadata } from 'next';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Bulkmailer — Controlled Gmail campaigns',
  description: 'A focused Gmail campaign workspace for Excel, CSV, pasted recipients, personalization, attachments, and review-before-send control.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><AppShell>{children}</AppShell></body></html>;
}
