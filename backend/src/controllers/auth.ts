import { randomBytes } from 'crypto';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { verifyPassword, hashPassword } from '../auth';
import type { AuthedRequest } from '../middleware/auth';

async function validateUser(email?: string, password?: string) {
  if (!email || !password) return null;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null;
  const valid = verifyPassword(password, user.passwordHash);
  if (!valid) return null;
  return { id: user.id, email: user.email, nome: user.nome, createdAt: user.createdAt };
}

function signSession(input: { id: string; email: string; nome?: string }) {
  return jwt.sign(input, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

// Opção A — token Bearer na resposta
async function loginBearerMode(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  try {
    const user = await validateUser(email, password);
    if (!user) return res.status(401).json({ error: 'credenciais_invalidas' });

    const token = signSession({ id: user.id, email: user.email, nome: user.nome });
    return res.json({ ok: true, token, user });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
}

// Opção B — cookie HttpOnly
async function loginCookieMode(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  try {
    const user = await validateUser(email, password);
    if (!user) return res.status(401).json({ error: 'credenciais_invalidas' });

    const token = signSession({ id: user.id, email: user.email, nome: user.nome });
    res.cookie('pp_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return res.json({ ok: true, token, user });
  } catch (err) {
    console.error('Cookie login error:', err);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
}

export async function login(req: Request, res: Response) {
  // Opção A (Bearer) ativa por padrão
  return loginBearerMode(req, res);

  // Opção B — quando quiser migrar para cookies HttpOnly, troque pela linha abaixo:
  // return loginCookieMode(req, res);
}

void loginCookieMode; // evita warning até migrar para cookie-mode

export async function signup(req: Request, res: Response) {
  const { nome, email, senha } = req.body as { nome?: string; email?: string; senha?: string };
  if (!nome?.trim()) return res.status(400).json({ error: 'Informe seu nome.' });
  if (!email || !/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: 'E-mail inválido.' });
  if (!senha || senha.length < 6) return res.status(400).json({ error: 'A senha deve ter ao menos 6 caracteres.' });

  try {
    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) return res.status(409).json({ error: 'Já existe uma conta com este e-mail.' });

    const user = await prisma.user.create({
      data: {
        nome: nome.trim(),
        email: email.toLowerCase(),
        passwordHash: hashPassword(senha),
      },
    });

    const token = signSession({ id: user.id, email: user.email, nome: user.nome });
    return res.status(201).json({ ok: true, token, user: { id: user.id, nome: user.nome, email: user.email, createdAt: user.createdAt } });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('pp_session', { path: '/', sameSite: 'none', secure: true });
  return res.json({ ok: true });
}

export async function me(req: AuthedRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) return res.json({ ok: true, user: null });
    return res.json({ ok: true, user: { id: user.id, nome: user.nome, email: user.email, createdAt: user.createdAt } });
  } catch (err) {
    console.error('Failed to load /auth/me:', err);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
}

export async function createQuickToken(req: AuthedRequest, res: Response) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Não autenticado' });
  try {
    const token = randomBytes(24).toString('base64url');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await prisma.quickToken.create({ data: { userId, token, expiresAt } });
    return res.json({ ok: true, token, expiresAt });
  } catch (err) {
    console.error('Quick token creation error:', err);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
}

export async function loginWithQuickToken(req: Request, res: Response) {
  const { token } = req.body as { token?: string };
  if (!token) return res.status(400).json({ error: 'Token ausente' });

  try {
    const record = await prisma.quickToken.findUnique({ where: { token } });
    if (!record) return res.status(404).json({ error: 'Token inválido' });
    if (record.used) return res.status(400).json({ error: 'Token já utilizado' });
    if (record.expiresAt.getTime() < Date.now()) return res.status(400).json({ error: 'Token expirado' });

    const user = await prisma.user.findUnique({ where: { id: record.userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    await prisma.quickToken.update({ where: { token }, data: { used: true } });
    const jwtToken = signSession({ id: user.id, email: user.email, nome: user.nome });
    return res.json({ ok: true, token: jwtToken, user: { id: user.id, nome: user.nome, email: user.email, createdAt: user.createdAt } });
  } catch (err) {
    console.error('Quick login error:', err);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
}

export async function signupDev(_req: Request, res: Response) {
  return res.status(201).json({ ok: true });
}

export { loginCookieMode };
