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

// GET /api/admin/parser/products/[productId]/history - история изменений цен
// (защищено middleware — только ADMIN/MANAGER)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  try {
    const history = await prisma.priceHistory.findMany({
      where: { id: productId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return NextResponse.json(
      history.map(h => ({
        date: h.createdAt,
        price: Number(h.newPrice),
        oldPrice: Number(h.oldPrice),
        reason: h.reason,
      })),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error fetching price history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price history' },
      { status: 500, headers: corsHeaders }
    );
  }
}
