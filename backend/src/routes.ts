import { Router } from 'express';
import meRoutes from './routes/me';
import communityRoutes from './routes/communities';
import reservationsRoutes from './routes/reservations';
import ordersRoutes from './routes/orders';

const r = Router();

r.use('/me', meRoutes);
r.use('/communities', communityRoutes);
r.use('/reservations', reservationsRoutes);
r.use('/orders', ordersRoutes);

export default r;
