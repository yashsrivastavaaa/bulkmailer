import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getUserBySessionEmail } from '@/lib/app-user';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/?error=login_required');
  const user = await getUserBySessionEmail(session.email);
  if (!user || user.role !== 'admin') redirect('/dashboard?error=forbidden');
  return <AdminClient email={user.email} />;
}
