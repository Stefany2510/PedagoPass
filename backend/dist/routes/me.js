"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../auth");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: req.userId } });
    if (!user)
        return res.json({ user: null });
    return res.json({ user: { id: user.id, nome: user.nome, email: user.email, createdAt: user.createdAt } });
});
router.get('/communities', auth_1.requireAuth, async (req, res) => {
    const items = await prisma_1.prisma.communityMembership.findMany({ where: { userId: req.userId }, select: { slug: true } });
    const slugs = items.map((i) => i.slug);
    return res.json({ communities: slugs });
});
router.post('/password', auth_1.requireAuth, async (req, res) => {
    const { current, next } = req.body;
    if (!next || next.length < 6)
        return res.status(400).json({ error: 'A nova senha deve ter ao menos 6 caracteres.' });
    const user = await prisma_1.prisma.user.findUnique({ where: { id: req.userId } });
    if (!user)
        return res.status(404).json({ error: 'Usuário não encontrado.' });
    if (!current || !(0, auth_2.verifyPassword)(current, user.passwordHash))
        return res.status(401).json({ error: 'Senha atual incorreta.' });
    await prisma_1.prisma.user.update({ where: { id: user.id }, data: { passwordHash: (0, auth_2.hashPassword)(next) } });
    return res.json({ ok: true });
});
exports.default = router;
//# sourceMappingURL=me.js.map