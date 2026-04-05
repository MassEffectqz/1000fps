import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/categories/[id]/specifications - получить спецификации категории
// (защищено middleware — только ADMIN/MANAGER)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const specifications = await prisma.categorySpecification.findMany({
      where: { categoryId: id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(specifications);
  } catch (error) {
    console.error('Error fetching category specifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category specifications' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories/[id]/specifications - создать спецификацию для категории
// (защищено middleware — только ADMIN/MANAGER)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { name, type, unit, required = false, options, order = 0 } = body;

    const specification = await prisma.categorySpecification.create({
      data: {
        categoryId: id,
        name,
        type,
        unit,
        required,
        options,
        order,
      },
    });

    return NextResponse.json(specification, { status: 201 });
  } catch (error) {
    console.error('Error creating category specification:', error);
    return NextResponse.json(
      { error: 'Failed to create category specification' },
      { status: 500 }
    );
  }
}
