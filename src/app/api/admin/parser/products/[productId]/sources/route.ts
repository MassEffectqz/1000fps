import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// POST /api/admin/parser/products/[productId]/sources - добавить/обновить источники
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  try {
    const body = await request.json();
    const { sources } = body;

    if (!Array.isArray(sources)) {
      return NextResponse.json(
        { error: 'sources должен быть массивом' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Валидация структуры источников
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      if (!source.url || typeof source.url !== 'string') {
        return NextResponse.json(
          { error: `Источник #${i + 1}: url обязателен` },
          { status: 400, headers: corsHeaders }
        );
      }
      if (typeof source.priority !== 'number') {
        return NextResponse.json(
          { error: `Источник #${i + 1}: priority должен быть числом` },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // Сортируем по приоритету
    sources.sort((a, b) => a.priority - b.priority);

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        parserSources: sources,
      },
      select: {
        id: true,
        parserSources: true,
        useParserPrice: true,
      },
    });

    return NextResponse.json({
      success: true,
      product,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating parser sources:', error);
    return NextResponse.json(
      { error: 'Failed to update parser sources' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE /api/admin/parser/products/[productId]/sources?url=... - удалить источник
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get('url');

  if (!urlParam) {
    return NextResponse.json(
      { error: 'url источника обязателен' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { parserSources: true },
    });

    if (!product || !product.parserSources) {
      return NextResponse.json(
        { error: 'Источники не найдены' },
        { status: 404, headers: corsHeaders }
      );
    }

    const sources = product.parserSources as Array<{
      url: string;
      priority: number;
      isActive: boolean;
    }>;

    const filteredSources = sources.filter(s => s.url !== urlParam);

    // Пересчитываем приоритеты
    filteredSources.forEach((s, i) => {
      s.priority = i;
    });

    await prisma.product.update({
      where: { id: productId },
      data: { parserSources: filteredSources },
    });

    return NextResponse.json({
      success: true,
      sources: filteredSources,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting parser source:', error);
    return NextResponse.json(
      { error: 'Failed to delete parser source' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET /api/admin/parser/products/[productId]/sources - получить источники
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        parserSources: true,
        useParserPrice: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      sources: product.parserSources || [],
      useParserPrice: product.useParserPrice,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching parser sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parser sources' },
      { status: 500, headers: corsHeaders }
    );
  }
}
