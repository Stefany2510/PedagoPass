import { Router, Request, Response } from 'express';
import type { AuthedRequest } from '../middleware/auth';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../prisma';

const router = Router();

// Lista todas as comunidades com detalhes
router.get('/', async (_req: Request, res: Response) => {
  const list = await prisma.community.findMany({ orderBy: { nome: 'asc' } });
  // Converte CSV de tags em array
  const communities = list.map((c: any) => ({
    slug: c.slug,
    nome: c.nome,
    descricao: c.descricao,
    membros: c.membros,
  tags: c.tags ? c.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    capa: c.capa ?? undefined,
  }));
  return res.json({ communities });
});

// Detalhe de uma comunidade
router.get('/:slug', async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  const c = await prisma.community.findUnique({ where: { slug } });
  if (!c) return res.status(404).json({ error: 'Comunidade não encontrada' });
  const community = {
    slug: c.slug,
    nome: c.nome,
    descricao: c.descricao,
    membros: c.membros,
    tags: c.tags ? c.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    capa: c.capa ?? undefined,
  };
  return res.json({ community });
});

router.post('/:slug/join', requireAuth, async (req: AuthedRequest, res: Response) => {
  const slug = String(req.params.slug);
  try {
    await prisma.communityMembership.upsert({
      where: { userId_slug: { userId: req.userId!, slug } },
      update: {},
      create: { userId: req.userId!, slug },
    });
    return res.json({ ok: true });
  } catch (err: any) {
    // P2002 = unique constraint violation (já existe)
    if (err.code === 'P2002') {
      return res.json({ ok: true }); // Já membro, retorna sucesso
    }
    console.error('Join community error:', err);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

router.delete('/:slug/join', requireAuth, async (req: AuthedRequest, res: Response) => {
  const slug = String(req.params.slug);
  await prisma.communityMembership.deleteMany({ where: { userId: req.userId!, slug } });
  return res.json({ ok: true });
});

export default router;
