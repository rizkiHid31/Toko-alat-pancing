import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require('midtrans-client');
import { config } from '../config';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const snap = new midtransClient.Snap({
  isProduction: config.midtrans.isProduction,
  serverKey: config.midtrans.serverKey,
  clientKey: config.midtrans.clientKey,
});

export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderNumber } = req.body;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, user: true },
  });

  if (!order) { res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' }); return; }
  if (order.paymentStatus === 'PAID') {
    res.status(400).json({ success: false, message: 'Pesanan sudah dibayar' });
    return;
  }

  const customerName = order.user?.name || order.guestName || 'Guest';
  const customerEmail = order.user?.email || order.guestEmail || 'guest@example.com';
  const customerPhone = order.user?.phone || order.guestPhone || '';

  const parameter = {
    transaction_details: {
      order_id: order.orderNumber,
      gross_amount: Math.round(order.total),
    },
    customer_details: {
      first_name: customerName,
      email: customerEmail,
      phone: customerPhone,
    },
    item_details: [
      ...order.items.map((item) => ({
        id: item.productId,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.productName.substring(0, 50),
      })),
      ...(order.shippingCost > 0
        ? [{ id: 'SHIPPING', price: Math.round(order.shippingCost), quantity: 1, name: 'Ongkos Kirim' }]
        : []),
    ],
  };

  const transaction = await snap.createTransaction(parameter);

  await prisma.order.update({
    where: { id: order.id },
    data: { midtransToken: transaction.token, midtransOrderId: order.orderNumber },
  });

  res.json({
    success: true,
    data: {
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      clientKey: config.midtrans.clientKey,
    },
  });
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const notification = req.body;
  const orderId = notification.order_id;
  const transactionStatus = notification.transaction_status;
  const fraudStatus = notification.fraud_status;

  let paymentStatus: 'PAID' | 'FAILED' | 'PENDING' = 'PENDING';

  if (transactionStatus === 'capture') {
    paymentStatus = fraudStatus === 'accept' ? 'PAID' : 'FAILED';
  } else if (transactionStatus === 'settlement') {
    paymentStatus = 'PAID';
  } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
    paymentStatus = 'FAILED';
  }

  const updateData: Record<string, unknown> = { paymentStatus, paymentMethod: notification.payment_type };
  if (paymentStatus === 'PAID') {
    updateData.paidAt = new Date();
    updateData.status = 'CONFIRMED';
  }

  await prisma.order.update({
    where: { orderNumber: orderId },
    data: updateData,
  });

  res.json({ success: true });
};

export const getClientKey = (_req: Request, res: Response): void => {
  res.json({ success: true, data: { clientKey: config.midtrans.clientKey } });
};
