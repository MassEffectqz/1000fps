import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/admin/parser/logs - получить логи парсинга
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (productId) {
      where.productId = productId;
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
    const productIds = jobs
      .map(j => j.productId)
      .filter((id): id is string => !!id);

    let productsMap = new Map<string, {
      id: string;
      name: string;
      slug: string;
      price: Decimal;
    }>();

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
    console.error('Error fetching parser logs:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch parser logs',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
