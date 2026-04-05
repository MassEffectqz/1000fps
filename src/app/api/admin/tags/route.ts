import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/tags - получить все теги
// (защищено middleware — только ADMIN/MANAGER)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const popular = searchParams.get('popular') === 'true';

    const orderBy = popular 
      ? { usageCount: 'desc' as const }
      : { name: 'asc' as const };

    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy,
      take: limit,
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

// POST /api/admin/tags - создать тег
// (защищено middleware — только ADMIN/MANAGER)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, color } = body;

    // Проверяем существует ли тег с таким именем
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { slug: { equals: slug, mode: 'insensitive' } },
        ],
      },
    });

    if (existingTag) {
      return NextResponse.json(existingTag);
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        color,
        usageCount: 0,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
