import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/wb/products - получить все товары для синхронизации с Chrome Extension
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const article = searchParams.get('article');

    if (article) {
      // Поиск по артикулу WB
      const product = await prisma.product.findFirst({
        where: {
          sku: article,
        },
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          oldPrice: true,
        },
      });

      if (product) {
        return NextResponse.json({
          ok: true,
          data: {
            id: product.id,
            wb_article: product.sku,
            name: product.name,
            price: Number(product.price),
          },
        });
      }

      return NextResponse.json({
        ok: false,
        error: 'Товар не найден',
      }, { status: 404 });
    }

    // Получить все товары
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isDraft: false,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        oldPrice: true,
      },
      take: 100,
    });

    return NextResponse.json({
      ok: true,
      data: products.map(p => ({
        id: p.id,
        wb_article: p.sku,
        name: p.name,
        price: Number(p.price),
      })),
    });
  } catch (error) {
    console.error('Error fetching WB products:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch products',
    }, { status: 500 });
  }
}

// POST /api/wb/products - создать/обновить товар из Chrome Extension
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wb_article, price, oldPrice } = body;

    // Проверяем существует ли товар
    const existing = await prisma.product.findFirst({
      where: { sku: wb_article },
    });

    if (existing) {
      // Обновляем цену
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          price: price,
          oldPrice: oldPrice || null,
        },
      });

      // Логируем изменение цены
      await prisma.priceHistory.create({
        data: {
          productId: existing.id,
          oldPrice: existing.price,
          newPrice: price,
          reason: 'PARSER_UPDATE',
        },
      });

      return NextResponse.json({
        ok: true,
        message: 'Цена обновлена',
      });
    }

    // Товар не найден - это нормально, Extension просто синхронизирует
    return NextResponse.json({
      ok: false,
      error: 'Товар не найден в базе',
    }, { status: 404 });
  } catch (error) {
    console.error('Error syncing WB product:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to sync product',
    }, { status: 500 });
  }
}

// DELETE /api/wb/products/[article] - удалить товар
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const article = searchParams.get('article');

    if (!article) {
      return NextResponse.json({
        ok: false,
        error: 'Article required',
      }, { status: 400 });
    }

    await prisma.product.deleteMany({
      where: { sku: article },
    });

    return NextResponse.json({
      ok: true,
      message: 'Товар удалён',
    });
  } catch (error) {
    console.error('Error deleting WB product:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to delete product',
    }, { status: 500 });
  }
}
