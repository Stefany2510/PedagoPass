import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/server/db';
import type { StoredUser } from '@/server/types';
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
  const { nome, email, senha } = body as { nome?: string; email?: string; senha?: string };

  if (!nome?.trim()) return NextResponse.json({ error: 'Informe seu nome.' }, { status: 400 });
  if (!email || !isEmailValid(email)) return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
  if (!senha || senha.length < 6) return NextResponse.json({ error: 'A senha deve ter ao menos 6 caracteres.' }, { status: 400 });

  const db = await readDB();
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return NextResponse.json({ error: 'Já existe uma conta com este e-mail.' }, { status: 409 });
  }

  const user: StoredUser = {
    id: `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`,
    nome: nome.trim(),
    email: email.toLowerCase(),
    passwordHash: hash256(senha),
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  await writeDB(db);

  const res = NextResponse.json({ ok: true, user: { id: user.id, nome: user.nome, email: user.email, createdAt: user.createdAt } });
  setSessionUserId(res, user.id);
  return res;
}
