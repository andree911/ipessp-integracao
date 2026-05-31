'use client';

import Image from 'next/image';

const socials = [
  { label: 'LinkedIn', href: '#', icon: (<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>) },
  { label: 'Facebook', href: '#', icon: (<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>) },
  { label: 'Instagram', href: '#', icon: (<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>) },
  { label: 'YouTube', href: '#', icon: (<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>) },
];

/* Links baseados nos dados reais do site */
const footerLinks = {
  'Cursos': [
    { label: 'Gestão Hospitalar', href: '/graduacao' },
    { label: 'Biomedicina', href: '/graduacao' },
    { label: 'Estética e Cosmética', href: '/graduacao' },
    { label: 'Fisioterapia', href: '/graduacao' },
    { label: 'Pós-Graduação', href: '/pos-graduacao' },
    { label: 'Cursos Livres EAD', href: '/cursos-livres' },
    { label: 'Polo São José dos Campos', href: '/polo-sao-jose-dos-campos' },
  ],
  'Institucional': [
    { label: 'Nossa História', href: '/nossa-historia' },
    { label: 'Parceiros', href: '/parceiros' },
    { label: 'Corpo Docente', href: '/corpo-docente' },
    { label: 'Trabalhe Conosco', href: '/trabalhe-conosco' },
    { label: 'Clínica Escola', href: '/clinica-escola' },
    { label: 'Laboratórios', href: '/laboratorios' },
    { label: 'Documentos Institucionais', href: '/documentos-institucionais' },
  ],
  'Estudantes': [
    { label: 'Portal do Aluno', href: '/login-aluno' },
    { label: 'Biblioteca Virtual', href: '/biblioteca-virtual' },
    { label: 'Revista Científica', href: '/revista-cientifica' },
    { label: 'Blog', href: '/blog' },
    { label: 'NAP – Apoio Psicopedagógico', href: '/nap' },
    { label: 'Ouvidoria – IPESSP', href: '/ouvidoria' },
    { label: 'Fale Conosco', href: '/fale-conosco' },
  ],
};

export default function Footer() {
  return (
    <footer id="footer" style={{ background: 'var(--ink-900)' }}>
      {/* Main content */}
      <div className="container-site py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1 – Brand */}
          <div className="group flex flex-col gap-4">
            <div style={{ background: 'white', borderRadius: '10px', padding: '8px 14px', display: 'inline-flex', flexDirection: 'column' }}>
              <Image
                src="/images/logo.png"
                alt="Faculdade IPESSP"
                width={200}
                height={70}
                className="object-contain"
                style={{ height: 'auto', width: '140px' }}
              />
              <div className="overflow-hidden max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-all duration-500 ease-in-out">
                <p className="text-sm leading-relaxed pt-3 mt-3" style={{ color: '#3f3636', borderTop: '1px solid #ece6e6' }}>
                  Fundada em 2000, a Faculdade IPESSP já formou mais de 5.000 profissionais de saúde
                  em São Paulo. 25 anos de excelência no ensino da saúde na Consolação.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {socials.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--brand-600)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Cols 2–4 – Links */}
          {Object.entries(footerLinks).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-5"
                style={{ color: 'rgba(255,255,255,0.9)' }}>
                {title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm transition-colors"
                      style={{ color: 'rgba(255,255,255,0.5)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand-300)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contato e horários — dados reais */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 pt-10"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4"
              style={{ color: 'rgba(255,255,255,0.9)' }}>
              Endereço
            </h4>
            <address className="text-sm leading-relaxed not-italic"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              Rua Dona Antônia de Queirós, 333<br />
              Consolação – São Paulo/SP<br />
              CEP: 01307-012
            </address>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4"
              style={{ color: 'rgba(255,255,255,0.9)' }}>
              Contato
            </h4>
            <div className="flex flex-col gap-2.5">
              <a href="tel:+5511976922127"
                className="text-sm flex items-center gap-2 transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand-300)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.13 11 19.79 19.79 0 011.07 2.36 2 2 0 013.06 0h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                (11) 97692-2127
              </a>
              <a href="https://wa.me/5511976922127" target="_blank" rel="noopener noreferrer"
                className="text-sm flex items-center gap-2 transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#25D366'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <a href="mailto:marketing@ipessp.edu.br"
                className="text-sm flex items-center gap-2 transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand-300)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                marketing@ipessp.edu.br
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4"
              style={{ color: 'rgba(255,255,255,0.9)' }}>
              Horários de Atendimento
            </h4>
            {/* Horários reais extraídos do site */}
            <div className="text-sm flex flex-col gap-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <div className="flex justify-between gap-4">
                <span>Segunda a Quinta</span>
                <span className="font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>8h – 22h</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Sexta-feira</span>
                <span className="font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>8h – 20h</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Sábado e Domingo</span>
                <span className="font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>8h – 17h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
        <div className="container-site py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            © 2026 Faculdade IPESSP — Instituto de Pesquisa e Educação em Saúde de São Paulo.
          </p>
          <div className="flex items-center gap-4">
            {[
              { label: 'Institucional', href: '/nossa-historia' },
              { label: 'Fale Conosco', href: '/fale-conosco' },
              { label: 'Política de Privacidade', href: '/politica-privacidade' },
              { label: 'CPA', href: '/cpa' },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
