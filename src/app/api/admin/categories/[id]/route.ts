import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Некорректный формат slug'),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// GET /api/admin/categories/[id] - получить категорию по ID
// (защищено middleware — только ADMIN/MANAGER)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories/[id] - обновить категорию
// (защищено middleware — только ADMIN/MANAGER)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    // Нормализуем parentId - пустая строка = null
    const normalizedData = {
      ...validatedData,
      parentId: validatedData.parentId || null,
    };

    // Проверяем существование категории
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Нельзя сделать категорию дочерней самой себе
    if (normalizedData.parentId === id) {
      return NextResponse.json(
        { error: 'Категория не может быть дочерней самой себе' },
        { status: 400 }
      );
    }

    // Проверяем существование родительской категории
    if (normalizedData.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: normalizedData.parentId },
      });

      if (!parent) {
        return NextResponse.json(
          { error: 'Родительская категория не найдена' },
          { status: 400 }
        );
      }
    }

    // Проверяем уникальность slug (если slug изменился)
    if (normalizedData.slug !== existing.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: normalizedData.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Категория с таким slug уже существует' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: normalizedData,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] - удалить категорию
// (защищено middleware — только ADMIN/MANAGER)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Проверяем наличие товаров
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: `Нельзя удалить категорию с ${productCount} товарами. Переместите товары в другую категорию.` },
        { status: 400 }
      );
    }

    // Проверяем наличие дочерних категорий
    const childCount = await prisma.category.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      return NextResponse.json(
        { error: `Нельзя удалить категорию с ${childCount} подкатегориями. Удалите сначала их.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
