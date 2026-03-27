import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';

describe('Products API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Очистка базы данных перед каждым тестом
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.brand.deleteMany();
  });

  describe('/products (GET)', () => {
    it('должен вернуть пустой список товаров', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(200)
        .expect({
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 24,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
    });

    it('должен вернуть товары с пагинацией', async () => {
      // Создание тестовых данных
      const category = await prisma.category.create({
        data: { slug: 'gpu', name: 'Видеокарты' },
      });

      const brand = await prisma.brand.create({
        data: { slug: 'nvidia', name: 'NVIDIA' },
      });

      await prisma.product.createMany({
        data: [
          {
            slug: 'rtx-4070',
            sku: 'RTX-4070-001',
            name: 'NVIDIA GeForce RTX 4070',
            categoryId: category.id,
            brandId: brand.id,
            price: 59990,
            stock: 10,
          },
          {
            slug: 'rtx-4080',
            sku: 'RTX-4080-001',
            name: 'NVIDIA GeForce RTX 4080',
            categoryId: category.id,
            brandId: brand.id,
            price: 89990,
            stock: 5,
          },
        ],
      });

      return request(app.getHttpServer())
        .get('/api/v1/products?limit=1')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(1);
          expect(res.body.pagination.totalItems).toBe(2);
          expect(res.body.pagination.totalPages).toBe(2);
        });
    });

    it('должен фильтровать товары по категории', async () => {
      const category1 = await prisma.category.create({
        data: { slug: 'gpu', name: 'Видеокарты' },
      });

      const category2 = await prisma.category.create({
        data: { slug: 'cpu', name: 'Процессоры' },
      });

      await prisma.product.create({
        data: {
          slug: 'rtx-4070',
          sku: 'RTX-4070-001',
          name: 'NVIDIA GeForce RTX 4070',
          categoryId: category1.id,
          price: 59990,
          stock: 10,
        },
      });

      await prisma.product.create({
        data: {
          slug: 'r7-7800x3d',
          sku: 'R7-7800X3D',
          name: 'AMD Ryzen 7 7800X3D',
          categoryId: category2.id,
          price: 34990,
          stock: 15,
        },
      });

      return request(app.getHttpServer())
        .get('/api/v1/products?category=gpu')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(1);
          expect(res.body.data[0].category.slug).toBe('gpu');
        });
    });
  });

  describe('/products/:slug (GET)', () => {
    it('должен вернуть товар по slug', async () => {
      const category = await prisma.category.create({
        data: { slug: 'gpu', name: 'Видеокарты' },
      });

      const product = await prisma.product.create({
        data: {
          slug: 'rtx-4070',
          sku: 'RTX-4070-001',
          name: 'NVIDIA GeForce RTX 4070',
          categoryId: category.id,
          price: 59990,
          stock: 10,
        },
      });

      return request(app.getHttpServer())
        .get(`/api/v1/products/${product.slug}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(product.id);
          expect(res.body.slug).toBe('rtx-4070');
        });
    });

    it('должен вернуть 404 для несуществующего товара', async () => {
      return request(app.getHttpServer()).get('/api/v1/products/non-existent').expect(404);
    });
  });
});
