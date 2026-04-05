import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-helpers';
import { updateCartItemSchema } from '@/lib/validations/cart';

/**
 * PUT /api/cart/items/[id] - обновить элемент корзины
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateCartItemSchema.safeParse({
      itemId: id,
      ...body,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Некорректные данные' },
        { status: 400 }
      );
    }

    const { quantity, warehouseId } = validation.data;

    // Находим элемент корзины
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        cart: {
          select: {
            userId: true,
          },
        },
        product: {
          include: {
            images: {
              where: { isMain: true },
              take: 1,
            },
            warehouseStocks: {
              include: {
                warehouse: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Элемент корзины не найден' },
        { status: 404 }
      );
    }

    // Проверяем, что элемент принадлежит текущему пользователю
    if (cartItem.cart.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Проверяем наличие на складе при изменении количества или склада
    const targetWarehouseId = warehouseId || cartItem.warehouseId;
    const newQuantity = quantity || cartItem.quantity;

    if (targetWarehouseId) {
      const warehouseStock = await prisma.warehouseStock.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: targetWarehouseId,
            productId: cartItem.productId,
          },
        },
      });

      if (!warehouseStock || warehouseStock.quantity < newQuantity) {
        return NextResponse.json(
          { error: 'Недостаточно товара на выбранном складе' },
          { status: 400 }
        );
      }
    }

    // Обновляем элемент корзины
    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(warehouseId !== undefined && { warehouseId }),
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

    // Вычисляем цену товара
    const product = cartItem.product;
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

    const mainImage = product.images[0];
    const warehouseStock = targetWarehouseId
      ? product.warehouseStocks.find(ws => ws.warehouseId === targetWarehouseId)
      : product.warehouseStocks[0];

    return NextResponse.json({
      success: true,
      item: {
        id: updatedItem.id,
        productId: updatedItem.product.id,
        quantity: updatedItem.quantity,
        warehouseId: updatedItem.warehouseId,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: Math.round(price),
          finalPrice: Math.round(finalPrice),
          image: mainImage?.url || null,
          inStock: (warehouseStock?.quantity || 0) > 0,
          availableQuantity: warehouseStock?.quantity || 0,
          warehouse: warehouseStock?.warehouse || null,
        },
      },
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/items/[id] - удалить элемент из корзины
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Находим элемент корзины
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        cart: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Элемент корзины не найден' },
        { status: 404 }
      );
    }

    // Проверяем, что элемент принадлежит текущему пользователю
    if (cartItem.cart.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Удаляем элемент
    await prisma.cartItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Товар удален из корзины',
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}
