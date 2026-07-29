'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Field, Input } from '@/app/portal-do-aluno/_lib/form';

export default function DocumentosPage() {
  const router = useRouter();
  const [descricao, setDescricao] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setErro('Selecione um arquivo.'); return; }
    setErro('');
    setSucesso(false);
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append('descricao', descricao);
      formData.append('file', file);

      const res = await fetch('/api/portal/documentos', { method: 'POST', body: formData });
      if (res.status === 401) { router.push('/portal-do-aluno/login'); return; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.message ?? 'Não foi possível enviar o documento.');
        return;
      }
      setSucesso(true);
      setDescricao('');
      setFile(null);
      (e.target as HTMLFormElement).reset();
    } catch {
      setErro('Não foi possível conectar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-md">
      <p className="text-sm mb-6" style={{ color: 'var(--ink-700)' }}>
        Envie documentos (PDF, imagem ou Word, até 5MB) direto pra secretaria.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Descrição do documento">
          <Input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: RG, comprovante de residência, histórico escolar..."
            required
          />
        </Field>
        <Field label="Arquivo">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="btn btn-outline cursor-pointer w-fit">
              Escolher arquivo
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="sr-only"
                required
              />
            </label>
            <span className="text-sm truncate" style={{ color: 'var(--ink-700)' }}>
              {file ? file.name : 'Nenhum arquivo selecionado'}
            </span>
          </div>
        </Field>

        {erro && <p className="text-sm" style={{ color: 'var(--brand-600)' }}>{erro}</p>}
        {sucesso && <p className="text-sm" style={{ color: 'var(--ink-900)' }}>Documento enviado com sucesso!</p>}

        <button type="submit" disabled={enviando} className="btn btn-primary justify-center mt-2 w-fit">
          {enviando ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>
    </div>
  );
}
