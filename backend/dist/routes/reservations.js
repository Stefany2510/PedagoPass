"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
router.get('/me', auth_1.requireAuth, async (req, res) => {
    const list = await prisma_1.prisma.reservation.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
    });
    return res.json({ reservations: list });
});
router.get('/:id', auth_1.requireAuth, async (req, res) => {
    const r = await prisma_1.prisma.reservation.findUnique({ where: { id: String(req.params.id) } });
    if (!r || r.userId !== req.userId)
        return res.status(404).json({ error: 'Reserva não encontrada' });
    return res.json({ reservation: r });
});
router.post('/', auth_1.requireAuth, async (req, res) => {
    const { destinoSlug, destinoNome, destinoImagem, ida, volta, pessoas, formaPagamento, totalEstimado } = req.body;
    if (!destinoSlug || !destinoNome || !ida || !volta)
        return res.status(400).json({ error: 'Parâmetros inválidos' });
    const r = await prisma_1.prisma.reservation.create({
        data: {
            userId: req.userId,
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
router.patch('/:id/status', auth_1.requireAuth, async (req, res) => {
    const id = String(req.params.id);
    const { status } = req.body;
    if (!status)
        return res.status(400).json({ error: 'Status inválido' });
    const current = await prisma_1.prisma.reservation.findUnique({ where: { id } });
    if (!current || current.userId !== req.userId)
        return res.status(404).json({ error: 'Reserva não encontrada' });
    const r = await prisma_1.prisma.reservation.update({ where: { id }, data: { status } });
    return res.json({ ok: true, reservation: r });
});
exports.default = router;
//# sourceMappingURL=reservations.js.map