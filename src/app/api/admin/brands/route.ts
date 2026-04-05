import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const brandSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Некорректный формат slug'),
  description: z.string().optional().nullable(),
  logo: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
});

// GET /api/admin/brands - получить все бренды
// (защищено middleware — только ADMIN/MANAGER)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const brands = await prisma.brand.findMany({
      where,
      include: {
        products: includeProducts ? true : undefined,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

// POST /api/admin/brands - создать бренд
// (защищено middleware — только ADMIN/MANAGER)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = brandSchema.parse(body);

    // Проверяем уникальность slug
    const existing = await prisma.brand.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Бренд с таким slug уже существует' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.create({
      data: validatedData,
    });

    revalidatePath('/admin/products');
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    );
  }
}
