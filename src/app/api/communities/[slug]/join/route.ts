import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/server/session';
import { readDB, writeDB } from '@/server/db';
import { COMMUNITIES } from '@/data/communities';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const uid = getSessionUserId(req);
  if (!uid) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  const { slug } = params;
  const exists = COMMUNITIES.some(c => c.slug === slug);
  if (!exists) return NextResponse.json({ error: 'Comunidade não encontrada' }, { status: 404 });
  const db = await readDB();
  if (!db.memberships.some(m => m.userId === uid && m.slug === slug)) {
    db.memberships.push({ userId: uid, slug, joinedAt: new Date().toISOString() });
    await writeDB(db);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const uid = getSessionUserId(req);
  if (!uid) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  const { slug } = params;
  const db = await readDB();
  const next = db.memberships.filter(m => !(m.userId === uid && m.slug === slug));
  if (next.length !== db.memberships.length) {
    db.memberships = next;
    await writeDB(db);
  }
  return NextResponse.json({ ok: true });
}
