import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

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

// GET /api/admin/parser/jobs - получить список задач парсинга
// (защищено middleware — только ADMIN/MANAGER)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      prisma.parseJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.parseJob.count({ where }),
    ]);

    // Получаем товары для задач
    const productIds = jobs.map(j => j.productId).filter((id): id is string => !!id);
    let productsMap = new Map<string, { id: string; name: string; slug: string; price: Decimal }>();
    
    if (productIds.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
        },
      });
      productsMap = new Map(products.map(p => [p.id, p]));
    }

    const jobsWithProducts = jobs.map(j => ({
      ...j,
      product: j.productId ? productsMap.get(j.productId) : null,
    }));

    return NextResponse.json({
      jobs: jobsWithProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching parser jobs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch parser jobs',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
