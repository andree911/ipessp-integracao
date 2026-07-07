'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { sophiaPortalUrl } from '@/lib/contato';

const SOPHIA_PORTAL_URL = sophiaPortalUrl();

const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/ipessp---educa-o', icon: (<svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>) },
  { label: 'Facebook', href: 'https://www.facebook.com/pages/Ipessp/209464852483898', icon: (<svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>) },
  { label: 'Instagram', href: 'https://www.instagram.com/ipessp/', icon: (<svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>) },
  { label: 'YouTube', href: 'https://www.youtube.com/channel/UC7dgP6NBgM9L0m11UbhCyHg', icon: (<svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>) },
];

/* ── Dados reais do site IPESSP ──────────────────────────────── */
const posGraduacaoMenu = [
  {
    area: 'Cardiologia',
    items: [
      'Circulação Extracorpórea – Perfusão',
      'Curso Introdutório de Circulação Extracorpórea',
      'ECMO Básico para Equipe Multidisciplinar',
    ],
  },
  {
    area: 'Diagnóstico Laboratorial',
    items: [
      'Análises Clínicas – Da Prática à Clínica',
      'Citogenética Clínica',
      'Biologia Molecular',
      'Citologia Clínica',
      'Imunologia e Oncohematologia',
      'Microbiologia Clínica',
      'Hematologia e Hemoterapia Laboratorial',
    ],
  },
  {
    area: 'Estética',
    items: [
      'Biomedicina Estética Avançada',
      'Farmácia Estética Avançada',
      'Biologia Estética Avançada',
      'Enfermagem Estética',
      'Harmonização Orofacial (HOF)',
    ],
  },
  {
    area: 'Gestão em Saúde',
    items: [
      'Administração Hospitalar – Online ao Vivo',
      'Auditoria nos Serviços de Saúde – Online',
      'Saúde Pública e Estratégia em Saúde da Família',
      'Direito da Saúde – Lato Sensu',
    ],
  },
  {
    area: 'Farmácia',
    items: [
      'Farmácia Clínica e Atenção Farmacêutica – EAD',
      'Farmácia Oncológica – Online c/ Estágio na FMUSP',
    ],
  },
  {
    area: 'Enfermagem',
    items: [
      'Enfermagem Estética',
      'Enfermagem Estética Avançado 40% EAD',
      'Enfermagem Intensiva Pediátrica e Neonatal',
      'Enfermagem Intensiva Adulto',
    ],
  },
  {
    area: 'Outras Áreas',
    items: [
      'Acupuntura Integrativa – Medicina Chinesa',
      'Análises Clínicas Veterinária',
      'Docência e Pesquisa em Ciências e Saúde',
      'Gerontologia – 40% EAD',
      'Ressonância Magnética e Tomografia Computadorizada',
      'MBA',
    ],
  },
];

const cursosLivresMenu = [
  {
    area: 'EAD (40% a distância)',
    items: [
      'Análises Clínicas – EAD',
      'Biologia Estética Avançada – EAD',
      'Biomedicina Estética Avançada – EAD',
      'Farmácia Estética – EAD',
      'Gestão Estratégica nos Serviços de Saúde – EAD',
    ],
  },
  {
    area: 'Capacitação',
    items: ['Análises Clínicas'],
  },
  {
    area: 'Atualização',
    items: ['Estética', 'Fisioterapia', 'Análises Clínicas'],
  },
  {
    area: 'Técnicos',
    items: ['Técnico Veterinário'],
  },
];

const graduacaoItems = [
  { label: 'Gestão Hospitalar', href: '/graduacao' },
  { label: 'Biomedicina', href: '/graduacao' },
  { label: 'Estética e Cosmética', href: '/graduacao' },
  { label: 'Fisioterapia', href: '/graduacao' },
];

const institucionalMenu = [
  { label: 'Nossa História', href: '/nossa-historia' },
  { label: 'Parceiros', href: '/parceiros' },
  { label: 'Depoimentos', href: '/depoimentos' },
  { label: 'Trabalhe Conosco', href: '/trabalhe-conosco' },
  { label: 'Clínica Escola', href: '/clinica-escola' },
  { label: 'Espaço para Eventos', href: '/espaco-para-eventos' },
  { label: 'Corpo Docente', href: '/corpo-docente' },
  { label: 'Ouvidoria – IPESSP', href: '/ouvidoria' },
  { label: 'NAP – Apoio Psicopedagógico', href: '/nap' },
  { label: 'CPA – Comissão de Avaliação', href: '/cpa' },
  { label: 'Laboratórios', href: '/laboratorios' },
  { label: 'Documentos Institucionais', href: '/documentos-institucionais' },
  { label: 'Biblioteca', href: '/biblioteca-virtual' },
  { label: 'Revista Científica', href: '/revista-cientifica' },
];

