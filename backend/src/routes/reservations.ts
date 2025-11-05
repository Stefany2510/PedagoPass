import { Router, Response } from 'express';
import type { AuthedRequest } from '../middleware/auth';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../prisma';

const router = Router();

router.get('/me', requireAuth, async (req: AuthedRequest, res: Response) => {
  const list = await prisma.reservation.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ reservations: list });
});

router.get('/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
  const r = await prisma.reservation.findUnique({ where: { id: String(req.params.id) } });
  if (!r || r.userId !== req.userId) return res.status(404).json({ error: 'Reserva não encontrada' });
  return res.json({ reservation: r });
});

router.post('/', requireAuth, async (req: AuthedRequest, res: Response) => {
  const { destinoSlug, destinoNome, destinoImagem, ida, volta, pessoas, formaPagamento, totalEstimado } = req.body as any;
  if (!destinoSlug || !destinoNome || !ida || !volta) return res.status(400).json({ error: 'Parâmetros inválidos' });
  const r = await prisma.reservation.create({
    data: {
      userId: req.userId!,
      destinoSlug: String(destinoSlug),
      destinoNome: String(destinoNome),
      destinoImagem: destinoImagem ? String(destinoImagem) : null,
      ida: new Date(ida),
      volta: new Date(volta),
      pessoas: Math.max(1, Number(pessoas || 1)),
      formaPagamento: formaPagamento ? String(formaPagamento) : null,
      totalEstimado: Math.max(0, Number(totalEstimado || 0)),
      status: 'pendente',
    },
  });
  return res.json({ ok: true, reservation: r });
});

router.patch('/:id/status', requireAuth, async (req: AuthedRequest, res: Response) => {
  const id = String(req.params.id);
  const { status } = req.body as { status?: 'pendente' | 'confirmada' | 'cancelada' };
  if (!status) return res.status(400).json({ error: 'Status inválido' });
  const current = await prisma.reservation.findUnique({ where: { id } });
  if (!current || current.userId !== req.userId) return res.status(404).json({ error: 'Reserva não encontrada' });
  const r = await prisma.reservation.update({ where: { id }, data: { status } });
  return res.json({ ok: true, reservation: r });
});

export default router;
