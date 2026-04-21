import { Router } from 'express';
import { createPayment, handleWebhook, getClientKey } from '../controllers/payments';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/client-key', getClientKey);
router.post('/create', optionalAuth, createPayment);
router.post('/webhook', handleWebhook);

export default router;
