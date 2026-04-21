import { Router } from 'express';
import { createOrder, getMyOrders, getOrderByNumber, trackOrder } from '../controllers/orders';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/', optionalAuth, createOrder);
router.get('/my', authenticate, getMyOrders);
router.get('/track/:orderNumber', trackOrder);
router.get('/:orderNumber', optionalAuth, getOrderByNumber);

export default router;
