'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { addToCartSchema, updateCartItemSchema, removeFromCartSchema } from '@/lib/validations/cart';

/**
 * Добавить товар в корзину
 */
export async function addToCart(productId: string, quantity: number = 1, warehouseId?: string) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return {
        success: false,
        error: 'Требуется авторизация',
        requiresAuth: true,
      };
    }

    // Валидация
    const validation = addToCartSchema.safeParse({ productId, quantity, warehouseId });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Некорректные данные',
      };
    }

    // Проверяем существование товара
    // Если передан supplierId - ищем товар по ID поставщика
    let product = await prisma.product.findUnique({
      where: { id: productId, isActive: true, isDraft: false },
    });

    // Если товар не найден по ID - пробуем найти по ID поставщика
    if (!product) {
      const supplier = await prisma.productSupplier.findUnique({
        where: { id: productId },
        select: { productId: true },
      });
      if (supplier?.productId) {
        product = await prisma.product.findUnique({
          where: { id: supplier.productId, isActive: true, isDraft: false },
        });
      }
    }

    if (!product) {
      return {
        success: false,
        error: 'Товар не найден',
      };
    }

    // Проверяем существование склада, если указан warehouseId
    if (warehouseId) {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: warehouseId },
      });

      if (!warehouse) {
        return {
          success: false,
          error: 'Склад не найден',
        };
      }

      const warehouseStock = await prisma.warehouseStock.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId,
            productId,
          },
        },
      });

      if (!warehouseStock || warehouseStock.quantity < quantity) {
        return {
          success: false,
          error: 'Недостаточно товара на выбранном складе',
        };
      }
    }

    // Транзакция для избежания race condition
    const cartItem = await prisma.$transaction(async (tx) => {
      // Находим или создаем корзину пользователя
      let cart = await tx.cart.findUnique({
        where: { userId: session.userId },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: {
            userId: session.userId,
          },
        });
      }

      // Проверяем, есть ли уже такой товар в корзине с таким же складом/поставщиком
      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
          warehouseId: warehouseId || null,
        },
      });

      if (existingItem) {
        // Обновляем количество
        const newQuantity = existingItem.quantity + quantity;

        // Проверяем наличие на складе при обновлении
        const stockWarehouseId = warehouseId || existingItem.warehouseId;
        if (stockWarehouseId) {
          const warehouseStock = await tx.warehouseStock.findUnique({
            where: {
              warehouseId_productId: {
                warehouseId: stockWarehouseId,
                productId,
              },
            },
          });

          if (!warehouseStock || warehouseStock.quantity < newQuantity) {
            throw new Error('Недостаточно товара на складе для обновления количества');
          }
        }

        return await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
            warehouseId: warehouseId || existingItem.warehouseId,
          },
        });
      } else {
        // Создаем новый элемент
        return await tx.cartItem.create({
          data: {
            cartId: cart.id,
            userId: session.userId,
            productId,
            quantity,
            warehouseId,
          },
        });
      }
    });

    revalidatePath('/cart');
    revalidatePath('/api/cart');

    return {
      success: true,
      message: 'Товар добавлен в корзину',
      itemId: cartItem.id,
      quantity: cartItem.quantity,
    };
  } catch (error) {
    console.error('Error adding to cart:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Ошибка при добавлении в корзину';
    
    if (errorMessage.includes('склада')) {
      return {
        success: false,
        error: errorMessage,
      };
    }
    
    return {
      success: false,
      error: 'Ошибка при добавлении в корзину',
    };
  }
}

/**
 * Удалить товар из корзины
 */
export async function removeFromCart(itemId: string) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return {
        success: false,
        error: 'Требуется авторизация',
        requiresAuth: true,
      };
    }

    // Валидация
    const validation = removeFromCartSchema.safeParse({ itemId });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Некорректный ID элемента',
      };
    }

    // Находим элемент корзины
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!cartItem) {
      return {
        success: false,
        error: 'Элемент корзины не найден',
      };
    }

    // Проверяем, что элемент принадлежит текущему пользователю
    if (cartItem.cart.userId !== session.userId) {
      return {
        success: false,
        error: 'Доступ запрещен',
      };
    }

    // Удаляем элемент
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    revalidatePath('/cart');
    revalidatePath('/api/cart');

    return {
      success: true,
      message: 'Товар удален из корзины',
    };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return {
      success: false,
      error: 'Ошибка при удалении из корзины',
    };
  }
}

/**
 * Обновить элемент корзины
 */
export async function updateCartItem(itemId: string, quantity?: number, warehouseId?: string) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return {
        success: false,
        error: 'Требуется авторизация',
        requiresAuth: true,
      };
    }

    // Валидация
    const validation = updateCartItemSchema.safeParse({ itemId, quantity, warehouseId });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Некорректные данные',
      };
    }

    // Находим элемент корзины
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: {
          select: {
            userId: true,
          },
        },
        product: {
          include: {
            warehouseStocks: true,
          },
        },
      },
    });

    if (!cartItem) {
      return {
        success: false,
        error: 'Элемент корзины не найден',
      };
    }

    // Проверяем, что элемент принадлежит текущему пользователю
    if (cartItem.cart.userId !== session.userId) {
      return {
        success: false,
        error: 'Доступ запрещен',
      };
    }

    // Проверяем наличие на складе при изменении количества или склада
    const targetWarehouseId = warehouseId || cartItem.warehouseId;
    const newQuantity = quantity || cartItem.quantity;

    if (targetWarehouseId) {
      const warehouseStock = cartItem.product.warehouseStocks.find(
        ws => ws.warehouseId === targetWarehouseId
      );

      if (!warehouseStock || warehouseStock.quantity < newQuantity) {
        return {
          success: false,
          error: 'Недостаточно товара на выбранном складе',
        };
      }
    }

    // Обновляем элемент корзины
    await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(warehouseId !== undefined && { warehouseId }),
      },
    });

    revalidatePath('/cart');
    revalidatePath('/api/cart');

    return {
      success: true,
      message: 'Корзина обновлена',
    };
  } catch (error) {
    console.error('Error updating cart item:', error);
    return {
      success: false,
      error: 'Ошибка при обновлении корзины',
    };
  }
}

/**
 * Очистить корзину
 */
export async function clearCart() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return {
        success: false,
        error: 'Требуется авторизация',
        requiresAuth: true,
      };
    }

    // Удаляем все элементы корзины
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId: session.userId,
        },
      },
    });

    revalidatePath('/cart');
    revalidatePath('/api/cart');

    return {
      success: true,
      message: 'Корзина очищена',
    };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return {
      success: false,
      error: 'Ошибка при очистке корзины',
    };
  }
}
