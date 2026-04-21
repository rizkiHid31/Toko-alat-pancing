import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { calcDiscountedPrice } from '../utils/helpers';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const { category, search, sort, page = '1', limit = '12' } = req.query;

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = { slug: category };
  if (search) where.name = { contains: search as string, mode: 'insensitive' };

  let orderBy: Record<string, string> = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };
  if (sort === 'name') orderBy = { name: 'asc' };

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    success: true,
    data: products,
    meta: { total, page: parseInt(page as string), limit: take, totalPages: Math.ceil(total / take) },
  });
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  const product = await prisma.product.findFirst({
    where: { slug: req.params.slug, isActive: true },
    include: { category: { select: { name: true, slug: true } } },
  });

  if (!product) {
    res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    return;
  }
  res.json({ success: true, data: product });
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  res.json({ success: true, data: categories });
};

export const getFeaturedProducts = async (_req: Request, res: Response): Promise<void> => {
  const products = await prisma.product.findMany({
    where: { isActive: true, stock: { gt: 0 } },
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { category: { select: { name: true, slug: true } } },
  });
  res.json({ success: true, data: products });
};

export const getRelatedProducts = async (req: Request, res: Response): Promise<void> => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) { res.status(404).json({ success: false, message: 'Produk tidak ditemukan' }); return; }

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
    take: 4,
    include: { category: { select: { name: true, slug: true } } },
  });
  res.json({ success: true, data: related });
};
