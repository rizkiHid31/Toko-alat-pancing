import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { getDashboard } from '../../controllers/admin/dashboard';
import adminProductRoutes from './products';
import adminOrderRoutes from './orders';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboard);
router.use('/products', adminProductRoutes);
router.use('/orders', adminOrderRoutes);

export default router;
