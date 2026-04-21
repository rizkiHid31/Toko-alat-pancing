import { Router } from 'express';
import {
  adminGetOrders, adminGetOrder, adminUpdateOrderStatus,
  adminUpdateShipping, adminConfirmPayment,
} from '../../controllers/admin/orders';

const router = Router();

router.get('/', adminGetOrders);
router.get('/:id', adminGetOrder);
router.put('/:id/status', adminUpdateOrderStatus);
router.put('/:id/shipping', adminUpdateShipping);
router.put('/:id/confirm-payment', adminConfirmPayment);

export default router;