/* ─────────────────────────────────────────────────────────────── */

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMegaOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Topbar ─────────────────────────────────────────────── */}
      <div className="hidden md:block text-white text-sm" style={{ background: 'var(--brand-700)' }}>
        <div className="container-site flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <a href="tel:+5511976922127"
              className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.13 11 19.79 19.79 0 011.07 2.36 2 2 0 013.06 0h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              (11) 97692-2127
            </a>
            <div className="flex items-center gap-2">
              {socials.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="opacity-70 hover:opacity-100 transition-opacity">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {[
              { label: 'Clínica Estética', href: '/clinica-escola' },
              { label: 'Portal do Aluno', href: '/portal-do-aluno' },
              { label: 'Portal do Professor', href: SOPHIA_PORTAL_URL },
              { label: 'Biblioteca Virtual', href: '/biblioteca-virtual' },
            ].map(item => (
              <a key={item.label} href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="opacity-80 hover:opacity-100 transition-opacity hover:underline">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav
        ref={navRef}
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300`}
        style={{ boxShadow: scrolled ? 'var(--shadow-md)' : 'var(--shadow-sm)' }}
      >
        <div className="container-site flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Image
              src="/images/logo.png"
              alt="Faculdade IPESSP"
              width={140}
              height={48}
              className="object-contain"
              style={{ height: '46px', width: 'auto' }}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">

            {/* Diplomas */}
            <NavLink href="/diplomas">Diplomas</NavLink>

            {/* Cursos Livres mega */}
            <MegaMenuTrigger
              label="Cursos Livres"
              isOpen={megaOpen === 'livres'}
              onOpen={() => setMegaOpen('livres')}
              onClose={() => setMegaOpen(null)}
            >
              <div className="grid grid-cols-4 gap-6 p-6 w-[620px]">
                {cursosLivresMenu.map(group => (
                  <div key={group.area}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: 'var(--ink-500)' }}>
                      {group.area}
                    </p>
                    <ul className="space-y-1">
                      {group.items.map(item => (
                        <li key={item}>
                          <a href="/cursos-livres" className="block text-sm py-0.5 transition-colors"
                            style={{ color: 'var(--ink-700)' }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand-600)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-700)'; }}>
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </MegaMenuTrigger>

            {/* Graduação dropdown */}
            <div className="relative group">
              <NavLink href="/graduacao">Graduação</NavLink>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white rounded-2xl shadow-xl border border-[var(--line)] p-2 min-w-52">
                  {graduacaoItems.map(item => (
                    <DropdownItem key={item.label} href={item.href}>{item.label}</DropdownItem>
                  ))}
                </div>
              </div>
            </div>

            {/* Pós-Graduação mega */}
            <MegaMenuTrigger
              label="Pós-Graduação"
              isOpen={megaOpen === 'pos'}
              onOpen={() => setMegaOpen('pos')}
              onClose={() => setMegaOpen(null)}
            >
              <div className="p-6 w-[760px] max-h-[calc(100vh-130px)] overflow-y-auto">
                <div className="grid grid-cols-3 gap-6">
                  {posGraduacaoMenu.map(group => (
                    <div key={group.area}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2"
                        style={{ color: 'var(--ink-500)' }}>
                        {group.area}
                      </p>
                      <ul className="space-y-1">
                        {group.items.map(item => (
                          <li key={item}>
                            <a href="/pos-graduacao" className="block text-sm py-0.5 transition-colors leading-snug"
                              style={{ color: 'var(--ink-700)' }}
                              onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand-600)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-700)'; }}>
                              {item}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
                  <a href="/pos-graduacao" className="text-sm font-semibold flex items-center gap-1"
                    style={{ color: 'var(--brand-600)' }}>
                    Ver todos os 54 cursos de Pós-Graduação
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </div>
            </MegaMenuTrigger>

            {/* Polos */}
            <div className="relative group">
              <NavLink href="/polo-sao-jose-dos-campos">Polos</NavLink>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white rounded-2xl shadow-xl border border-[var(--line)] p-2 min-w-52">
                  <DropdownItem href="/polo-sao-jose-dos-campos">Polo São José dos Campos</DropdownItem>
                </div>
              </div>
            </div>

            <NavLink href="/blog">Blog</NavLink>

            {/* Institucional dropdown */}
            <div className="relative group">
              <NavLink href="/nossa-historia">Institucional</NavLink>
              <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white rounded-2xl shadow-xl border border-[var(--line)] p-2 w-64">
                  {institucionalMenu.map(item => (
                    <DropdownItem key={item.label} href={item.href}>{item.label}</DropdownItem>
                  ))}
                </div>
              </div>
            </div>

            {/* Busca */}
            <button
              className="p-2 rounded-xl transition-colors ml-1"
              style={{ color: 'var(--ink-700)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-50)'; e.currentTarget.style.color = 'var(--brand-600)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--ink-700)'; }}
              aria-label="Buscar"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            <a href="#pre-inscricao" className="btn btn-primary ml-2 text-sm py-2.5 px-5">
              Matricule-se
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl"
            style={{ color: 'var(--ink-700)' }}
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ───────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto w-[88vw] max-w-sm bg-white h-full overflow-y-auto shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--line)' }}>
              <Image src="/images/logo.png" alt="IPESSP" width={100} height={36}
                className="object-contain" style={{ height: '34px', width: 'auto' }} />
              <button onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl" aria-label="Fechar menu">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="p-4 flex flex-col gap-1 flex-1 overflow-y-auto">
              <a href="#pre-inscricao" onClick={() => setMobileOpen(false)}
                className="btn btn-primary text-center justify-center mb-4">
                Matricule-se
              </a>

              {[
                { label: 'Portal do Aluno', href: '/portal-do-aluno' },
                { label: 'Portal do Professor', href: SOPHIA_PORTAL_URL },
                { label: 'Diplomas', href: '/diplomas' },
                {
                  label: 'Cursos Livres', href: '/cursos-livres',
                  children: cursosLivresMenu.flatMap(g => g.items).map(i => ({ label: i, href: '/cursos-livres' })),
                },
                {
                  label: 'Graduação', href: '/graduacao',
                  children: graduacaoItems.map(i => ({ label: i.label, href: i.href })),
                },
                {
                  label: 'Pós-Graduação', href: '/pos-graduacao',
                  children: posGraduacaoMenu.flatMap(g => g.items).map(i => ({ label: i, href: '/pos-graduacao' })),
                },
                { label: 'Polo São José dos Campos', href: '/polo-sao-jose-dos-campos' },
                { label: 'Blog', href: '/blog' },
                { label: 'Ouvidoria', href: '/ouvidoria' },
                {
                  label: 'Institucional', href: '/nossa-historia',
                  children: institucionalMenu,
                },
              ].map(item => (
                <div key={item.label}>
                  {item.children ? (
                    <div>
                      <button
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium"
                        style={{ color: 'var(--ink-700)' }}
                        onClick={() => setActiveSubmenu(activeSubmenu === item.label ? null : item.label)}
                      >
                        {item.label}
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                          className={`transition-transform ${activeSubmenu === item.label ? 'rotate-180' : ''}`}>
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </button>
                      {activeSubmenu === item.label && (
                        <div className="pl-4 mt-1 space-y-1 max-h-64 overflow-y-auto">
                          {item.children.map(child => (
                            <a key={child.label} href={child.href}
                              className="block px-3 py-2 text-sm rounded-lg"
                              style={{ color: 'var(--ink-500)' }}
                              onClick={() => setMobileOpen(false)}>
                              {child.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <a href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="block px-3 py-2.5 rounded-xl font-medium"
                      style={{ color: 'var(--ink-700)' }}
                      onClick={() => setMobileOpen(false)}>
                      {item.label}
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t flex items-center gap-4" style={{ borderColor: 'var(--line)' }}>
              {socials.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="transition-colors" style={{ color: 'var(--ink-500)' }}>
                  {s.icon}
                </a>
              ))}
              <a href="tel:+5511976922127"
                className="ml-auto text-sm" style={{ color: 'var(--ink-500)' }}>
                (11) 97692-2127
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────── */

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
      className="px-3 py-2 rounded-xl text-sm font-medium transition-colors"
      style={{ color: 'var(--ink-700)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-50)'; e.currentTarget.style.color = 'var(--brand-600)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--ink-700)'; }}>
      {children}
    </Link>
  );
}

function DropdownItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href}
      className="block px-3 py-2 rounded-xl text-sm transition-colors"
      style={{ color: 'var(--ink-700)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-50)'; e.currentTarget.style.color = 'var(--brand-600)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--ink-700)'; }}>
      {children}
    </a>
  );
}

function MegaMenuTrigger({
  label, isOpen, onOpen, onClose, children,
}: {
  label: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}>
      <button
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
        style={{
          background: isOpen ? 'var(--brand-50)' : '',
          color: isOpen ? 'var(--brand-600)' : 'var(--ink-700)',
        }}
        aria-expanded={isOpen}
      >
        {label}
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
          <div className="bg-white rounded-2xl shadow-xl border" style={{ borderColor: 'var(--line)' }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
