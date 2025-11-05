import { NextRequest, NextResponse } from 'next/server';
import { readDB } from '@/server/db';
import crypto from 'crypto';
import { setSessionUserId } from '@/server/session';

function isEmailValid(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

function hash256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, senha } = body as { email?: string; senha?: string };
  if (!email || !isEmailValid(email)) return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
  const db = await readDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return NextResponse.json({ error: 'Conta não encontrada.' }, { status: 404 });
  const hash = senha ? hash256(senha) : '';
  if (user.passwordHash !== hash) return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
  const res = NextResponse.json({ ok: true, user: { id: user.id, nome: user.nome, email: user.email, createdAt: user.createdAt } });
  setSessionUserId(res, user.id);
  return res;
}
