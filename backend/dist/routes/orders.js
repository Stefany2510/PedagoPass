"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
router.get('/me', auth_1.requireAuth, async (req, res) => {
    const list = await prisma_1.prisma.order.findMany({
        where: { userId: req.userId },
        orderBy: { pagoEm: 'desc' },
    });
    return res.json({ orders: list });
});
router.get('/:id', auth_1.requireAuth, async (req, res) => {
    const o = await prisma_1.prisma.order.findUnique({ where: { id: String(req.params.id) } });
    if (!o || o.userId !== req.userId)
        return res.status(404).json({ error: 'Compra não encontrada' });
    return res.json({ order: o });
});
router.get('/by-reservation/:reservationId', auth_1.requireAuth, async (req, res) => {
    const { reservationId } = req.params;
    const o = await prisma_1.prisma.order.findFirst({ where: { reservationId, userId: req.userId }, orderBy: { pagoEm: 'desc' } });
    if (!o)
        return res.status(404).json({ error: 'Compra não encontrada' });
    return res.json({ order: o });
});
router.post('/mark-paid', auth_1.requireAuth, async (req, res) => {
    const { reservationId, metodo, parcelas } = req.body;
    if (!reservationId || !metodo)
        return res.status(400).json({ error: 'Parâmetros inválidos' });
    const r = await prisma_1.prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!r || r.userId !== req.userId)
        return res.status(404).json({ error: 'Reserva não encontrada' });
    const order = await prisma_1.prisma.order.create({
        data: {
            userId: r.userId,
            reservationId: r.id,
            destinoSlug: r.destinoSlug,
            destinoNome: r.destinoNome,
            total: r.totalEstimado,
            metodo,
            parcelas: parcelas ?? null,
        },
    });
    await prisma_1.prisma.reservation.update({ where: { id: r.id }, data: { status: 'confirmada' } });
    return res.json({ ok: true, order });
});
exports.default = router;
//# sourceMappingURL=orders.js.map