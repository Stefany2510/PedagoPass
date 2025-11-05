# 🚀 Deployment Guide - PedagoPass

## Frontend (Netlify)

### Configuration
1. Connect GitHub repo to Netlify
2. Build command: `npm ci && npm run build`
3. Publish directory: `.next`
4. Environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.example.com
   ```

### Smoke Test
```bash
curl -i https://pedagopass.netlify.app
# Should return 200 OK
```

---

## Backend (Railway / Vercel / Koyeb)

### Build
```bash
npm ci && npm run build
```

### Start
```bash
npm start
```

### Environment Variables

| Variable | Example | Required |
|----------|---------|----------|
| `PORT` | `8080` | No (default: 8080) |
| `NODE_ENV` | `production` | No |
| `LOG_LEVEL` | `info` | No |
| `DATABASE_URL` | `postgresql://...` | **Yes** |
| `JWT_SECRET` | `your-secret-key` | **Yes** |
| `CORS_ORIGIN` | `https://pedagopass.netlify.app` | **Yes** |

### Prisma Setup (First Deploy)

```bash
# 1. Push schema to database
npx prisma db push

# 2. (Optional) Seed database
npx prisma db seed

# 3. In production, use only:
npx prisma migrate deploy
```

**Important**: Never run `prisma migrate dev` in production.

### Health Check Path
```
/health
```

Returns: `200 ok`

### Smoke Test (After Deploy)

```bash
# Health check
curl -i https://api.example.com/health

# CORS test (should show Access-Control-Allow-Origin header)
curl -s -H "Origin: https://pedagopass.netlify.app" \
  -D- https://api.example.com/health | grep -i "access-control"
```

### Security Features
- ✅ Helmet (security headers)
- ✅ Compression (gzip)
- ✅ Rate limiting (300 req/min per IP)
- ✅ CORS restricted
- ✅ JSON size limit (1MB)
- ✅ Graceful shutdown

### Monitoring & Logs
- Pino logger (structured logs)
- Unhandled rejection tracking
- Uncaught exception handler

---

## Railway Specific (Recommended)

### Quick Setup

1. Create project on Railway
2. Add PostgreSQL database
3. Connect GitHub
4. Environment variables (from `.env.example`):
   ```
   PORT=8080
   NODE_ENV=production
   LOG_LEVEL=info
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=<generate-random-string>
   CORS_ORIGIN=https://pedagopass.netlify.app
   ```
5. Healthcheck: `/health`
6. Deploy!

### Database Seeding (if needed)
```bash
railway run npx prisma db seed
```

---

## Netlify + Railway Integration

### After Backend Deploys
1. Get API URL from Railway
2. In Netlify, set:
   ```
   NEXT_PUBLIC_API_URL=https://<railway-api>.railway.app
   ```
3. Trigger frontend redeploy

### Frontend Code
```typescript
// src/lib/api.ts
export function getBackendUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
}
```

---

## Common Issues

### CORS Error
- Check `CORS_ORIGIN` matches frontend domain
- Format: `https://example.com` (no trailing slash)
- Multiple: `https://site1.com,https://site2.com`

### Database Connection
- Verify `DATABASE_URL` is correct
- Test: `npx prisma db execute --stdin`
- Railway: Use copy-paste feature

### Rate Limit
- Default: 300 requests/minute per IP
- Adjust in `src/index.ts` if needed

### Port
- Railway/Koyeb often override PORT
- App respects `process.env.PORT`
- Health check: `GET /health`

---

## Rollback
```bash
git revert <commit-hash>
git push  # Auto-redeploy on both Netlify & Railway
```
