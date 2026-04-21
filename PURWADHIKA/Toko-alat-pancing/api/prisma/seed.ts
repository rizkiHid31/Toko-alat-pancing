import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@tokopancing.com' },
    update: {},
    create: {
      email: 'admin@tokopancing.com',
      password: adminPassword,
      name: 'Admin',
      role: Role.ADMIN,
    },
  });

  const validSlugs = ['pakan-ikan', 'umpan-lure', 'alat-pancing', 'campuran-umpan'];

  const categories = [
    { name: 'Pakan Ikan', slug: 'pakan-ikan' },
    { name: 'Umpan & Lure', slug: 'umpan-lure' },
    { name: 'Alat Pancing', slug: 'alat-pancing' },
    { name: 'Campuran Umpan', slug: 'campuran-umpan' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
  }

  // Pindahkan produk dari kategori lama ke 'alat-pancing', lalu hapus kategori lama
  const defaultCat = await prisma.category.findUnique({ where: { slug: 'alat-pancing' } });
  if (defaultCat) {
    const oldCategories = await prisma.category.findMany({
      where: { slug: { notIn: validSlugs } },
    });
    for (const old of oldCategories) {
      await prisma.product.updateMany({
        where: { categoryId: old.id },
        data: { categoryId: defaultCat.id },
      });
    }
    await prisma.category.deleteMany({
      where: { slug: { notIn: validSlugs } },
    });
  }

  console.log('Seed completed!');
  console.log('Admin: admin@tokopancing.com / admin123');
  console.log('Kategori:', validSlugs.join(', '));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
