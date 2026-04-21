import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { generateOrderNumber, calcDiscountedPrice } from '../utils/helpers';
import { sendOrderConfirmationToCustomer, sendNewOrderNotificationToAdmin } from '../services/email';

const prisma = new PrismaClient();

const orderSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1),
  shippingName: z.string().min(2),
  shippingPhone: z.string().min(8),
  shippingAddress: z.string().min(5),
  shippingCity: z.string().min(2),
  shippingProvince: z.string().min(2),
  shippingPostal: z.string().min(5),
  shippingCost: z.number().min(0),
  notes: z.string().optional(),
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional().or(z.literal('').transform(() => undefined)),
  guestPhone: z.string().optional(),
  courier: z.string().optional(),
});

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = orderSchema.parse(req.body);

  const products = await prisma.product.findMany({
    where: { id: { in: data.items.map((i) => i.productId) }, isActive: true },
  });

  if (products.length !== data.items.length) {
    res.status(400).json({ success: false, message: 'Beberapa produk tidak ditemukan' });
    return;
  }

  for (const item of data.items) {
    const product = products.find((p) => p.id === item.productId)!;
    if (product.stock < item.quantity) {
      res.status(400).json({ success: false, message: `Stok ${product.name} tidak mencukupi` });
      return;
    }
  }

  let subtotal = 0;
  const orderItems = data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const price = calcDiscountedPrice(product.price, product.discount);
    subtotal += price * item.quantity;
    return { productId: item.productId, productName: product.name, quantity: item.quantity, price };
  });

  const total = subtotal + data.shippingCost;
  const orderNumber = generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        orderNumber,
        userId: req.user?.userId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        shippingName: data.shippingName,
        shippingPhone: data.shippingPhone,
        shippingAddress: data.shippingAddress,
        shippingCity: data.shippingCity,
        shippingProvince: data.shippingProvince,
        shippingPostal: data.shippingPostal,
        shippingCost: data.shippingCost,
        notes: data.notes,
        subtotal,
        total,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return o;
  });

  const customerName = req.user ? (await prisma.user.findUnique({ where: { id: req.user.userId } }))?.name || '' : data.guestName || '';
  const customerEmail = req.user?.email || data.guestEmail || '';

  if (customerEmail) {
    await sendOrderConfirmationToCustomer({
      orderNumber,
      customerName,
      customerEmail,
      items: orderItems.map((i) => ({ name: i.productName, quantity: i.quantity, price: i.price })),
      subtotal,
      shippingCost: data.shippingCost,
      total,
      shippingAddress: data.shippingAddress,
      shippingCity: data.shippingCity,
      shippingProvince: data.shippingProvince,
    }).catch(console.error);
  }

  await sendNewOrderNotificationToAdmin({
    orderNumber,
    customerName,
    customerEmail,
    items: orderItems.map((i) => ({ name: i.productName, quantity: i.quantity, price: i.price })),
    subtotal,
    shippingCost: data.shippingCost,
    total,
    shippingAddress: data.shippingAddress,
    shippingCity: data.shippingCity,
    shippingProvince: data.shippingProvince,
  }).catch(console.error);

  res.status(201).json({ success: true, data: order });
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
  res.json({ success: true, data: orders });
};

export const getOrderByNumber = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await prisma.order.findUnique({
    where: { orderNumber: req.params.orderNumber },
    include: { items: true },
  });

  if (!order) { res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' }); return; }

  if (order.userId && order.userId !== req.user?.userId) {
    res.status(403).json({ success: false, message: 'Akses ditolak' });
    return;
  }

  res.json({ success: true, data: order });
};

export const trackOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await prisma.order.findUnique({
    where: { orderNumber: req.params.orderNumber },
    select: {
      orderNumber: true, status: true, paymentStatus: true,
      courier: true, trackingNumber: true,
      createdAt: true, updatedAt: true,
      shippingName: true, shippingCity: true, shippingProvince: true,
    },
  });

  if (!order) { res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' }); return; }
  res.json({ success: true, data: order });
};
