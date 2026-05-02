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

// POST /api/admin/parser/products/[productId]/parse - запустить ручной парсинг
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  try {
    const body = await request.json();
    const { sources } = body;

    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      return NextResponse.json(
        { error: 'sources обязателен и должен быть массивом' },
        { status: 400, headers: corsHeaders }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        useParserPrice: true,
        parserSources: true,
        price: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Для ручного парсинга используем первый источник
    const source = sources[0];
    const articleMatch = source.match(/catalog\/(\d+)/);
    const article = articleMatch ? articleMatch[1] : null;

    if (!article) {
      return NextResponse.json(
        { error: 'Не удалось извлечь артикул из URL' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Создаём задачу парсинга
    const parseJob = await prisma.parseJob.create({
      data: {
        productId,
        jobId: `manual_${Date.now()}`,
        status: 'PENDING',
        sources: sources,
      },
    });

    // Симулируем успешный парсинг (в реальности нужен отдельный сервис парсинга)
    // Пока возвращаем информацию о том, что парсинг запущен
    return NextResponse.json({
      success: true,
      message: 'Задача парсинга создана. Для реального парсинга требуется интеграция с сервисом парсинга.',
      jobId: parseJob.jobId,
      article,
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error starting manual parse:', error);
    return NextResponse.json(
      { error: 'Failed to start parse' },
      { status: 500, headers: corsHeaders }
    );
  }
}