import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// CORS заголовки
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS handler для CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/admin/parser/products/[productId] - получить данные парсинга товара
// (защищено middleware — только ADMIN/MANAGER)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  try {
    // Получаем последнюю завершённую задачу парсинга
    const parseJob = await prisma.parseJob.findFirst({
      where: {
        productId,
        status: 'COMPLETED',
      },
      orderBy: { completedAt: 'desc' },
    });

    if (!parseJob) {
      return NextResponse.json(
        { error: 'Парсинг не выполнялся' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Безопасно раскрываем result только если это объект
    const resultData = parseJob.result && typeof parseJob.result === 'object'
      ? parseJob.result
      : {};

    return NextResponse.json({
      productId: parseJob.productId,
      parsedAt: parseJob.completedAt,
      source: parseJob.sources[0],
      sources: parseJob.sources, // Возвращаем все источники
      parsedData: resultData, // Возвращаем как parsedData для совместимости
      ...resultData,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching parse data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parse data' },
      { status: 500, headers: corsHeaders }
    );
  }
}
