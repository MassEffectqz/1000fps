import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/public/products/[id]/suppliers - публичный endpoint для получения поставщиков товара
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const suppliers = await prisma.productSupplier.findMany({
      where: { productId: id, inStock: true }, // Только товары в наличии
      orderBy: [{ inStock: 'desc' }, { price: 'asc' }], // Сначала в наличии, потом по цене
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
      },
    });

    return NextResponse.json({
      ok: true,
      data: suppliers.map(s => ({
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
      { ok: false, error: 'Failed to fetch suppliers' },
      { status: 500, headers: corsHeaders }
    );
  }
}
