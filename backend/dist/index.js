"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const auth_1 = __importDefault(require("./routes/auth"));
const routes_1 = __importDefault(require("./routes"));
const allow = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
const corsOptions = {
    origin: (origin, cb) => {
        if (!origin)
            return cb(null, true);
        if (allow.length === 0 || allow.includes(origin))
            return cb(null, true);
        return cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
const app = (0, express_1.default)();
// não bloqueie health com dependências externas
app.get('/health', (_req, res) => res.status(200).send('ok'));
app.get('/', (_req, res) => res.json({ ok: true, service: 'pedagopass-api' }));
app.set('trust proxy', 1);
app.use((0, cors_1.default)(corsOptions));
const preflight = (0, cors_1.default)({ origin: allow.length === 0 ? true : allow, credentials: true });
app.options('*', preflight);
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(['/auth', '/api/auth'], auth_1.default);
app.use(['/api', '/'], routes_1.default);
app.use((req, res) => res.status(404).json({ ok: false, path: req.path }));
app.use((err, _req, res, _next) => {
    console.error('Erro não tratado:', err?.stack || err?.message || err);
    if (!res.headersSent)
        res.status(500).json({ ok: false, error: 'internal_error' });
});
const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`API on :${PORT}`);
});
process.on('unhandledRejection', (reason) => console.error('unhandledRejection', reason));
process.on('uncaughtException', (err) => console.error('uncaughtException', err));
//# sourceMappingURL=index.js.map