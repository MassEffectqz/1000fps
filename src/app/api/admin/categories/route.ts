import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема валидации
const categorySchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Некорректный формат slug'),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// GET /api/admin/categories - получить все категории
// (защищено middleware — только ADMIN/MANAGER)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - создать категорию
// (защищено middleware — только ADMIN/MANAGER)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    // Нормализуем parentId - пустая строка = null
    const normalizedData = {
      ...validatedData,
      parentId: validatedData.parentId || null,
    };

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

    // Проверяем уникальность slug
    const existing = await prisma.category.findUnique({
      where: { slug: normalizedData.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Категория с таким slug уже существует' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: normalizedData,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
