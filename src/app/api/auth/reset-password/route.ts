import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/server/db';
import crypto from 'crypto';

function isEmailValid(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

function hashPassword(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, senha } = body as { email?: string; senha?: string };

  if (!email || !isEmailValid(email)) {
    return NextResponse.json({ ok: false, error: 'E-mail inválido.', found: false }, { status: 400 });
  }

  const db = await readDB();
  const idx = db.users.findIndex((user) => user.email.toLowerCase() === email.toLowerCase());

  if (idx === -1) {
    return NextResponse.json({ ok: false, found: false }, { status: 404 });
  }

  if (!senha) {
    return NextResponse.json({ ok: true, found: true });
  }

  if (senha.length < 6) {
    return NextResponse.json({ ok: false, error: 'A nova senha deve ter ao menos 6 caracteres.' }, { status: 400 });
  }

  const user = db.users[idx];
  db.users[idx] = { ...user, passwordHash: hashPassword(senha) };
  await writeDB(db);

  return NextResponse.json({ ok: true, updated: true });
}
