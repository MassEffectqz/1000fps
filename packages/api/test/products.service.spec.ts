import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { ProductsService } from './products.service';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  const mockPrisma = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('должен вернуть список товаров с пагинацией', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 1000 },
        { id: 2, name: 'Product 2', price: 2000 },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(2);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sort: 'popular',
      });

      expect(result.data).toEqual(mockProducts);
      expect(result.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it('должен фильтровать по категории', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await service.findAll({ category: 'gpu', page: 1, limit: 10 });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: { slug: 'gpu' },
          }),
        })
      );
    });

    it('должен сортировать по цене (возрастание)', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await service.findAll({ sort: 'price_asc', page: 1, limit: 10 });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'asc' },
        })
      );
    });

    it('должен сортировать по цене (убывание)', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await service.findAll({ sort: 'price_desc', page: 1, limit: 10 });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'desc' },
        })
      );
    });
  });

  describe('findOne', () => {
    it('должен вернуть товар по slug', async () => {
      const mockProduct = {
        id: 1,
        slug: 'test-product',
        name: 'Test Product',
        price: 1000,
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('test-product');

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-product' },
        include: {
          category: true,
          brand: true,
          images: true,
          reviews: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      });
    });

    it('должен выбросить NotFoundException для несуществующего товара', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('должен создать новый товар', async () => {
      const createDto = {
        slug: 'new-product',
        sku: 'NEW-001',
        name: 'New Product',
        price: 1500,
        categoryId: 1,
      };

      const mockProduct = { id: 1, ...createDto };

      mockPrisma.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: createDto,
        include: { category: true, brand: true },
      });
    });
  });

  describe('update', () => {
    it('должен обновить товар', async () => {
      const updateDto = { name: 'Updated Product', price: 2000 };
      const mockProduct = { id: 1, ...updateDto };

      mockPrisma.product.update.mockResolvedValue(mockProduct);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
        include: { category: true, brand: true },
      });
    });

    it('должен выбросить NotFoundException для несуществующего товара', async () => {
      mockPrisma.product.update.mockRejectedValue(new NotFoundException('Товар не найден'));

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('должен удалить товар', async () => {
      mockPrisma.product.delete.mockResolvedValue({});

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Товар удалён' });
      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
