


# PedagoPass (Frontend)

Next.js 14 + TypeScript + Tailwind — tema azul claro com modo escuro.
Home focada em **comunidades** (networking entre professores). Página **Destinos** foca nas viagens, com detalhes e formulário de reserva.

## Backend separado (standalone)

Este repositório agora contém um backend Node.js independente em `backend/` (Express + TypeScript) para autenticação e comunidades, com JWT e persistência em MySQL. Para usar o front com esse backend:

1) Suba o backend

```
cd backend
npm install
npm run dev
```

2) Configure o front para apontar para o backend

Defina `NEXT_PUBLIC_API_URL` (por exemplo, em `.env.local` na raiz):

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

3) Rode o front normalmente (Next.js)

O fluxo de login, cadastro e participação em comunidades passa a usar o backend separado.

## 🔧 Environment Variables

Para configurar o projeto em desenvolvimento ou produção, veja **[docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md)** para:

- ✅ **Quick Start**: Copiar templates de env do `ops/env/`
- 📋 **Variáveis Obrigatórias**: DATABASE_URL, JWT_SECRET, CORS_ORIGIN, etc.
- 🚀 **Deployment**: Railway (backend) + Netlify (frontend)
- 🔍 **Validação**: Scripts para verificar envs

**Quick checklist**:

```bash
# Backend (.env)
DATABASE_URL="mysql://..."
JWT_SECRET="change-me-strong-secret"
CORS_ORIGIN="https://pedagopass.netlify.app"

# Frontend (.env.local)
NEXT_PUBLIC_API_URL="http://localhost:4000"  # ou URL de produção
```

Run validation:
```bash
npm run env:report        # Lista todas as envs
npm run env:check:frontend  # Valida frontend
npm run env:check:backend --prefix backend   # Valida backend
```

## Estrutura
- `src/app` (App Router)
- `src/components` (Navbar, Footer, HeroCommunities, Cards, Formulário)
- `src/data` (destinations.ts, communities.ts)
- `public/images` (imagens dos destinos)
- `public/icons` (favicons base) & `public/manifest.json`
- `backend/` (Express + TypeScript + Prisma)
- `docs/ENVIRONMENT.md` (Guia completo de variáveis)
- `ops/env/` (Templates e auditoria de envs)

