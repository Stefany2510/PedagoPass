# 📚 Guia de Documentação - PedagoPass

## 🎯 Comece por aqui

Dependendo do seu caso, escolha o documento certo:

### 🚀 **Você quer colocar em produção?**

→ **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)**

Um guia passo-a-passo com:
- ✅ Configurar Railway (backend)
- ✅ Configurar Netlify (frontend)  
- ✅ Validar todas as variáveis
- ✅ Testar signup/login
- 🔍 Troubleshooting

---

### 🔧 **Estou recebendo erros de CORS?**

→ **[FIX_CORS.md](./FIX_CORS.md)**

Corrige o erro:
```
Access to fetch at '...' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present
```

**Solução em 3 passos:**
1. Railway → Backend → Variables
2. Adicione `CORS_ORIGIN=https://seu-netlify.app`
3. Redeploy

---

### 🌐 **Frontend no Netlify mostra 404 em `/api/auth/me`?**

→ **[SETUP_NETLIFY.md](./SETUP_NETLIFY.md)**

O erro ocorre quando:
```
GET https://seu-dominio.netlify.app/api/auth/me 404
```

Em vez de:
```
GET https://seu-backend.railway.app/api/auth/me
```

**Solução:**
- Netlify → Build & deploy → Environment
- Adicione: `NEXT_PUBLIC_API_URL=https://seu-backend.railway.app`

---

### 📋 **Quais são todas as variáveis de ambiente necessárias?**

→ **[docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md)**

Documentação completa com:
- 📊 Tabela de 37 variáveis (backend + frontend)
- ✅ Obrigatórias vs Opcionais
- 🔄 Diferenças DEV vs PROD
- 🔒 Como gerar secrets forte
- 🐛 Troubleshooting

---

### 💻 **Desenvolvendo localmente?**

→ **[README.md](./README.md)**

Setup local com:
```bash
cd backend && npm install && npm run dev
# Em outro terminal:
npm install && npm run dev
# Abrir http://localhost:3000
```

---

## 📦 Estrutura de Arquivos de Documentação

```
PedagoPass/
├── PRODUCTION_CHECKLIST.md    ← Roteiro final para produção
├── SETUP_NETLIFY.md            ← Configurar frontend Netlify
├── FIX_CORS.md                 ← Resolver erros CORS
├── docs/
│   └── ENVIRONMENT.md          ← Referência completa de envs
├── ops/env/
│   ├── .env.railway.example    ← Template backend
│   ├── .env.netlify.example    ← Template frontend
│   ├── env-audit.json          ← Banco de dados de envs
│   └── print-env-audit.cjs     ← Script de relatório
├── backend/
│   └── src/utils/validateEnv.ts ← Validador backend
└── scripts/
    └── check-frontend-env.ts    ← Validador frontend
```

---

## 🔍 Audit & Validação

### Listar todas as variáveis de ambiente

```bash
npm run env:report
```

Output: Tabela formatada com obrigatórias, opcionais e escopo.

### Validar frontend (local)

```bash
npm run env:check:frontend
```

Verifica se `NEXT_PUBLIC_API_URL` e outras públicas estão presentes.

### Validar backend (produção)

```bash
npm run env:check:backend --prefix backend
```

Verifica se `DATABASE_URL`, `JWT_SECRET` e `CORS_ORIGIN` existem.

---

## 🚨 Problemas Comuns (Índice Rápido)

| Erro | Solução |
|------|---------|
| `CORS policy: No 'Access-Control-Allow-Origin'` | [FIX_CORS.md](./FIX_CORS.md) |
| `404 Not Found` em `/api/auth/me` | [SETUP_NETLIFY.md](./SETUP_NETLIFY.md) |
| `500 Internal Server Error` em signup | Railway Logs → Database error |
| `401 Unauthorized` sem token | Normal! Token não foi enviado |
| `[API] Using BASE URL: (não configurado)` | [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md) → `NEXT_PUBLIC_API_URL` |

---

## 📚 Recursos Externos

- [Prisma Database URLs](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [Railway Docs](https://docs.railway.app/)
- [Netlify Env Vars](https://docs.netlify.com/configure-builds/environment-variables/)
- [Next.js Env Vars](https://nextjs.org/docs/basic-features/environment-variables)
- [HTTP CORS Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## 🎯 Fluxo Recomendado

1. **Local Development**
   - Ler: `README.md`
   - Seguir: Setup backend + frontend local
   - Validar: `npm run env:check:frontend`

2. **Preparando Production**
   - Ler: `docs/ENVIRONMENT.md`
   - Preparar: `.env.railway.example` e `.env.netlify.example`

3. **Deploy no Railway + Netlify**
   - Seguir: `PRODUCTION_CHECKLIST.md`
   - Configurar: Todas as variáveis listadas

4. **Troubleshooting**
   - CORS? → `FIX_CORS.md`
   - 404? → `SETUP_NETLIFY.md`
   - Envs? → `docs/ENVIRONMENT.md`

---

## ✅ Checklist de Sucesso

Você terá sucesso quando:

- [ ] Consegue fazer signup no Netlify
- [ ] Login funciona e retorna token
- [ ] `/auth/me` retorna dados do usuário
- [ ] Consegue listar comunidades
- [ ] Não vê mais erros de CORS ou 404
- [ ] DevTools mostra `[API] Using BASE URL: https://seu-backend.railway.app`
- [ ] Todas as variáveis estão configuradas conforme `PRODUCTION_CHECKLIST.md`

---

**Última atualização**: 6 de novembro de 2025

Para dúvidas ou sugestões, verifique o arquivo relevante acima! 🚀
