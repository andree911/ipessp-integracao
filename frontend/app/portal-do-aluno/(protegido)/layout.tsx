import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import WhatsAppFloat from '@/app/components/WhatsAppFloat';
import { REFRESH_COOKIE } from '@/app/lib/portal-session';
import PortalTabs from './PortalTabs';

export default async function PortalAlunoProtegidoLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  if (!store.get(REFRESH_COOKIE)?.value) {
    redirect('/portal-do-aluno/login');
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--ink-900)' }}>Portal do Aluno</h1>
        <PortalTabs />
        <div className="mt-6">{children}</div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
