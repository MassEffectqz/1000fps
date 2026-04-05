import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/admin/products/[id]/suppliers - получить поставщиков товара
// (публичный доступ — используется на странице товара)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const suppliers = await prisma.productSupplier.findMany({
      where: { productId: id },
      orderBy: { price: 'asc' },
    });

    return NextResponse.json({
      suppliers: suppliers.map(s => ({
        id: s.id,
        name: s.name,
        url: s.url,
        price: Number(s.price),
        oldPrice: s.oldPrice ? Number(s.oldPrice) : null,
        deliveryTime: s.deliveryTime,
        inStock: s.inStock,
        rating: s.rating,
        reviewsCount: s.reviewsCount,
      })),
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500, headers: corsHeaders }
    );
  }
}
