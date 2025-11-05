"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.signup = signup;
exports.logout = logout;
exports.me = me;
exports.createQuickToken = createQuickToken;
exports.loginWithQuickToken = loginWithQuickToken;
exports.signupDev = signupDev;
exports.loginCookieMode = loginCookieMode;
const crypto_1 = require("crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../prisma");
const auth_1 = require("../auth");
async function validateUser(email, password) {
    if (!email || !password)
        return null;
    const user = await prisma_1.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user)
        return null;
    const valid = (0, auth_1.verifyPassword)(password, user.passwordHash);
    if (!valid)
        return null;
    return { id: user.id, email: user.email, nome: user.nome, createdAt: user.createdAt };
}
function signSession(input) {
    return jsonwebtoken_1.default.sign(input, process.env.JWT_SECRET, { expiresIn: '7d' });
}
// Opção A — token Bearer na resposta
async function loginBearerMode(req, res) {
    const { email, password } = req.body;
    const user = await validateUser(email, password);
    if (!user)
        return res.status(401).json({ error: 'credenciais_invalidas' });
    const token = signSession({ id: user.id, email: user.email, nome: user.nome });
    return res.json({ ok: true, token, user });
}
// Opção B — cookie HttpOnly
async function loginCookieMode(req, res) {
    const { email, password } = req.body;
    const user = await validateUser(email, password);
    if (!user)
        return res.status(401).json({ error: 'credenciais_invalidas' });
    const token = signSession({ id: user.id, email: user.email, nome: user.nome });
    res.cookie('pp_session', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return res.json({ ok: true, token, user });
}
async function login(req, res) {
    // Opção A (Bearer) ativa por padrão
    return loginBearerMode(req, res);
    // Opção B — quando quiser migrar para cookies HttpOnly, troque pela linha abaixo:
    // return loginCookieMode(req, res);
}
void loginCookieMode; // evita warning até migrar para cookie-mode
async function signup(req, res) {
    const { nome, email, senha } = req.body;
    if (!nome?.trim())
        return res.status(400).json({ error: 'Informe seu nome.' });
    if (!email || !/\S+@\S+\.\S+/.test(email))
        return res.status(400).json({ error: 'E-mail inválido.' });
    if (!senha || senha.length < 6)
        return res.status(400).json({ error: 'A senha deve ter ao menos 6 caracteres.' });
    const exists = await prisma_1.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists)
        return res.status(409).json({ error: 'Já existe uma conta com este e-mail.' });
    const user = await prisma_1.prisma.user.create({
        data: {
            nome: nome.trim(),
            email: email.toLowerCase(),
            passwordHash: (0, auth_1.hashPassword)(senha),
        },
    });
    const token = signSession({ id: user.id, email: user.email, nome: user.nome });
    return res.status(201).json({ ok: true, token, user: { id: user.id, nome: user.nome, email: user.email, createdAt: user.createdAt } });
}
async function logout(_req, res) {
    res.clearCookie('pp_session', { path: '/', sameSite: 'none', secure: true });
    return res.json({ ok: true });
}
async function me(req, res) {
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: req.userId } });
        if (!user)
            return res.json({ ok: true, user: null });
        return res.json({ ok: true, user: { id: user.id, nome: user.nome, email: user.email, createdAt: user.createdAt } });
    }
    catch (err) {
        console.error('Failed to load /auth/me:', err);
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
}
async function createQuickToken(req, res) {
    const userId = req.userId;
    if (!userId)
        return res.status(401).json({ error: 'Não autenticado' });
    const token = (0, crypto_1.randomBytes)(24).toString('base64url');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await prisma_1.prisma.quickToken.create({ data: { userId, token, expiresAt } });
    return res.json({ ok: true, token, expiresAt });
}
async function loginWithQuickToken(req, res) {
    const { token } = req.body;
    if (!token)
        return res.status(400).json({ error: 'Token ausente' });
    const record = await prisma_1.prisma.quickToken.findUnique({ where: { token } });
    if (!record)
        return res.status(404).json({ error: 'Token inválido' });
    if (record.used)
        return res.status(400).json({ error: 'Token já utilizado' });
    if (record.expiresAt.getTime() < Date.now())
        return res.status(400).json({ error: 'Token expirado' });
    const user = await prisma_1.prisma.user.findUnique({ where: { id: record.userId } });
    if (!user)
        return res.status(404).json({ error: 'Usuário não encontrado' });
    await prisma_1.prisma.quickToken.update({ where: { token }, data: { used: true } });
    const jwtToken = signSession({ id: user.id, email: user.email, nome: user.nome });
    return res.json({ ok: true, token: jwtToken, user: { id: user.id, nome: user.nome, email: user.email, createdAt: user.createdAt } });
}
async function signupDev(_req, res) {
    return res.status(201).json({ ok: true });
}
//# sourceMappingURL=auth.js.map