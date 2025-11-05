import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/server/session';
import { readDB } from '@/server/db';

export async function GET(req: NextRequest) {
  const uid = getSessionUserId(req);
  if (!uid) return NextResponse.json({ user: null }, { status: 200 });
  const db = await readDB();
  const user = db.users.find(u => u.id === uid);
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({ user: { id: user.id, nome: user.nome, email: user.email, createdAt: user.createdAt } });
}
