'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const TABS = [
  { label: 'Financeiro', href: '/portal-do-aluno/financeiro' },
  { label: 'Curso', href: '/portal-do-aluno/curso' },
];

export default function PortalTabs() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/portal/auth/logout', { method: 'POST' }).catch(() => {});
    router.push('/portal-do-aluno/login');
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between border-b" style={{ borderColor: 'var(--line)' }}>
      <nav className="flex gap-1">
        {TABS.map(tab => {
          const ativo = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors"
              style={{
                borderColor: ativo ? 'var(--brand-600)' : 'transparent',
                color: ativo ? 'var(--brand-600)' : 'var(--ink-700)',
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="text-sm mb-2 opacity-70 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--ink-700)' }}
      >
        Sair
      </button>
    </div>
  );
}
