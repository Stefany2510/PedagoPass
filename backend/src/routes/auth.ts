import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as authCtrl from '../controllers/auth';

const router = Router();

router.post('/signup-dev', authCtrl.signupDev);
router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);
router.post('/logout', authCtrl.logout);
router.get('/me', requireAuth, authCtrl.me);
router.post('/quick-token', requireAuth, authCtrl.createQuickToken);
router.post('/login/quick', authCtrl.loginWithQuickToken);
router.post('/reset-password', authCtrl.resetPassword);

export default router;
