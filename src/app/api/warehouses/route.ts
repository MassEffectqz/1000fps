import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// CORS заголовки
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// OPTIONS handler для CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/warehouses?productId=xxx - получить все склады с наличием для товара
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Получаем товар для получения цены
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        price: true,
        discountType: true,
        discountValue: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Вычисляем цену со скидкой
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

    // Получаем все активные склады с остатками для этого товара
    const warehouses = await prisma.warehouse.findMany({
      where: { isActive: true },
      include: {
        stock: {
          where: { productId },
          select: {
            quantity: true,
            reserved: true,
          },
        },
      },
      orderBy: { city: 'asc' },
    });

    // Форматируем ответ
    const formattedWarehouses = warehouses.map((warehouse) => {
      const stock = warehouse.stock[0];
      const quantity = stock?.quantity ?? 0;
      const reserved = stock?.reserved ?? 0;
      const available = quantity - reserved;

      return {
        id: warehouse.id,
        name: warehouse.name,
        address: warehouse.address,
        city: warehouse.city,
        phone: warehouse.phone,
        inStock: available > 0,
        quantity: available,
        price: finalPrice,
        formattedPrice: finalPrice.toLocaleString('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0,
        }),
      };
    });

    return NextResponse.json(
      {
        productId,
        price: finalPrice,
        formattedPrice: finalPrice.toLocaleString('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0,
        }),
        warehouses: formattedWarehouses,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouses' },
      { status: 500, headers: corsHeaders }
    );
  }
}
