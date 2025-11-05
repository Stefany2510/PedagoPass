import { Router, Response } from 'express';
import type { AuthedRequest } from '../middleware/auth';
import { requireAuth } from '../middleware/auth';
import { verifyPassword, hashPassword } from '../auth';
import { prisma } from '../prisma';

const router = Router();

router.get('/', requireAuth, async (req: AuthedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) return res.json({ user: null });
  return res.json({ user: { id: user.id, nome: user.nome, email: user.email, createdAt: user.createdAt } });
});

router.get('/communities', requireAuth, async (req: AuthedRequest, res: Response) => {
  const items: { slug: string }[] = await prisma.communityMembership.findMany({ where: { userId: req.userId! }, select: { slug: true } });
  const slugs: string[] = items.map((i) => i.slug);
  return res.json({ communities: slugs });
});

router.post('/password', requireAuth, async (req: AuthedRequest, res: Response) => {
  const { current, next } = req.body as { current?: string; next?: string };
  if (!next || next.length < 6) return res.status(400).json({ error: 'A nova senha deve ter ao menos 6 caracteres.' });
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  if (!current || !verifyPassword(current, user.passwordHash)) return res.status(401).json({ error: 'Senha atual incorreta.' });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(next) } });
  return res.json({ ok: true });
});

export default router;
