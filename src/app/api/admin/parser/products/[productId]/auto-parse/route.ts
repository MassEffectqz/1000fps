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

// GET /api/admin/parser/products/[productId]/auto-parse
// Возвращает полные данные о парсинге товара: настройки, последний статус, поставщиков
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  try {
    // Проверяем существование товара
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        useParserPrice: true,
        parserSources: true,
        parserPrice: true,
        parserOldPrice: true,
        parserDelivery: true,
        parserName: true,
        parserInStock: true,
        parserUpdatedAt: true,
        price: true,
        oldPrice: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Получаем последнюю задачу парсинга
    const lastJob = await prisma.parseJob.findFirst({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });

    // Получаем поставщиков
    const suppliers = await prisma.productSupplier.findMany({
      where: { productId },
      select: {
        id: true,
        name: true,
        url: true,
        price: true,
        oldPrice: true,
        deliveryTime: true,
        inStock: true,
        rating: true,
        reviewsCount: true,
        updatedAt: true,
      },
      orderBy: { price: 'asc' },
    });

    // Формируем ответ
    const response = {
      // Основные настройки
      id: product.id,
      name: product.name,
      useParserPrice: product.useParserPrice,
      parseSources: product.parserSources || [],

      // Текущие цены от парсера
      parserPrice: product.parserPrice ? Number(product.parserPrice) : null,
      parserOldPrice: product.parserOldPrice ? Number(product.parserOldPrice) : null,
      parserDelivery: product.parserDelivery,
      parserName: product.parserName,
      parserInStock: product.parserInStock,
      parserUpdatedAt: product.parserUpdatedAt,

      // Текущие цены товара
      currentPrice: product.price ? Number(product.price) : null,
      currentOldPrice: product.oldPrice ? Number(product.oldPrice) : null,

      // Последняя задача парсинга
      lastParseJob: lastJob ? {
        id: lastJob.id,
        jobId: lastJob.jobId,
        status: lastJob.status,
        sources: lastJob.sources,
        error: lastJob.error,
        createdAt: lastJob.createdAt,
        completedAt: lastJob.completedAt,
        // Прогресс: если есть result с processedCount
        processedCount: (lastJob.result as { processedCount?: number } | null)?.processedCount || 0,
        totalSources: lastJob.sources?.length || 0,
      } : null,

      // Поставщики
      suppliers: suppliers.map(s => ({
        ...s,
        price: Number(s.price),
        oldPrice: s.oldPrice ? Number(s.oldPrice) : null,
      })),

      // Мета
      supplierCount: suppliers.length,
      hasParserData: !!(product.parserPrice || lastJob?.status === 'COMPLETED'),
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching parser settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parser settings' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST /api/admin/parser/products/[productId]/auto-parse - вкл/выкл автопарсинг
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  try {
    const body = await request.json();
    const { useParserPrice } = body;

    if (typeof useParserPrice !== 'boolean') {
      return NextResponse.json(
        { error: 'useParserPrice должен быть boolean' },
        { status: 400, headers: corsHeaders }
      );
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: { useParserPrice },
      select: {
        id: true,
        useParserPrice: true,
        parserSources: true,
        parserPrice: true,
        parserOldPrice: true,
        parserDelivery: true,
        parserName: true,
        parserInStock: true,
        parserUpdatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      product,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating parser settings:', error);
    return NextResponse.json(
      { error: 'Failed to update parser settings' },
      { status: 500, headers: corsHeaders }
    );
  }
}
