# Environment Variables Guide - PedagoPass

Complete reference for configuring PedagoPass for development and production deployments (Railway + Netlify).

---

## Quick Start

### Backend (Railway)

1. Copy `ops/env/.env.railway.example` to `backend/.env`
2. Fill in required values:
   - `DATABASE_URL` (MySQL connection)
   - `JWT_SECRET` (strong random string, min 32 chars)
   - `CORS_ORIGIN` (frontend domain, e.g., `https://pedagopass.netlify.app`)
3. Deploy to Railway with env vars configured in dashboard

### Frontend (Netlify)

1. Copy `ops/env/.env.netlify.example` to `.env.local` (for local dev)
2. Set `NEXT_PUBLIC_API_URL` to backend URL
3. In Netlify Dashboard → Site settings → Environment, configure the same vars
4. Deploy; Netlify will inject these variables at build time

---

## Environment Variable Categorization

### Required (Production)

These **must** be set in production or the application will fail:

| Variable | Scope | Description | Example |
|----------|-------|-------------|---------|
| `DATABASE_URL` | Backend | MySQL connection string | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Backend | Token signing secret (min 32 chars) | `abc...xyz` (generate with `openssl rand -base64 32`) |
| `CORS_ORIGIN` | Backend | Allowed frontend origins (no slash) | `https://pedagopass.netlify.app` |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend API URL (no slash) | `https://api.railway.app` |

### Strongly Recommended (Production)

These should be set for security and observability:

| Variable | Scope | Description | Default | Suggestion |
|----------|-------|-------------|---------|-----------|
| `NODE_ENV` | Backend | Environment mode | `development` | Set to `production` in Railway |
| `LOG_LEVEL` | Backend | Logging verbosity | `debug` (dev) / `info` (prod) | `info` for production |
| `COOKIE_SECURE` | Backend | HTTPS-only cookies | `false` | Set to `true` for production |
| `COOKIE_SAME_SITE` | Backend | Cross-site cookie policy | `lax` | Set to `none` for Netlify → Railway |
| `SESSION_SECRET` | Backend | Session cookie signing key | `dev-secret` | Generate with `openssl rand -base64 32` |

### Optional (Development/Advanced)

These are only needed for specific features:

| Variable | Scope | When Needed | Purpose |
|----------|-------|------------|---------|
| `PORT` | Backend | If Railway doesn't override | Server port (default: 8080) |
| `TZ` | Backend | For accurate timestamps | Timezone (default: UTC) |
| `SHADOW_DATABASE_URL` | Backend | Complex database migrations | Prisma shadow DB |
| `NEXT_PUBLIC_DEMO_EMAIL` | Frontend | Demo mode | Pre-fill login form |
| `NEXT_PUBLIC_DEMO_PASSWORD` | Frontend | Demo mode | Pre-fill login form |
| `RATE_LIMIT_*` | Backend | If rate limiting added | Request throttling |
| `SMTP_*` | Backend | If email features added | SMTP server config |
| `S3_*` | Backend | If S3 uploads added | Object storage |
| `REDIS_URL` | Backend | If caching added | Redis connection |
| `NEXT_PUBLIC_GTAG_ID` | Frontend | If analytics needed | Google Analytics |

---

## Development Setup

### Local Backend + Frontend

1. **Backend (.env)**
   ```env
   NODE_ENV=development
   PORT=4000
   DATABASE_URL=mysql://localhost:3306/pedagopass_dev
   JWT_SECRET=dev-secret-change-in-prod
   CORS_ORIGIN=http://localhost:3000
   ```

2. **Frontend (.env.local)**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   NEXT_PUBLIC_ENV=dev
   ```

3. Run backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. In another terminal, run frontend:
   ```bash
   npm install
   npm run dev
   ```

5. Open `http://localhost:3000`

---

## Production Setup (Railway + Netlify)

### Backend on Railway

1. Connect GitHub repo to Railway
2. Set **Root Directory**: `backend`
3. Configure **Environment Variables** in Railway dashboard:

   ```
   NODE_ENV=production
   PORT=8080  # Railway will override if needed
   DATABASE_URL=<your-mysql-url>
   JWT_SECRET=<generate-with-openssl>
   CORS_ORIGIN=https://pedagopass.netlify.app
   COOKIE_SECURE=true
   COOKIE_SAME_SITE=none
   SESSION_SECRET=<generate-with-openssl>
   ```

