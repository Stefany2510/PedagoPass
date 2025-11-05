import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import auth from './routes/auth';
import api from './routes';

const allow = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allow.length === 0 || allow.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

const app = express();

// não bloqueie health com dependências externas
app.get('/health', (_req: Request, res: Response) => res.status(200).send('ok'));
app.get('/', (_req: Request, res: Response) => res.json({ ok: true, service: 'pedagopass-api' }));

app.set('trust proxy', 1);
app.use(cors(corsOptions));
const preflight = cors({ origin: allow.length === 0 ? true : allow, credentials: true });
app.options('*', preflight);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(['/auth', '/api/auth'], auth);
app.use(['/api', '/'], api);

app.use((req: Request, res: Response) => res.status(404).json({ ok: false, path: req.path }));
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Erro não tratado:', err?.stack || err?.message || err);
  if (!res.headersSent) res.status(500).json({ ok: false, error: 'internal_error' });
});

const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API on :${PORT}`);
});

process.on('unhandledRejection', (reason) => console.error('unhandledRejection', reason));
process.on('uncaughtException', (err) => console.error('uncaughtException', err));
