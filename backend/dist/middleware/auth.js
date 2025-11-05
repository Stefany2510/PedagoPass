"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const COOKIE_NAME = 'pp_session';
function extractToken(req) {
    const header = req.header('authorization');
    if (header?.startsWith('Bearer '))
        return header.slice(7);
    const fromCookie = req.cookies?.[COOKIE_NAME];
    return typeof fromCookie === 'string' ? fromCookie : null;
}
function auth(req, res, next) {
    const token = extractToken(req);
    if (!token)
        return res.status(401).json({ error: 'no_token' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'], clockTolerance: 5 });
        req.user = payload;
        if (typeof payload === 'object' && payload) {
            const data = payload;
            const candidate = (data.id ?? data.uid);
            if (candidate)
                req.userId = candidate;
        }
        return next();
    }
    catch {
        return res.status(401).json({ error: 'token_invalido' });
    }
}
function requireAuth(req, res, next) {
    return auth(req, res, next);
}
//# sourceMappingURL=auth.js.map