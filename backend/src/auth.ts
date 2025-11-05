import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config';

export function hashPassword(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function verifyPassword(input: string, hash: string) {
  return hashPassword(input) === hash;
}

export function verifyToken(token: string): { uid: string } | null {
  try {
    const data = jwt.verify(token, JWT_SECRET) as { uid: string };
    return data;
  } catch {
    return null;
  }
}
