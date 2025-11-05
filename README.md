
# PedagoPass (Frontend)

Next.js 14 + TypeScript + Tailwind — tema azul claro com modo escuro.
Home focada em **comunidades** (networking entre professores). Página **Destinos** foca nas viagens, com detalhes e formulário de reserva.

## Backend separado (standalone)

Este repositório agora contém um backend Node.js independente em `backend/` (Express + TypeScript) para autenticação e comunidades, com JWT e persistência simples em arquivo. Para usar o front com esse backend:

1) Suba o backend

```
cd backend
npm install
npm run dev
```

2) Configure o front para apontar para o backend

Defina `NEXT_PUBLIC_API_URL` (por exemplo, em `.env.local` na raiz) ou use o default `http://localhost:8080`.

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

3) Rode o front normalmente (Next.js)

O fluxo de login, cadastro e participação em comunidades passa a usar o backend separado.

Observação: o backend salva dados em `backend/.data/db.json`. Em produção, substitua por um banco real.

## Tecnologias
```bash
npm install
npm run dev
```

## Estrutura
- `src/app` (App Router)
- `src/components` (Navbar, Footer, HeroCommunities, Cards, Formulário)
- `src/data` (destinations.ts, communities.ts)
- `public/images` (imagens dos destinos)
- `public/icons` (favicons base) & `public/manifest.json`
