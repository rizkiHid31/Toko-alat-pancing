import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { uploadImage } from '../../services/cloudinary';

const prisma = new PrismaClient();

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string(),
  discount: z.coerce.number().min(0).max(100).optional().nullable(),
  isActive: z.coerce.boolean().optional(),
});

export const adminGetProducts = async (req: Request, res: Response): Promise<void> => {
  const { search, category, page = '1', limit = '20' } = req.query;
  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search as string, mode: 'insensitive' };
  if (category) where.categoryId = category;

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
      include: { category: { select: { name: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    success: true,
    data: products,
    meta: { total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) },
  });
};

export const adminGetProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { category: true },
  });
  if (!product) { res.status(404).json({ success: false, message: 'Produk tidak ditemukan' }); return; }
  res.json({ success: true, data: product });
};

export const adminCreateProduct = async (req: Request, res: Response): Promise<void> => {
  const data = productSchema.parse(req.body);
  const files = req.files as Express.Multer.File[];

  let imageUrls: string[] = [];
  if (files && files.length > 0) {
    imageUrls = await Promise.all(files.map((f) => uploadImage(f)));
  }

  const slug = slugify(data.name, { lower: true, strict: true });
  const existing = await prisma.product.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const product = await prisma.product.create({
    data: { ...data, slug: finalSlug, images: imageUrls },
    include: { category: true },
  });

  res.status(201).json({ success: true, data: product });
};

export const adminUpdateProduct = async (req: Request, res: Response): Promise<void> => {
  const data = productSchema.partial().parse(req.body);
  const files = req.files as Express.Multer.File[];

  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) { res.status(404).json({ success: false, message: 'Produk tidak ditemukan' }); return; }

  let images = existing.images;
  if (files && files.length > 0) {
    const newImages = await Promise.all(files.map((f) => uploadImage(f)));
    images = [...images, ...newImages];
  }

  const updateData: Record<string, unknown> = { ...data, images };
  if (data.name && data.name !== existing.name) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const slugExists = await prisma.product.findFirst({ where: { slug, id: { not: req.params.id } } });
    updateData.slug = slugExists ? `${slug}-${Date.now()}` : slug;
  }

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: updateData,
    include: { category: true },
  });

  res.json({ success: true, data: product });
};

export const adminDeleteProduct = async (req: Request, res: Response): Promise<void> => {
  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ success: true, message: 'Produk dinonaktifkan' });
};

export const adminDeleteProductImage = async (req: Request, res: Response): Promise<void> => {
  const { imageUrl } = req.body;
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) { res.status(404).json({ success: false, message: 'Produk tidak ditemukan' }); return; }

  await prisma.product.update({
    where: { id: req.params.id },
    data: { images: product.images.filter((img) => img !== imageUrl) },
  });
  res.json({ success: true, message: 'Gambar dihapus' });
};
