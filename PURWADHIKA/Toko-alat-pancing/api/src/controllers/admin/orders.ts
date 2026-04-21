import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { sendShippingUpdateToCustomer } from '../../services/email';

const prisma = new PrismaClient();

export const adminGetOrders = async (req: Request, res: Response): Promise<void> => {
  const { status, paymentStatus, search, page = '1', limit = '20' } = req.query;
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search as string, mode: 'insensitive' } },
      { shippingName: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
      include: { items: true, user: { select: { name: true, email: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    success: true,
    data: orders,
    meta: { total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) },
  });
};

export const adminGetOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: { select: { images: true } } } }, user: true },
  });
  if (!order) { res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' }); return; }
  res.json({ success: true, data: order });
};

export const adminUpdateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({ status: z.nativeEnum(OrderStatus) });
  const { status } = schema.parse(req.body);

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
    include: { user: true },
  });

  res.json({ success: true, data: order });
};

export const adminUpdateShipping = async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    courier: z.string().min(1),
    trackingNumber: z.string().min(1),
    shippingCost: z.number().min(0).optional(),
  });
  const { courier, trackingNumber, shippingCost } = schema.parse(req.body);

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      courier,
      trackingNumber,
      status: 'SHIPPED',
      ...(shippingCost !== undefined && { shippingCost }),
    },
    include: { user: true },
  });

  const customerEmail = order.user?.email || order.guestEmail;
  const customerName = order.user?.name || order.guestName || 'Customer';

  if (customerEmail) {
    await sendShippingUpdateToCustomer({
      customerEmail,
      customerName,
      orderNumber: order.orderNumber,
      courier,
      trackingNumber,
    }).catch(console.error);
  }

  res.json({ success: true, data: order });
};

export const adminConfirmPayment = async (req: Request, res: Response): Promise<void> => {
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { paymentStatus: 'PAID', paidAt: new Date(), status: 'CONFIRMED' },
  });
  res.json({ success: true, data: order });
};
