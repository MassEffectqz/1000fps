import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { position: 'asc' },
    });

    return { data: categories };
  }

  async findOne(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
        products: {
          take: 10,
          include: { brand: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Категория "${slug}" не найдена`);
    }

    return category;
  }

  async findById(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Категория с ID "${id}" не найдена`);
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async update(id: number, updateCategoryDto: CreateCategoryDto) {
    // Проверяем существование категории
    const existing = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Категория с ID "${id}" не найдена`);
    }

    // Нельзя сделать категорию дочерней самой себя
    if (updateCategoryDto.parentId === id) {
      throw new NotFoundException('Категория не может быть дочерней самой себя');
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    // Проверяем существование категории
    const existing = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Категория с ID "${id}" не найдена`);
    }

    // Нельзя удалить категорию с продуктами
    if (existing.products.length > 0) {
      throw new NotFoundException(
        `Нельзя удалить категорию "${existing.name}", так как в ней есть товары (${existing.products.length} шт.)`,
      );
    }

    // Нельзя удалить категорию с дочерними категориями
    if (existing.children.length > 0) {
      throw new NotFoundException(
        `Нельзя удалить категорию "${existing.name}", так как в ней есть подкатегории (${existing.children.length} шт.)`,
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
