import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/server/session';
import { readDB } from '@/server/db';
import { COMMUNITIES } from '@/data/communities';

export async function GET(req: NextRequest) {
  const uid = getSessionUserId(req);
  if (!uid) return NextResponse.json({ communities: [] });
  const db = await readDB();
  const slugs = new Set(db.memberships.filter(m => m.userId === uid).map(m => m.slug));
  const list = COMMUNITIES.filter(c => slugs.has(c.slug));
  return NextResponse.json({ communities: list });
}
