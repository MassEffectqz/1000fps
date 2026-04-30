import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id, isActive: true, isDraft: false },
      include: {
        images: {
          where: { isMain: true },
          take: 1,
          orderBy: { order: 'asc' },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    const price = Number(product.price);
    const discountValue = Number(product.discountValue);
    let finalPrice = price;

    if (discountValue > 0) {
      if (product.discountType === 'PERCENT') {
        finalPrice = price * (1 - discountValue / 100);
      } else {
        finalPrice = Math.max(0, price - discountValue);
      }
    }

    return NextResponse.json({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: Math.round(price),
      finalPrice: Math.round(finalPrice),
      image: product.images[0]?.url || null,
      inStock: product.stock > 0,
      availableQuantity: product.stock,
      category: product.category,
      brand: product.brand,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}