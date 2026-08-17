/** Mascara um telefone em logs, mantendo só os últimos 4 dígitos -- permite correlacionar entradas sem expor o número completo. */
export function maskTelefone(telefone: string): string {
  const digitos = telefone.replace(/\D/g, '');
  if (digitos.length <= 4) return '****';
  return `****${digitos.slice(-4)}`;
}
