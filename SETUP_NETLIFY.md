# 🚀 Configurar NEXT_PUBLIC_API_URL no Netlify

## O Problema

No Netlify, se `NEXT_PUBLIC_API_URL` não estiver configurada, o frontend tenta chamar `/api/auth/me` no próprio domínio do Netlify, resultando em:

```
GET https://pedagopasss.netlify.app/api/auth/me 404 (Not Found)
```

Em vez de chamar o backend no Railway:

```
GET https://pedagopass-prod.railway.app/api/auth/me 401 (Unauthorized)
```

## ✅ Solução

### 1. Obter a URL do Backend no Railway

Acesse [railway.app](https://railway.app) → seu projeto → Backend service → copie a URL pública.

Exemplo: `https://pedagopass-prod.railway.app`

### 2. Configurar no Netlify Dashboard

1. Vá para **Site settings** → **Build & deploy** → **Environment**
2. Clique em **Edit variables**
3. Adicione:
   ```
   NEXT_PUBLIC_API_URL = https://pedagopass-prod.railway.app
   ```
   (sem `/api` no final — o frontend adiciona automaticamente)
4. Clique em **Save**

### 3. Redeploy Frontend

1. Vá para **Deploys**
2. Clique em **Trigger deploy** → **Clear cache and deploy site**
3. Aguarde ~2 min pela nova build
4. Tente fazer login novamente

---

## ✅ Verificação Local

Se estiver testando localmente, criar `.env.local` na raiz:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Depois rodar:
```bash
npm run dev
```

E abrir `http://localhost:3000` — o frontend vai chamar `http://localhost:4000/api/auth/...`

---

## 🔍 Debug

Para verificar qual URL o frontend está usando, abra **DevTools** (F12) → **Console** e veja:

```
[API] Using BASE URL: https://pedagopass-prod.railway.app
```

ou

```
[API] Using BASE URL: (não configurado - usando /api)
```

Se ver a segunda mensagem em produção, é porque `NEXT_PUBLIC_API_URL` não foi setada.

---

## Variáveis Similares em Diferentes Plataformas

| Plataforma | Nome da Var | Onde Configurar |
|---|---|---|
| **Netlify** | `NEXT_PUBLIC_API_URL` | Site settings → Environment |
| **Vercel** | `NEXT_PUBLIC_API_URL` | Project settings → Environment Variables |
| **Local Dev** | `.env.local` | Raiz do projeto |

---

## 🚨 Erros Comuns

### 1. 404 em `/api/auth/me`

**Causa**: `NEXT_PUBLIC_API_URL` não configurada
**Solução**: Adicionar em Netlify → Build & deploy → Environment

### 2. 500 em `/api/auth/signup`

**Causa**: Backend retorna erro (DB não migrou, credentials inválidas)
**Solução**: 
- Verificar logs do Railway
- Rodar `npm run prisma:push --prefix backend` no Railway
- Validar `DATABASE_URL` existe

### 3. CORS error

**Causa**: `CORS_ORIGIN` no backend não inclui domínio do Netlify
**Solução**: Em Railway → Variables, adicionar:
```
CORS_ORIGIN=https://pedagopasss.netlify.app
```

---

## Checklist Final

- [ ] Backend sobe no Railway sem erros
- [ ] `DATABASE_URL` está configurada no Railway
- [ ] `CORS_ORIGIN=https://pedagopasss.netlify.app` no Railway
- [ ] `NEXT_PUBLIC_API_URL=https://pedagopass-prod.railway.app` no Netlify
- [ ] Frontend redeploy após alterar env
- [ ] Login teste: entrar com email/senha válidos
- [ ] GET `/auth/me` retorna 200 com dados do usuário
