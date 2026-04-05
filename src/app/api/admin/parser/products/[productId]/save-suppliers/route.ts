import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// POST /api/admin/parser/products/[productId]/save-suppliers - сохранить поставщиков для товара
// (защищено middleware — только ADMIN/MANAGER)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  try {
    // Получаем последнюю завершенную задачу парсинга
    const parseJob = await prisma.parseJob.findFirst({
      where: {
        productId,
        status: 'COMPLETED',
      },
      orderBy: { completedAt: 'desc' },
    });

    if (!parseJob || !parseJob.result) {
      return NextResponse.json(
        { error: 'Нет завершенных задач парсинга' },
        { status: 404, headers: corsHeaders }
      );
    }

    const resultData = parseJob.result as { results?: unknown[]; parsedData?: { results?: unknown[] } };
    const results = resultData?.results || resultData?.parsedData?.results || [];

    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: 'Нет данных для сохранения' },
        { status: 400, headers: corsHeaders }
      );
    }

    let savedCount = 0;

    for (const result of results) {
      const r = result as { success?: boolean; data?: { price?: number; oldPrice?: number; deliveryDate?: { value?: string } | string; inStock?: boolean; rating?: { value?: number }; reviewsCount?: { value?: number } }; source?: string };
      if (!r.success || !r.data) continue;

      const source = r.source;
      if (!source) continue;

      const data = r.data;

      // Извлекаем имя источника из URL
      let name = 'Поставщик';
      try {
        const url = new URL(source);
        name = url.hostname.replace('www.', '').split('.')[0].toUpperCase();
      } catch {}

      // Извлекаем срок доставки (может быть строкой или объектом)
      let deliveryTime: string | null = null;
      if (data.deliveryDate) {
        if (typeof data.deliveryDate === 'string') {
          deliveryTime = data.deliveryDate;
        } else if (typeof data.deliveryDate === 'object' && data.deliveryDate.value) {
          deliveryTime = data.deliveryDate.value;
        }
      }

      // Сохраняем или обновляем поставщика
      await prisma.productSupplier.upsert({
        where: {
          productId_url: {
            productId,
            url: source,
          },
        },
        create: {
          productId,
          name,
          url: source,
          price: data.price ? new Decimal(data.price) : new Decimal(0),
          oldPrice: data.oldPrice ? new Decimal(data.oldPrice) : null,
          deliveryTime,
          inStock: data.inStock || false,
          rating: data.rating?.value || null,
          reviewsCount: data.reviewsCount?.value || null,
        },
        update: {
          price: data.price ? new Decimal(data.price) : new Decimal(0),
          oldPrice: data.oldPrice ? new Decimal(data.oldPrice) : null,
          deliveryTime,
          inStock: data.inStock || false,
          rating: data.rating?.value || null,
          reviewsCount: data.reviewsCount?.value || null,
        },
      });

      savedCount++;
    }

    return NextResponse.json({
      success: true,
      savedCount,
      message: `Сохранено ${savedCount} поставщиков`,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error saving suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to save suppliers' },
      { status: 500, headers: corsHeaders }
    );
  }
}
