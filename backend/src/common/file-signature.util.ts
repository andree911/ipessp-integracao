interface Assinatura {
  mime: string;
  bytes: number[];
}

// DOCX/XLSX/PPTX compartilham a mesma assinatura de ZIP (PK\x03\x04) -- não dá
// pra diferenciar só pelos primeiros bytes sem abrir o arquivo. Ainda assim,
// checar a assinatura já barra o caso comum de um mimetype forjado pra um
// tipo de arquivo completamente diferente (ex: html/script anunciado como PDF).
const ASSINATURAS: Assinatura[] = [
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] },
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  {
    mime: 'image/png',
    bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
  {
    mime: 'application/msword',
    bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1],
  },
  {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    bytes: [0x50, 0x4b, 0x03, 0x04],
  },
];

function comecaCom(buffer: Buffer, bytes: number[]): boolean {
  if (buffer.length < bytes.length) return false;
  return bytes.every((byte, i) => buffer[i] === byte);
}

/**
 * Valida o conteúdo real do arquivo pelos primeiros bytes (magic number), em
 * vez de confiar no `mimetype` do multipart -- que é um header definido pelo
 * próprio cliente HTTP e trivialmente falsificável.
 */
export function assinaturaValida(
  buffer: Buffer,
  tiposPermitidos: string[],
): boolean {
  return ASSINATURAS.some(
    (assinatura) =>
      tiposPermitidos.includes(assinatura.mime) &&
      comecaCom(buffer, assinatura.bytes),
  );
}
