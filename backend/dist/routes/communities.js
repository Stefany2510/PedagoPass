"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
// Lista todas as comunidades com detalhes
router.get('/', async (_req, res) => {
    const list = await prisma_1.prisma.community.findMany({ orderBy: { nome: 'asc' } });
    // Converte CSV de tags em array
    const communities = list.map((c) => ({
        slug: c.slug,
        nome: c.nome,
        descricao: c.descricao,
        membros: c.membros,
        tags: c.tags ? c.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        capa: c.capa ?? undefined,
    }));
    return res.json({ communities });
});
// Detalhe de uma comunidade
router.get('/:slug', async (req, res) => {
    const slug = String(req.params.slug);
    const c = await prisma_1.prisma.community.findUnique({ where: { slug } });
    if (!c)
        return res.status(404).json({ error: 'Comunidade não encontrada' });
    const community = {
        slug: c.slug,
        nome: c.nome,
        descricao: c.descricao,
        membros: c.membros,
        tags: c.tags ? c.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        capa: c.capa ?? undefined,
    };
    return res.json({ community });
});
router.post('/:slug/join', auth_1.requireAuth, async (req, res) => {
    const slug = String(req.params.slug);
    await prisma_1.prisma.communityMembership.upsert({
        where: { userId_slug: { userId: req.userId, slug } },
        update: {},
        create: { userId: req.userId, slug },
    });
    return res.json({ ok: true });
});
router.delete('/:slug/join', auth_1.requireAuth, async (req, res) => {
    const slug = String(req.params.slug);
    await prisma_1.prisma.communityMembership.deleteMany({ where: { userId: req.userId, slug } });
    return res.json({ ok: true });
});
exports.default = router;
//# sourceMappingURL=communities.js.map