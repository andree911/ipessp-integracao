export default function ProcessoSeletivo() {
  return (
    <section
      id="processo-seletivo"
      className="py-5"
      style={{ background: 'var(--brand-600)' }}
    >
      <div className="container-site flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-white">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Processo Seletivo
            </p>
            <p className="font-bold text-white text-lg leading-tight">
              Vestibular 2026.2 – Inscrições Abertas
            </p>
          </div>
        </div>

        <a
          href={process.env.NEXT_PUBLIC_EDITAL_URL ?? '#pre-inscricao'}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-white flex-shrink-0 text-sm py-2.5 px-6"
          style={{ color: 'var(--brand-700)' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 10v6m0 0-3-3m3 3 3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Ver Nosso Edital
        </a>
      </div>
    </section>
  );
}
