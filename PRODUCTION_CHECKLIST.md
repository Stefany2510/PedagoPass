# 🚀 Checklist Final: Colocar PedagoPass em Produção

Siga este guia passo-a-passo para que a app funcione perfeitamente no **Railway** (backend) + **Netlify** (frontend).

---

## 📋 Pré-requisitos

- [ ] Conta no [Railway.app](https://railway.app)
- [ ] Conta no [Netlify.com](https://netlify.com)
- [ ] MySQL database (ex: AlwaysData, AWS RDS, Railway Postgres)
- [ ] GitHub repo conectado em ambas plataformas

---

## 🔴 PASSO 1: Configurar Backend no Railway

### 1.1 Criar/Conectar Projeto

1. Railway.app → New Project
2. Select repo → PedagoPass (ou seu fork)
3. Selecione branch `develop`

### 1.2 Adicionar Database (se necessário)

Se não tiver MySQL ainda:

1. Railway → +New → Database → MySQL
2. Copie `DATABASE_URL` automaticamente gerado

### 1.3 Configurar Variables

1. Railway → Backend service → **Variables**
2. Adicione/confirme estas variáveis:

| Key | Value | Nota |
|-----|-------|------|
| `NODE_ENV` | `production` | Sempre production |
| `DATABASE_URL` | `mysql://...` | Copie de Railway MySQL |
| `JWT_SECRET` | `<gere com `openssl rand -base64 32`>` | Forte, aleatório |
| `CORS_ORIGIN` | `https://seu-netlify.netlify.app` | Exato, sem barra |
| `PORT` | (deixe vazio) | Railway assume 8080 |
| `COOKIE_SECURE` | `true` | Para HTTPS |
| `COOKIE_SAME_SITE` | `none` | Para cross-site |
| `LOG_LEVEL` | `info` | Informativo |

**Gerar JWT_SECRET:**
```bash
openssl rand -base64 32
# Output: abc123XYZ+/...
```

### 1.4 Deploy Backend

1. Confirme que tem `postinstall` e `prestart` em `backend/package.json`:
   ```json
   "postinstall": "prisma generate || true",
   "prestart": "prisma migrate deploy || true"
   ```

2. Railway → Deployments → Wait ~5 min

3. Copie a URL pública do backend (ex: `https://pedagopass-production-c410.up.railway.app`)

### 1.5 Testar Backend

```bash
curl https://seu-backend-railway.app/health
# Deve retornar: ok

curl -X POST https://seu-backend-railway.app/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"nome":"Test","email":"test@test.com","senha":"123456"}'
# Deve retornar: 201 com token ou 409 se email existe
```

---

## 🔵 PASSO 2: Configurar Frontend no Netlify

### 2.1 Conectar Repo

1. Netlify → New site from Git
2. Select GitHub → PedagoPass repo
3. Branch: `develop`

### 2.2 Configurar Build

1. **Build command**: `npm ci && npm run build`
2. **Publish directory**: `.next`

### 2.3 Adicionar Environment Variables

1. Site settings → Build & deploy → Environment
2. Adicione:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://seu-backend-railway.app` (sem `/api` no final) |
| `NEXT_PUBLIC_ENV` | `prod` |

### 2.4 Deploy Frontend

1. Netlify → Trigger deploy → Clear cache and deploy site
2. Aguarde ~3 min

### 2.5 Testar Frontend

1. Abra `https://seu-netlify.netlify.app`
2. F12 → Console
3. Deve ver: `[API] Using BASE URL: https://seu-backend-railway.app`
4. Tente fazer cadastro/login

---

## ✅ PASSO 3: Validação Completa

### 3.1 Signup Flow

```bash
# 1. Fazer signup
curl -X POST https://seu-backend-railway.app/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"nome":"João","email":"joao@test.com","senha":"123456"}'

# Response esperado:
# {"ok":true,"token":"eyJ...","user":{"id":"...","nome":"João","email":"joao@test.com","createdAt":"..."}}

# 2. Salvar o token (ex: abc123)
TOKEN="abc123"

# 3. Testar /auth/me com token
curl https://seu-backend-railway.app/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Response esperado:
# {"ok":true,"user":{"id":"...","nome":"João","email":"joao@test.com","createdAt":"..."}}
```

### 3.2 CORS Check

```bash
curl -i -X OPTIONS https://seu-backend-railway.app/auth/signup \
  -H "Origin: https://seu-netlify.netlify.app" \
  -H "Access-Control-Request-Method: POST"

# Deve conter headers:
# Access-Control-Allow-Origin: https://seu-netlify.netlify.app
# Access-Control-Allow-Credentials: true
# Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
```

### 3.3 Testar no Browser

1. Abra `https://seu-netlify.netlify.app`
2. Vá para "/cadastro"
3. Preencha formulário e clique "Criar conta"
4. Se tudo OK, deve redirecionar para "/perfil"
5. DevTools → Network → Todas as requisições para backend devem ser 200/201/401

---

## 🔴 Troubleshooting

### "CORS error" (Access-Control-Allow-Origin missing)

**Causa**: `CORS_ORIGIN` não configurada ou errada no Railway

**Solução**:
1. Railway → Backend → Variables
2. Confirme `CORS_ORIGIN=https://seu-netlify.netlify.app`
3. Redeploy: `git push` ou Manual redeploy

### "404 Not Found" em `/auth/me` ou `/auth/signup`

**Causa**: Frontend chamando endereço errado ou `NEXT_PUBLIC_API_URL` não configurada

**Solução**:
1. Netlify → Site settings → Build & deploy → Environment
2. Adicione/confirme `NEXT_PUBLIC_API_URL=https://seu-backend-railway.app`
3. Trigger redeploy no Netlify

### "500 Internal Server Error" em signup

**Causa**: Erro no banco de dados (migrations não rodaram, user table não existe, etc)

**Solução**:
1. Railway → Backend → Logs
2. Procure por erro Prisma (P1000, P2002, etc)
3. Se P1000: DATABASE_URL inválida
4. Se P2002: Email duplicado
5. Se migration não rodou: SSH no Railway e execute:
   ```bash
   prisma db push
   prisma db seed
   ```

### "401 Unauthorized" em /auth/me sem token

**Normal!** Significa:
- Token não enviado OU
- Token inválido/expirado

Se estiver logado e ainda dá 401:
- Verificar se `JWT_SECRET` é igual entre signup/login e middleware

---

## 📊 Status Final (Checklist)

- [ ] Backend rodando no Railway
- [ ] `GET /health` retorna `ok`
- [ ] DATABASE_URL está válida e conecta
- [ ] JWT_SECRET, CORS_ORIGIN configurados
- [ ] Prisma migrations rodaram (`prestart` script)
- [ ] Frontend rodando no Netlify
- [ ] `NEXT_PUBLIC_API_URL` apontando para Railway
- [ ] DevTools mostra `[API] Using BASE URL: https://...railway.app`
- [ ] Signup funciona (cria usuário, retorna token)
- [ ] Login funciona (valida credenciais, retorna token)
- [ ] `/auth/me` funciona com token válido
- [ ] CORS headers presentes nas respostas

---

## 📞 Suporte Rápido

| Problema | Arquivo de Help |
|----------|---|
| CORS error | `FIX_CORS.md` |
| 404 em `/api/...` | `SETUP_NETLIFY.md` |
| 500 no signup | Ver logs Railway |
| Env variables | `docs/ENVIRONMENT.md` |
| Setup local | `README.md` |

---

## 🎉 Sucesso!

Se passou por todos os checks acima, **PedagoPass está em produção** e pronto para usar! 🚀
