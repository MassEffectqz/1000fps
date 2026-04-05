import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Очищаем существующие данные (в обратном порядке зависимостей)
  await prisma.productTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.warehouseStock.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categorySpecification.deleteMany();
  await prisma.categoryFilter.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.configItem.deleteMany();
  await prisma.configuration.deleteMany();
  await prisma.address.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Создаем категории
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Видеокарты',
        slug: 'video karty',
        description: 'Графические карты для игр и работы',
        order: 1,
        children: {
          create: [
            { name: 'NVIDIA GeForce', slug: 'nvidia-geforce', order: 1 },
            { name: 'AMD Radeon', slug: 'amd-radeon', order: 2 },
            { name: 'Intel Arc', slug: 'intel-arc', order: 3 },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: 'Процессоры',
        slug: 'processory',
        description: 'CPU для настольных ПК',
        order: 2,
        children: {
          create: [
            { name: 'Intel Core', slug: 'intel-core', order: 1 },
            { name: 'AMD Ryzen', slug: 'amd-ryzen', order: 2 },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: 'Материнские платы',
        slug: 'materinskie-platy',
        description: 'Основы для сборки ПК',
        order: 3,
        children: {
          create: [
            { name: 'Intel LGA1700', slug: 'intel-lga1700', order: 1 },
            { name: 'AMD AM5', slug: 'amd-am5', order: 2 },
            { name: 'AMD AM4', slug: 'amd-am4', order: 3 },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: 'Оперативная память',
        slug: 'operativnaya-pamyat',
        description: 'DDR4 и DDR5 память',
        order: 4,
        children: {
          create: [
            { name: 'DDR5', slug: 'ddr5', order: 1 },
            { name: 'DDR4', slug: 'ddr4', order: 2 },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: 'Накопители',
        slug: 'nakopiteli',
        description: 'SSD и HDD диски',
        order: 5,
        children: {
          create: [
            { name: 'SSD M.2 NVMe', slug: 'ssd-m2-nvme', order: 1 },
            { name: 'SSD 2.5"', slug: 'ssd-25', order: 2 },
            { name: 'HDD 3.5"', slug: 'hdd-35', order: 3 },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: 'Охлаждение',
        slug: 'ohlazhdenie',
        description: 'Кулеры и СЖО',
        order: 6,
        children: {
          create: [
            { name: 'Башенные кулеры', slug: 'bashennye-kulery', order: 1 },
            { name: 'СЖО', slug: 'szho', order: 2 },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: 'Блоки питания',
        slug: 'bloki-pitaniya',
        description: 'PSU для ПК',
        order: 7,
        children: {
          create: [
            { name: '500-700 Вт', slug: '500-700-vt', order: 1 },
            { name: '700-850 Вт', slug: '700-850-vt', order: 2 },
            { name: '850+ Вт', slug: '850-vt', order: 3 },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: 'Мониторы',
        slug: 'monitory',
        description: 'Дисплеи для ПК',
        order: 8,
        children: {
          create: [
            { name: 'Игровые', slug: 'igrovye', order: 1 },
            { name: 'Офисные', slug: 'ofisnye', order: 2 },
          ],
        },
      },
    }),
  ]);

  console.log('📁 Created categories');

  // Создаем бренды
  const brands = await Promise.all([
    prisma.brand.create({ data: { name: 'ASUS', slug: 'asus' } }),
    prisma.brand.create({ data: { name: 'MSI', slug: 'msi' } }),
    prisma.brand.create({ data: { name: 'Gigabyte', slug: 'gigabyte' } }),
    prisma.brand.create({ data: { name: 'NVIDIA', slug: 'nvidia' } }),
    prisma.brand.create({ data: { name: 'AMD', slug: 'amd' } }),
    prisma.brand.create({ data: { name: 'Intel', slug: 'intel' } }),
    prisma.brand.create({ data: { name: 'Corsair', slug: 'corsair' } }),
    prisma.brand.create({ data: { name: 'Samsung', slug: 'samsung' } }),
    prisma.brand.create({ data: { name: 'Kingston', slug: 'kingston' } }),
    prisma.brand.create({ data: { name: 'NZXT', slug: 'nzxt' } }),
    prisma.brand.create({ data: { name: 'DeepCool', slug: 'deepcool' } }),
    prisma.brand.create({ data: { name: 'be quiet!', slug: 'be-quiet' } }),
  ]);

  console.log('🏷️  Created brands');

  // Создаем склады - Волгоград и Волжский
  const warehouses = await Promise.all([
    prisma.warehouse.create({
      data: {
        name: 'Волгоград - Еременко',
        address: 'ул. Еременко, 126',
        city: 'Волгоград',
        phone: '8-902-650-05-11',
        isActive: true,
      },
    }),
    prisma.warehouse.create({
      data: {
        name: 'Волжский - Ленина',
        address: 'пр. Ленина, 14',
        city: 'Волжский',
        phone: '8-961-679-21-84',
        isActive: true,
      },
    }),
  ]);

  console.log('🏭 Created 2 warehouses');

  // Создаем тестовых пользователей
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const [adminUser, customerUser] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@1000fps.ru',
        password: hashedPassword,
        name: 'Администратор',
        phone: '+7 (999) 000-00-01',
        role: 'ADMIN',
        level: 'PLATINUM',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'user@1000fps.ru',
        password: hashedPassword,
        name: 'Алексей Клиентов',
        phone: '+7 (999) 000-00-02',
        role: 'CUSTOMER',
        level: 'GOLD',
        emailVerified: true,
      },
    }),
  ]);

  console.log('👥 Created test users (admin: admin@1000fps.ru / password123, user: user@1000fps.ru / password123)');

  // Создаем тестовые адреса для пользователя
  await prisma.address.create({
    data: {
      userId: customerUser.id,
      name: 'Дом',
      city: 'Волгоград',
      street: 'ул. Ленина',
      building: '10',
      apartment: '100',
      postalCode: '400000',
      phone: '+7 (999) 000-00-02',
      isDefault: true,
    },
  });

  console.log('🏠 Created test address');

  // Получаем категории для товаров
  const gpuCategory = await prisma.category.findUnique({ where: { slug: 'nvidia-geforce' } });
  const cpuCategory = await prisma.category.findUnique({ where: { slug: 'amd-ryzen' } });
  const moboCategory = await prisma.category.findUnique({ where: { slug: 'amd-am5' } });
  const ramCategory = await prisma.category.findUnique({ where: { slug: 'ddr5' } });
  const ssdCategory = await prisma.category.findUnique({ where: { slug: 'ssd-m2-nvme' } });

  // Создаем товары
  const products = await Promise.all([
    // Видеокарты
    prisma.product.create({
      data: {
        name: 'ASUS TUF Gaming GeForce RTX 4070 Ti Super OC 16 ГБ GDDR6X',
        slug: 'asus-tuf-rtx-4070-ti-super-oc-16gb',
        sku: 'TUF-RTX4070TIS-O16G',
        description: 'Мощная видеокарта для 2K гейминга с трассировкой лучей',
        fullDescription: `ASUS TUF Gaming GeForce RTX 4070 Ti Super OC Edition — это производительность и надежность в стильном исполнении. Карта оснащена 16 ГБ памяти GDDR6X и улучшенной системой охлаждения.

**Особенности:**
- Графический процессор NVIDIA GeForce RTX 4070 Ti Super
- 16 ГБ видеопамяти GDDR6X
- Трассировка лучей и DLSS 3
- Усиленная система питания
- Тихие вентиляторы Axial-tech`,
        price: 79990,
        oldPrice: 97500,
        discountType: 'PERCENT',
        discountValue: 18,
        stock: 47,
        rating: 0,
        reviewCount: 0,
        salesCount: 1250,
        isFeatured: true,
        isHit: true,
        isActive: true,
        categoryId: gpuCategory!.id,
        brandId: brands[0].id,
        specs: {
          create: [
            { name: 'Производитель GPU', value: 'NVIDIA', order: 1 },
            { name: 'Модель GPU', value: 'GeForce RTX 4070 Ti Super', order: 2 },
            { name: 'Объём видеопамяти', value: '16', unit: 'ГБ', order: 3 },
            { name: 'Тип видеопамяти', value: 'GDDR6X', order: 4 },
            { name: 'Разрядность шины', value: '256', unit: 'бит', order: 5 },
            { name: 'Базовая частота', value: '2340', unit: 'МГц', order: 6 },
            { name: 'Частота разгона', value: '2640', unit: 'МГц', order: 7 },
          ],
        },
        images: {
          create: [
            { url: '/images/products/rtx-4070-ti-super-1.jpg', isMain: true, order: 0 },
            { url: '/images/products/rtx-4070-ti-super-2.jpg', isMain: false, order: 1 },
          ],
        },
        warehouseStocks: {
          create: { warehouseId: warehouses[0].id, quantity: 47, reserved: 5 },
        },
      },
    }),

    prisma.product.create({
      data: {
        name: 'NVIDIA GeForce RTX 4090 24GB GDDR6X',
        slug: 'nvidia-rtx-4090-24gb',
        sku: 'RTX4090-24G',
        description: 'Флагманская видеокарта для 4K гейминга и работы с ИИ',
        price: 169990,
        oldPrice: 189990,
        discountType: 'PERCENT',
        discountValue: 10,
        stock: 12,
        rating: 0,
        reviewCount: 0,
        salesCount: 890,
        isFeatured: true,
        isNew: true,
        isActive: true,
        categoryId: gpuCategory!.id,
        brandId: brands[3].id,
        specs: {
          create: [
            { name: 'Производитель GPU', value: 'NVIDIA', order: 1 },
            { name: 'Модель GPU', value: 'GeForce RTX 4090', order: 2 },
            { name: 'Объём видеопамяти', value: '24', unit: 'ГБ', order: 3 },
            { name: 'Тип видеопамяти', value: 'GDDR6X', order: 4 },
            { name: 'Разрядность шины', value: '384', unit: 'бит', order: 5 },
          ],
        },
        images: {
          create: [{ url: '/images/products/rtx-4090.jpg', isMain: true, order: 0 }],
        },
        warehouseStocks: {
          create: { warehouseId: warehouses[0].id, quantity: 12, reserved: 2 },
        },
      },
    }),

    // Процессоры
    prisma.product.create({
      data: {
        name: 'AMD Ryzen 7 7800X3D AM5, 8 ядер, OEM',
        slug: 'amd-ryzen-7-7800x3d',
        sku: '7800X3D-OEM',
        description: 'Лучший игровой процессор с 3D V-Cache',
        fullDescription: `AMD Ryzen 7 7800X3D — это лучший игровой процессор на рынке. Технология 3D V-Cache обеспечивает невероятную производительность в играх.

**Характеристики:**
- 8 ядер и 16 потоков
- Частота до 5.0 ГГц
- 96 МБ кэш-памяти L3
- Сокет AM5
- TDP 120 Вт`,
        price: 34990,
        oldPrice: 39700,
        discountType: 'PERCENT',
        discountValue: 12,
        stock: 85,
        rating: 0,
        reviewCount: 0,
        salesCount: 2100,
        isFeatured: true,
        isHit: true,
        isActive: true,
        categoryId: cpuCategory!.id,
        brandId: brands[4].id,
        specs: {
          create: [
            { name: 'Сокет', value: 'AM5', order: 1 },
            { name: 'Количество ядер', value: '8', order: 2 },
            { name: 'Количество потоков', value: '16', order: 3 },
            { name: 'Базовая частота', value: '4.2', unit: 'ГГц', order: 4 },
            { name: 'Макс. частота', value: '5.0', unit: 'ГГц', order: 5 },
            { name: 'Кэш L3', value: '96', unit: 'МБ', order: 6 },
          ],
        },
        images: {
          create: [{ url: '/images/products/ryzen-7800x3d.jpg', isMain: true, order: 0 }],
        },
        warehouseStocks: {
          create: { warehouseId: warehouses[0].id, quantity: 85, reserved: 10 },
        },
      },
    }),

    // Материнские платы
    prisma.product.create({
      data: {
        name: 'ASUS ROG Maximus Z890 Apex Intel Z890, LGA1851',
        slug: 'asus-rog-maximus-z890-apex',
        sku: 'ROG-MAX-Z890-APEX',
        description: 'Флагманская материнская плата для разгона',
        price: 52990,
        stock: 23,
        rating: 0,
        reviewCount: 0,
        salesCount: 180,
        isFeatured: true,
        isNew: true,
        isActive: true,
        categoryId: moboCategory!.id,
        brandId: brands[0].id,
        specs: {
          create: [
            { name: 'Сокет', value: 'LGA1851', order: 1 },
            { name: 'Чипсет', value: 'Intel Z890', order: 2 },
            { name: 'Память', value: 'DDR5', order: 3 },
            { name: 'Форм-фактор', value: 'ATX', order: 4 },
          ],
        },
        images: {
          create: [{ url: '/images/products/z890-apex.jpg', isMain: true, order: 0 }],
        },
        warehouseStocks: {
          create: { warehouseId: warehouses[0].id, quantity: 23, reserved: 3 },
        },
      },
    }),

    // Оперативная память
    prisma.product.create({
      data: {
        name: 'Corsair Vengeance 32GB DDR5-6000',
        slug: 'corsair-vengeance-32gb-ddr5-6000',
        sku: 'CMK32GX5M2B6000C30',
        description: 'Быстрая DDR5 память для игр и работы',
        price: 14990,
        oldPrice: 17990,
        discountType: 'PERCENT',
        discountValue: 17,
        stock: 156,
        rating: 0,
        reviewCount: 0,
        salesCount: 1800,
        isFeatured: true,
        isHit: true,
        isActive: true,
        categoryId: ramCategory!.id,
        brandId: brands[6].id,
        specs: {
          create: [
            { name: 'Объём', value: '32', unit: 'ГБ', order: 1 },
            { name: 'Тип', value: 'DDR5', order: 2 },
            { name: 'Частота', value: '6000', unit: 'МГц', order: 3 },
            { name: 'Тайминги', value: 'CL30', order: 4 },
          ],
        },
        images: {
          create: [{ url: '/images/products/corsair-vengeance-ddr5.jpg', isMain: true, order: 0 }],
        },
        warehouseStocks: {
          create: { warehouseId: warehouses[0].id, quantity: 156, reserved: 20 },
        },
      },
    }),

    // SSD
    prisma.product.create({
      data: {
        name: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2',
        slug: 'samsung-990-pro-2tb',
        sku: 'MZ-V9P2T0BW',
        description: 'Топовый NVMe SSD для игр и профессиональной работы',
        price: 18990,
        oldPrice: 24990,
        discountType: 'PERCENT',
        discountValue: 24,
        stock: 89,
        rating: 0,
        reviewCount: 0,
        salesCount: 2500,
        isFeatured: true,
        isHit: true,
        isActive: true,
        categoryId: ssdCategory!.id,
        brandId: brands[7].id,
        specs: {
          create: [
            { name: 'Объём', value: '2', unit: 'ТБ', order: 1 },
            { name: 'Интерфейс', value: 'PCIe 4.0 x4 NVMe', order: 2 },
            { name: 'Скорость чтения', value: '7450', unit: 'МБ/с', order: 3 },
            { name: 'Скорость записи', value: '6900', unit: 'МБ/с', order: 4 },
          ],
        },
        images: {
          create: [{ url: '/images/products/samsung-990-pro.jpg', isMain: true, order: 0 }],
        },
        warehouseStocks: {
          create: { warehouseId: warehouses[0].id, quantity: 89, reserved: 15 },
        },
      },
    }),
  ]);

  console.log('📦 Created products');

  // Создаем теги
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'RTX 4070 Ti', slug: 'rtx-4070-ti' } }),
    prisma.tag.create({ data: { name: 'RTX 4090', slug: 'rtx-4090' } }),
    prisma.tag.create({ data: { name: 'Игровой', slug: 'igrovoy' } }),
    prisma.tag.create({ data: { name: 'Топ', slug: 'top' } }),
    prisma.tag.create({ data: { name: 'AM5', slug: 'am5' } }),
    prisma.tag.create({ data: { name: 'DDR5', slug: 'ddr5' } }),
  ]);

  console.log('🏷️  Created tags');

  // Привязываем теги к товарам
  await prisma.productTag.create({
    data: { productId: products[0].id, tagId: tags[0].id },
  });
  await prisma.productTag.create({
    data: { productId: products[1].id, tagId: tags[1].id },
  });
  await prisma.productTag.createMany({
    data: [
      { productId: products[2].id, tagId: tags[2].id },
      { productId: products[2].id, tagId: tags[4].id },
    ],
  });

  console.log('📦 Created product tags');

  // Создаем тестовый вишлист для пользователя
  const wishlist = await prisma.wishlist.create({
    data: {
      userId: customerUser.id,
    },
  });

  await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      userId: customerUser.id,
      productId: products[0].id, // RTX 4070 Ti
    },
  });

  await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      userId: customerUser.id,
      productId: products[2].id, // Ryzen 7 7800X3D
    },
  });

  console.log('❤️  Created test wishlist');

  // Создаем тестовые заказы для пользователя
  const order1 = await prisma.order.create({
    data: {
      orderNumber: '001234',
      userId: customerUser.id,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
      deliveryMethod: 'COURIER',
      deliveryAddress: 'Волгоград, ул. Ленина, 10-100',
      deliveryCost: 0,
      subtotal: 114980,
      discount: 0,
      total: 114980,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            price: 79990,
            total: 79990,
          },
          {
            productId: products[2].id,
            quantity: 1,
            price: 34990,
            total: 34990,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: '001233',
      userId: customerUser.id,
      status: 'SHIPPING',
      paymentStatus: 'PAID',
      paymentMethod: 'SBP',
      deliveryMethod: 'CDEK',
      deliveryAddress: 'Волгоград, пр. Жукова, 50-25',
      deliveryCost: 500,
      subtotal: 54490,
      discount: 0,
      total: 54990,
      items: {
        create: [
          {
            productId: products[4].id,
            quantity: 1,
            price: 14990,
            total: 14990,
          },
          {
            productId: products[5].id,
            quantity: 2,
            price: 18990,
            total: 37980,
          },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: '001232',
      userId: customerUser.id,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      deliveryMethod: 'PICKUP',
      deliveryAddress: 'Волгоград, ул. Еременко, 126',
      deliveryCost: 0,
      subtotal: 89990,
      discount: 0,
      total: 89990,
      items: {
        create: [
          {
            productId: products[3].id,
            quantity: 1,
            price: 52990,
            total: 52990,
          },
          {
            productId: products[4].id,
            quantity: 1,
            price: 14990,
            total: 14990,
          },
        ],
      },
    },
  });

  console.log('📦 Created test orders');

  // Создаем тестовую сборку
  await prisma.configuration.create({
    data: {
      userId: customerUser.id,
      name: 'Игровой ПК 2024',
      isPreset: false,
      total: 180000,
      power: 750,
      isPublic: false,
      items: {
        create: [
          { categoryId: gpuCategory!.id, productId: products[0].id, quantity: 1, price: 79990 },
          { categoryId: cpuCategory!.id, productId: products[2].id, quantity: 1, price: 34990 },
          { categoryId: ramCategory!.id, productId: products[4].id, quantity: 2, price: 14990 },
          { categoryId: ssdCategory!.id, productId: products[5].id, quantity: 1, price: 18990 },
        ],
      },
    },
  });

  console.log('🖥️  Created test configuration');

  console.log('✅ Seed completed successfully!');
  console.log(`📊 Created:`);
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${brands.length} brands`);
  console.log(`   - ${products.length} products`);
  console.log(`   - ${tags.length} tags`);
  console.log(`   - 2 warehouses`);
  console.log(`   - 2 test users`);
  console.log(`   - 3 test orders`);
  console.log(`   - 1 wishlist with 2 items`);
  console.log(`   - 1 test configuration`);
  console.log('');
  console.log('📝 Test credentials:');
  console.log('   Admin: admin@1000fps.ru / password123');
  console.log('   User:  user@1000fps.ru / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