4. Set **Build Command**: `npm ci && npm run build`
5. Set **Start Command**: `npm start`
6. Configure **Healthcheck**: `GET /health`
7. Deploy; get the public URL (e.g., `https://pedagopass-prod.railway.app`)

### Frontend on Netlify

1. Connect GitHub repo to Netlify
2. Set **Build Command**: `npm ci && npm run build`
3. Set **Publish Directory**: `.next`
4. Configure **Environment Variables**:

   ```
   NEXT_PUBLIC_API_URL=https://pedagopass-prod.railway.app
   NEXT_PUBLIC_ENV=prod
   ```

5. Deploy; update once backend URL is known

---

## Key Differences: DEV vs PROD

| Aspect | Development | Production |
|--------|-------------|-----------|
| **NODE_ENV** | `development` | `production` |
| **Database** | Local SQLite or dev MySQL | Hosted MySQL (AlwaysData, AWS RDS, etc.) |
| **JWT_SECRET** | Can be simple | Must be strong (32+ chars, `openssl rand -base64 32`) |
| **CORS_ORIGIN** | `http://localhost:3000` | `https://pedagopass.netlify.app` (no trailing slash) |
| **COOKIE_SECURE** | `false` | `true` (requires HTTPS) |
| **COOKIE_SAME_SITE** | `lax` (default) | `none` (for cross-site) |
| **LOG_LEVEL** | `debug` | `info` |
| **NEXT_PUBLIC_API_URL** | `http://localhost:4000` | `https://api-prod.railway.app` |
| **NEXT_PUBLIC_DEMO_*** | Can be set | Should not be set (security) |

---

## How to Generate Strong Secrets

```bash
# Generate 32-byte base64 secret (recommended for JWT_SECRET, SESSION_SECRET)
openssl rand -base64 32

# Or using node:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Example output: `aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890+=`

---

## Validation Checklist

Before deploying:

- [ ] Backend `.env` has all required vars (DATABASE_URL, JWT_SECRET, CORS_ORIGIN)
- [ ] Frontend has NEXT_PUBLIC_API_URL pointing to backend
- [ ] CORS_ORIGIN is set to exact frontend domain (no trailing slash, no `http://`)
- [ ] DATABASE_URL is tested and connects successfully
- [ ] JWT_SECRET and SESSION_SECRET are strong (32+ chars)
- [ ] COOKIE_SECURE=true and COOKIE_SAME_SITE=none in production
- [ ] Health check works: `curl https://your-backend/health`
- [ ] Login works: POST to `/auth/login` with valid credentials
- [ ] Frontend can fetch data from backend (check CORS headers)

---

## Troubleshooting

### 500 Error on `/auth/signup`

**Cause**: Database connection failed or DATABASE_URL is invalid.

**Fix**:
1. Verify DATABASE_URL is correct (copy from Railway/Supabase dashboard)
2. Test connection: `mysql -u user -p -h host -D dbname`
3. Ensure Prisma migrations ran: `npm run prisma:push`

### 401 Unauthorized on Protected Routes

**Cause**: Token not sent, invalid format, or JWT_SECRET mismatch.

**Fix**:
1. Verify token is sent in `Authorization: Bearer <token>` header
2. Check JWT_SECRET matches between login and middleware
3. Test: `curl -H "Authorization: Bearer <token>" https://api/auth/me`

### CORS Error ("Origin not allowed")

**Cause**: CORS_ORIGIN doesn't match frontend domain or has trailing slash.

**Fix**:
1. Set `CORS_ORIGIN=https://pedagopass.netlify.app` (no trailing slash)
2. Verify frontend actually comes from that domain
3. Check cookie settings: `secure=true`, `sameSite=none`

### 404 on `/api/auth/me`

**Cause**: Frontend is calling wrong URL (hitting Next.js `/api` instead of backend).

**Fix**:
1. Set `NEXT_PUBLIC_API_URL=https://backend-url` (no trailing slash)
2. Check `src/lib/api.ts` is using this variable
3. Inspect Network tab: requests should go to backend, not `/api/...` locally

---

## Scripts for Env Management

Located in `ops/env/`:

```bash
# Print env audit table (oblig vs optional)
npm run env:report

# Validate backend env (in production)
npm run env:check:backend

# Validate frontend env (in development)
npm run env:check:frontend
```

---

## Additional Resources

- [Prisma Database URLs](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [Railway Docs](https://docs.railway.app/)
- [Netlify Env Vars](https://docs.netlify.com/configure-builds/environment-variables/)
- [Next.js Env Vars](https://nextjs.org/docs/basic-features/environment-variables)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [HTTP Cookie Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
