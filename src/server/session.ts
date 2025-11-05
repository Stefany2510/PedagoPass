import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'pp_session';
const MAX_AGE_DAYS = 30;

export function getSessionUserId(req?: NextRequest): string | null {
  try {
    if (req) {
      const val = req.cookies.get(SESSION_COOKIE)?.value;
      return val ?? null;
    }
    const store = cookies();
    return store.get(SESSION_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}

export function setSessionUserId(res: NextResponse, userId: string | null) {
  try {
    if (userId) {
      res.cookies.set(SESSION_COOKIE, userId, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: MAX_AGE_DAYS * 24 * 60 * 60,
      });
    } else {
      res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
    }
  } catch {}
}
