import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Создаём админа
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@1000fps.ru' },
    update: {},
    create: {
      email: 'admin@1000fps.ru',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Adminov',
      role: 'ADMIN',
      bonusPoints: 1000,
      loyaltyLevel: 'GOLD',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Создаём тестового пользователя
  const userPassword = await bcrypt.hash('User123!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'user@1000fps.ru' },
    update: {},
    create: {
      email: 'user@1000fps.ru',
      password: userPassword,
      firstName: 'Иван',
      lastName: 'Пользователь',
      role: 'CUSTOMER',
      bonusPoints: 100,
      loyaltyLevel: 'BRONZE',
    },
  });

  console.log('✅ Created test user:', user.email);

  // Создаём категории
  const components = await prisma.category.upsert({
    where: { slug: 'components' },
    update: {},
    create: { slug: 'components', name: 'Комплектующие' },
  });

  const gpu = await prisma.category.upsert({
    where: { slug: 'gpu' },
    update: {},
    create: { slug: 'gpu', name: 'Видеокарты', parentId: components.id },
  });

  const cpu = await prisma.category.upsert({
    where: { slug: 'cpu' },
    update: {},
    create: { slug: 'cpu', name: 'Процессоры', parentId: components.id },
  });

  console.log('✅ Created categories');

  // Создаём бренды
  const nvidia = await prisma.brand.upsert({
    where: { slug: 'nvidia' },
    update: {},
    create: { slug: 'nvidia', name: 'NVIDIA' },
  });

  const amd = await prisma.brand.upsert({
    where: { slug: 'amd' },
    update: {},
    create: { slug: 'amd', name: 'AMD' },
  });

  const intel = await prisma.brand.upsert({
    where: { slug: 'intel' },
    update: {},
    create: { slug: 'intel', name: 'Intel' },
  });

  const asus = await prisma.brand.upsert({
    where: { slug: 'asus' },
    update: {},
    create: { slug: 'asus', name: 'ASUS' },
  });

  console.log('✅ Created brands');

  // Создаём тестовые товары
  const products = [
    {
      slug: 'nvidia-geforce-rtx-4070-ti-super',
      sku: 'RTX-4070-TI-S',
      name: 'NVIDIA GeForce RTX 4070 Ti Super',
      categoryId: gpu.id,
      brandId: nvidia.id,
      price: 79990,
      oldPrice: 97500,
      stock: 47,
      description: 'Мощная видеокарта для игр и профессиональной работы',
    },
    {
      slug: 'amd-ryzen-7-7800x3d',
      sku: 'R7-7800X3D',
      name: 'AMD Ryzen 7 7800X3D AM5',
      categoryId: cpu.id,
      brandId: amd.id,
      price: 34990,
      stock: 23,
      description: 'Лучший игровой процессор',
    },
    {
      slug: 'intel-core-i7-14700k',
      sku: 'I7-14700K',
      name: 'Intel Core i7-14700K LGA1700',
      categoryId: cpu.id,
      brandId: intel.id,
      price: 44990,
      stock: 15,
      description: 'Производительный процессор для работы и игр',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product as any,
    });
  }

  console.log('✅ Created test products');

  // Создаём склады
  const volgogradWarehouse = await prisma.warehouse.upsert({
    where: { code: 'VOLGOGRAD' },
    update: {},
    create: {
      code: 'VOLGOGRAD',
      name: 'Волгоград - Еременко',
      address: 'Еременко 126',
      city: 'Волгоград',
      phone: '+7 (8442) 00-00-00',
      isActive: true,
    },
  });

  const volzhskyWarehouse = await prisma.warehouse.upsert({
    where: { code: 'VOLZHSKY' },
    update: {},
    create: {
      code: 'VOLZHSKY',
      name: 'Волжский - Ленина',
      address: 'Ленина 14',
      city: 'Волжский',
      phone: '+7 (8443) 00-00-00',
      isActive: true,
    },
  });

  console.log('✅ Created warehouses');

  // Создаём остатки товаров на складах
  const allProducts = await prisma.product.findMany();
  
  for (const product of allProducts) {
    // Волгоград - 70% от общего stock
    await prisma.warehouseStock.upsert({
      where: {
        warehouseId_productId: {
          warehouseId: volgogradWarehouse.id,
          productId: product.id,
        },
      },
      update: {},
      create: {
        warehouseId: volgogradWarehouse.id,
        productId: product.id,
        quantity: Math.floor(product.stock * 0.7),
        reserved: 0,
      },
    });

    // Волжский - 30% от общего stock
    await prisma.warehouseStock.upsert({
      where: {
        warehouseId_productId: {
          warehouseId: volzhskyWarehouse.id,
          productId: product.id,
        },
      },
      update: {},
      create: {
        warehouseId: volzhskyWarehouse.id,
        productId: product.id,
        quantity: Math.floor(product.stock * 0.3),
        reserved: 0,
      },
    });
  }

  console.log('✅ Created warehouse stock');

  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📝 Test credentials:');
  console.log('   Admin: admin@1000fps.ru / Admin123!');
  console.log('   User:  user@1000fps.ru / User123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
