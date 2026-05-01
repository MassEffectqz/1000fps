'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { addToCartSchema, updateCartItemSchema, removeFromCartSchema } from '@/lib/validations/cart';

export async function addToCart(productId: string, quantity: number = 1, warehouseId?: string, supplierId?: string) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return {
        success: false,
        error: 'Требуется авторизация',
        requiresAuth: true,
      };
    }

    const validation = addToCartSchema.safeParse({ productId, quantity, warehouseId, supplierId });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Некорректные данные',
      };
    }

    let product = await prisma.product.findUnique({
      where: { id: productId, isActive: true, isDraft: false },
    });

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

    if (warehouseId && !supplierId) {
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
    } else if (warehouseId && supplierId) {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: warehouseId },
      });

      if (!warehouse) {
        return {
          success: false,
          error: 'Склад доставки (ПВЗ) не найден',
        };
      }
    }

    const cartItem = await prisma.$transaction(async (tx) => {
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

      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
          warehouseId: warehouseId || null,
          supplierId: supplierId || null,
        },
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const stockWarehouseId = warehouseId || existingItem.warehouseId;
        const currentSupplierId = supplierId || existingItem.supplierId;

        if (stockWarehouseId && !currentSupplierId) {
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
        return await tx.cartItem.create({
          data: {
            cartId: cart.id,
            userId: session.userId,
            productId,
            quantity,
            warehouseId,
            supplierId,
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

    const validation = removeFromCartSchema.safeParse({ itemId });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Некорректный ID элемента',
      };
    }

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

    if (cartItem.cart.userId !== session.userId) {
      return {
        success: false,
        error: 'Доступ запрещен',
      };
    }

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
    return {
      success: false,
      error: 'Ошибка при удалении из корзины',
    };
  }
}

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

    const validation = updateCartItemSchema.safeParse({ itemId, quantity, warehouseId });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Некорректные данные',
      };
    }

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

    if (cartItem.cart.userId !== session.userId) {
      return {
        success: false,
        error: 'Доступ запрещен',
      };
    }

    const targetWarehouseId = warehouseId || cartItem.warehouseId;
    const newQuantity = quantity || cartItem.quantity;

    if (targetWarehouseId && !cartItem.supplierId) {
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
    return {
      success: false,
      error: 'Ошибка при обновлении корзины',
    };
  }
}

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
    return {
      success: false,
      error: 'Ошибка при очистке корзины',
    };
  }
}