import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export type AuthedRequest = Request & { user?: any; userId?: string };

const COOKIE_NAME = 'pp_session';

function extractToken(req: Request): string | null {
  const header = req.header('authorization');
  if (header?.startsWith('Bearer ')) return header.slice(7);
  const fromCookie = (req as any).cookies?.[COOKIE_NAME];
  return typeof fromCookie === 'string' ? fromCookie : null;
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'no_token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ['HS256'], clockTolerance: 5 });
    (req as any).user = payload;
    if (typeof payload === 'object' && payload) {
      const data = payload as Record<string, unknown>;
      const candidate = (data.id ?? data.uid) as string | undefined;
      if (candidate) (req as any).userId = candidate;
    }
    return next();
  } catch {
    return res.status(401).json({ error: 'token_invalido' });
  }
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  return auth(req, res, next);
}
