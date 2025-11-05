# Railway Deployment - PedagoPass Backend

## Quick Setup

### 1. Create Project
- Go to [railway.app](https://railway.app)
- New Project → GitHub (select PedagoPass repo)

### 2. Add Services

#### PostgreSQL Database
- Railway Dashboard → + New Service → Database → PostgreSQL
- Copy `DATABASE_URL` (it will be `${{Postgres.DATABASE_URL}}`)

### 3. Configure Backend

#### Root Directory
```
backend
```

#### Build Command
```bash
npm ci && npm run build
```

#### Start Command
```bash
npm start
```

#### Environment Variables
```
NODE_ENV=production
PORT=8080
LOG_LEVEL=info
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secret-key-here
CORS_ORIGIN=https://pedagopass.netlify.app
```

#### Healthcheck
- Path: `/health`
- Interval: 10s
- Timeout: 5s

### 4. Deploy

Railway auto-deploys from GitHub push. Just commit and push:

```bash
git add -A
git commit -m "chore: railway deployment ready"
git push
```

## Verification

### After Deploy

#### Test Health Endpoint
```bash
curl https://your-railway-url.up.railway.app/health
```

Expected output:
```
ok
```

#### Test CORS
```bash
curl -s -D- -H "Origin: https://pedagopass.netlify.app" \
  https://your-railway-url.up.railway.app/health | grep -i access-control-allow-origin
```

Expected header:
```
access-control-allow-origin: https://pedagopass.netlify.app
```

### Check Logs
- Railway Dashboard → Select Backend Service → Logs
- Should see: `✅ API listening on http://0.0.0.0:8080`

## Troubleshooting

### Health Check Fails
1. Temporarily change Healthcheck Path to `/` to confirm process is alive
2. Check logs for startup errors
3. Verify `NODE_ENV=production` is set

### CORS Still Blocked
1. Check `CORS_ORIGIN` environment variable
2. Verify frontend URL matches exactly (no trailing slash)
3. Restart deployment

### Database Connection Error
1. Verify `DATABASE_URL` is set and contains valid PostgreSQL URL
2. Run migrations: `railway run npx prisma migrate deploy`
3. Check database is online

### Port Already in Use
- Railway overrides PORT automatically
- If using custom port, set `PORT=3000` (for example) in env vars

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `NODE_ENV` | Production/Development flag | `production` |
| `PORT` | Server port | `8080` |
| `LOG_LEVEL` | Logging verbosity | `info` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `JWT_SECRET` | Auth token secret | `random-secret-key` |
| `CORS_ORIGIN` | Allowed frontend origin | `https://pedagopass.netlify.app` |

## Prisma Migrations

### First Deploy
```bash
# Via Railway shell
railway run npx prisma migrate deploy
# or
railway run npx prisma db push
```

### Subsequent Deploys
Migrations run automatically if added to `start` script, or:
```bash
railway run npx prisma migrate deploy
```

## Scaling

- Default: 1 instance
- To scale: Dashboard → Select service → Instances → increase count
- Railway automatically load balances

## Monitoring

- **Logs**: Dashboard → Logs tab
- **Metrics**: Dashboard → Metrics tab (CPU, Memory, Network)
- **Status**: Shows build/deploy status in real-time

## Rollback

If deployment fails:
1. Dashboard → Deployments
2. Select previous successful deployment
3. Click Redeploy

---

**Status**: ✅ Ready for Railway deployment
