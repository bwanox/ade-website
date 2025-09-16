import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server-session';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) {
    redirect('/login?redirect=/dashboard');
  }
  return (
    <div>
      {children}
    </div>
  );
}
