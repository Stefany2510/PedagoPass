import { NextResponse } from 'next/server';
import { setSessionUserId } from '@/server/session';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  setSessionUserId(res, null);
  return res;
}
