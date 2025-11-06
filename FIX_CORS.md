# 🔧 Corrigir Erro CORS no Railway

## ❌ O Erro

```
Access to fetch at 'https://pedagopass-production-c410.up.railway.app/auth/me' 
from origin 'https://pedagopasss.netlify.app' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Causa

No Railway, a variável `CORS_ORIGIN` está:
- Vazia (não configurada)
- Ou com valor incorreto (ex: `http://localhost:3000`)

## 🚀 Solução

### 1. Acesse Railway Dashboard

1. Vá para [railway.app](https://railway.app)
2. Selecione seu projeto → Backend service
3. Vá para **Variables** (tab)

### 2. Verifique/Atualize `CORS_ORIGIN`

Procure pela variável `CORS_ORIGIN`. Se não existir ou estiver errada, corrija:

```
CORS_ORIGIN = https://pedagopasss.netlify.app
```

**Importante**: 
- ✅ Sem barra final (`https://pedagopasss.netlify.app`)
- ✅ Exato domínio do Netlify (incluindo `s` extra se for o caso)
- ❌ Sem `/api` no final

### 3. Se Tiver Múltiplos Domínios

Separe por vírgula:

```
CORS_ORIGIN = https://pedagopasss.netlify.app, https://localhost:3000
```

### 4. Redeploy Backend

1. No Railway → Backend service → **Redeploy**
2. Ou faça um `git push` se estiver com auto-deploy habilitado
3. Aguarde ~2 min

### 5. Teste

Abra DevTools no Netlify (F12 → Network) e tente fazer signup/login. Deve ver:

```
Response Headers:
Access-Control-Allow-Origin: https://pedagopasss.netlify.app
Access-Control-Allow-Credentials: true
```

---

## 🔍 Variáveis do Backend no Railway (Checklist)

Para que tudo funcione, confirme se estas estão configuradas:

| Variável | Valor | Obrigatória |
|----------|-------|---|
| `NODE_ENV` | `production` | ✅ |
| `PORT` | `8080` (ou deixar vazio) | ❌ |
| `DATABASE_URL` | `mysql://...` | ✅ |
| `JWT_SECRET` | Valor forte aleatório | ✅ |
| `CORS_ORIGIN` | `https://pedagopasss.netlify.app` | ✅ |
| `COOKIE_SECURE` | `true` | ⚠️ (recomendado) |
| `COOKIE_SAME_SITE` | `none` | ⚠️ (se usar cookies) |

---

## 🐛 Debug: Ver Logs do Backend

1. Railway → Backend service → **Logs**
2. Procure por linhas com `erro` ou `error`
3. Se ver `P1000` ou erro de database, significa DATABASE_URL está inválida

---

## Erros Comuns

### "Está tudo configurado mas ainda dá CORS error"

**Solução 1**: Railway pode ter cache. Faça redeploy forçado:
```bash
git push  # Força novo deploy
```

**Solução 2**: Verifique se a variável foi salva. Reabra Railway dashboard e confirme se `CORS_ORIGIN` está lá.

### "CORS error desapareceu mas agora dá 500 no signup"

Veja arquivo `ERROR_500_SIGNUP.md` para troubleshooting de database.

---

## Confirmação: Teste Manual

```bash
# Test CORS preflight
curl -i -X OPTIONS https://pedagopass-production-c410.up.railway.app/auth/signup \
  -H "Origin: https://pedagopasss.netlify.app" \
  -H "Access-Control-Request-Method: POST"

# Deve retornar 200 com headers:
# Access-Control-Allow-Origin: https://pedagopasss.netlify.app
# Access-Control-Allow-Credentials: true
```
