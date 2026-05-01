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

// POST /api/admin/parser/jobs/[jobId]/status - обновить статус задачи и сохранить результаты
// (защищено middleware — только ADMIN/MANAGER)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await request.json();
    const { status, result, error, completedAt } = body;

    // Находим задачу в БД
    const existingJob = await prisma.parseJob.findUnique({
      where: { id: jobId },
    });

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Задача не найдена' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Подготавливаем данные для обновления
    const updateData: Record<string, unknown> = {};
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    if (result !== undefined) {
      updateData.result = result;
    }
    
    if (error !== undefined) {
      updateData.error = error;
    }
    
    if (completedAt !== undefined) {
      updateData.completedAt = new Date(completedAt);
    }

    // Обновляем задачу
    const updatedJob = await prisma.parseJob.update({
      where: { id: jobId },
      data: updateData,
    });

    // Если парсинг завершён успешно и есть productId - обновляем цену товара
    if (status === 'COMPLETED' && result?.parsedData && existingJob.productId) {
      const { parsedData } = result;
      
      // Получаем текущие данные товара
      const product = await prisma.product.findUnique({
        where: { id: existingJob.productId },
        select: { id: true, price: true, oldPrice: true },
      });

      if (product) {
        const updates: Record<string, unknown> = {};
        const priceHistoryUpdates: Array<{
          productId: string;
          oldPrice: Decimal;
          newPrice: Decimal;
          reason: string;
        }> = [];

        // Обновляем цену если изменилась (применяем скидку 2%)
        if (parsedData.price && parsedData.price !== Number(product.price)) {
          const discountedPrice = Math.round(parsedData.price * 0.98);
          const newPrice = new Decimal(discountedPrice);
          priceHistoryUpdates.push({
            productId: product.id,
            oldPrice: product.price,
            newPrice: newPrice,
            reason: 'parser_update',
          });
          updates.price = newPrice;
        }

        // Обновляем старую цену если изменилась
        if (parsedData.oldPrice) {
          const oldPriceValue = new Decimal(parsedData.oldPrice);
          if (!product.oldPrice || oldPriceValue !== product.oldPrice) {
            updates.oldPrice = oldPriceValue;
          }
        }

        // Обновляем наличие
        if (typeof parsedData.inStock === 'boolean') {
          updates.isActive = parsedData.inStock;
        }

        // Обновляем рейтинг и отзывы
        if (parsedData.rating) {
          updates.rating = parsedData.rating;
        }
        if (parsedData.reviewsCount !== undefined) {
          updates.reviewCount = parsedData.reviewsCount;
        }

        // Применяем обновления товара
        if (Object.keys(updates).length > 0) {
          await prisma.product.update({
            where: { id: product.id },
            data: updates,
          });
        }

        // Сохраняем историю цен
        if (priceHistoryUpdates.length > 0) {
          await prisma.priceHistory.createMany({
            data: priceHistoryUpdates,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      job: updatedJob,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating parse job status:', error);
    return NextResponse.json(
      { error: 'Failed to update parse job status' },
      { status: 500, headers: corsHeaders }
    );
  }
}
