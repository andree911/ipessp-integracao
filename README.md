# ipessp-integracao

Integração entre o site institucional do IPESSP, o bot de atendimento via WhatsApp (n8n), o ERP SophiA, Mercado Pago e o banco Supabase.

- [`backend/`](./backend) — NestJS, camada intermediária entre site, bot WhatsApp (n8n), ERP SophiA, Mercado Pago (checkout da 1ª parcela de matrícula) e Supabase Postgres (banco compartilhado com o projeto `ipessp-corporativo`). Documentação completa em [`backend/documentacao/BACKEND.md`](./backend/documentacao/BACKEND.md).
- [`frontend/`](./frontend) — site institucional em Next.js.

## Rodando localmente

Backend:

```bash
cd backend
npm install
npm run start:dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Deploy

- Frontend: [site-ipessp-frontend.vercel.app](https://site-ipessp-frontend.vercel.app/)
- Backend: VPS própria (Docker Compose, atrás de Caddy) — [srv1835634.hstgr.cloud](https://srv1835634.hstgr.cloud/)
