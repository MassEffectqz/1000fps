import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { addToCartSchema } from '@/lib/validations/cart';

/**
 * POST /api/cart/items - добавить товар в корзину
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = addToCartSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Некорректные данные' },
        { status: 400 }
      );
    }

    const { productId, quantity = 1, warehouseId } = validation.data;

    // Проверяем существование товара
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true, isDraft: false },
      include: {
        images: {
          where: { isMain: true },
          take: 1,
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    // Находим или создаем корзину пользователя
    let cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.userId,
        },
      });
    }

    // Проверяем, есть ли уже такой товар в корзине
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Обновляем количество
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          warehouseId: warehouseId || existingItem.warehouseId,
        },
        include: {
          product: {
            include: {
              images: {
                where: { isMain: true },
                take: 1,
              },
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        item: {
          id: updatedItem.id,
          productId: updatedItem.productId,
          quantity: updatedItem.quantity,
          warehouseId: updatedItem.warehouseId,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            price: Number(product.price),
            finalPrice: Number(product.price),
            image: product.images[0]?.url || null,
          },
        },
      });
    }

    // Создаем новый элемент корзины
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        userId: session.userId,
        productId,
        quantity,
        warehouseId,
      },
      include: {
        product: {
          include: {
            images: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        id: cartItem.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        warehouseId: cartItem.warehouseId,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: Number(product.price),
          finalPrice: Number(product.price),
          image: product.images[0]?.url || null,
        },
      },
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}
