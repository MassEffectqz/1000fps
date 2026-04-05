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

// GET /api/admin/brands/[id] - получить бренд по ID
// (защищено middleware — только ADMIN/MANAGER)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/brands/[id] - обновить бренд
// (защищено middleware — только ADMIN/MANAGER)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = brandSchema.parse(body);

    // Проверяем существование бренда
    const existing = await prisma.brand.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Проверяем уникальность slug (если slug изменился)
    if (validatedData.slug !== existing.slug) {
      const slugExists = await prisma.brand.findUnique({
        where: { slug: validatedData.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Бренд с таким slug уже существует' },
          { status: 400 }
        );
      }
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath('/admin/products');
    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error updating brand:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/brands/[id] - удалить бренд
// (защищено middleware — только ADMIN/MANAGER)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Проверяем наличие товаров
    const productCount = await prisma.product.count({
      where: { brandId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: `Нельзя удалить бренд с ${productCount} товарами. Переместите товары в другой бренд или удалите их.` },
        { status: 400 }
      );
    }

    await prisma.brand.delete({
      where: { id },
    });

    revalidatePath('/admin/products');
    return NextResponse.json({ success: true, message: 'Бренд успешно удалён' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    );
  }
}
