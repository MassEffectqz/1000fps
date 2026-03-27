import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: FilterProductsDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 24;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { available: true },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
          brand: true,
        },
      }),
      this.prisma.product.count({ where: { available: true } }),
    ]);

    return {
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        images: true,
        warehouseStock: {
          include: {
            warehouse: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                phone: true,
              },
            },
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    const { categoryId, brandId, images, ...rest } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...rest,
        category: { connect: { id: categoryId } },
        brand: brandId ? { connect: { id: brandId } } : undefined,
        images: images?.length
          ? { create: images.map((url, index) => ({ url, position: index })) }
          : undefined,
      },
      include: { category: true, brand: true },
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { categoryId, brandId, images, ...rest } = updateProductDto;

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        brand: brandId ? { connect: { id: brandId } } : undefined,
        images: images
          ? {
              deleteMany: {},
              create: images.map((url, index) => ({ url, position: index })),
            }
          : undefined,
      },
      include: { category: true, brand: true },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return product;
  }

  async remove(id: number) {
    await this.prisma.product.delete({
      where: { id },
    });
    return { message: 'Товар удалён' };
  }

  private getOrderBy(sort: string) {
    const sortOptions: Record<string, { [key: string]: 'asc' | 'desc' }> = {
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      newest: { createdAt: 'desc' },
      rating: { rating: 'desc' },
    };
    return sortOptions[sort] || { id: 'asc' };
  }
}
