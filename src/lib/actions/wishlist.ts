'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { addToWishlistSchema, removeFromWishlistSchema } from '@/lib/validations/cart';

/**
 * Добавить товар в вишлист
 */
export async function addToWishlist(productId: string) {
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
    const validation = addToWishlistSchema.safeParse({ productId });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Некорректный ID товара',
      };
    }

    // Проверяем существование товара
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true, isDraft: false },
    });

    if (!product) {
      return {
        success: false,
        error: 'Товар не найден',
      };
    }

    // Находим или создаем вишлист пользователя
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId: session.userId,
        },
      });
    }

    // Проверяем, есть ли уже такой товар в вишлисте
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existingItem) {
      return {
        success: false,
        error: 'Товар уже в вишлисте',
      };
    }

    // Создаем новый элемент вишлиста
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        userId: session.userId,
        productId,
      },
    });

    revalidatePath('/wishlist');
    revalidatePath('/api/wishlist');

    return {
      success: true,
      message: 'Товар добавлен в вишлист',
      itemId: wishlistItem.id,
    };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return {
      success: false,
      error: 'Ошибка при добавлении в вишлист',
    };
  }
}

/**
 * Удалить товар из вишлиста
 */
export async function removeFromWishlist(itemId: string) {
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
    const validation = removeFromWishlistSchema.safeParse({ itemId });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Некорректный ID элемента',
      };
    }

    // Находим элемент вишлиста
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: { id: itemId },
      include: {
        wishlist: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!wishlistItem) {
      return {
        success: false,
        error: 'Элемент вишлиста не найден',
      };
    }

    // Проверяем, что элемент принадлежит текущему пользователю
    if (wishlistItem.wishlist.userId !== session.userId) {
      return {
        success: false,
        error: 'Доступ запрещен',
      };
    }

    // Удаляем элемент
    await prisma.wishlistItem.delete({
      where: { id: itemId },
    });

    revalidatePath('/wishlist');
    revalidatePath('/api/wishlist');

    return {
      success: true,
      message: 'Товар удален из вишлиста',
    };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return {
      success: false,
      error: 'Ошибка при удалении из вишлиста',
    };
  }
}

/**
 * Перенести товары из вишлиста в корзину
 */
export async function wishlistToCart(itemIds?: string[]) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return {
        success: false,
        error: 'Требуется авторизация',
        requiresAuth: true,
      };
    }

    // Получаем элементы вишлиста
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        id: itemIds ? { in: itemIds } : undefined,
        userId: session.userId,
      },
      include: {
        product: {
          include: {
            warehouseStocks: {
              include: {
                warehouse: true,
              },
            },
          },
        },
      },
    });

    if (wishlistItems.length === 0) {
      return {
        success: false,
        error: 'Нет товаров для переноса',
      };
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

    // Переносим товары в корзину
    let addedCount = 0;

    for (const wishlistItem of wishlistItems) {
      const product = wishlistItem.product;
      
      // Проверяем наличие на складе
      const firstWarehouseStock = product.warehouseStocks.find(ws => ws.quantity > 0);
      
      // Проверяем, есть ли уже такой товар в корзине
      const existingCartItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart!.id,
            productId: product.id,
          },
        },
      });

      if (existingCartItem) {
        // Обновляем количество
        await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: existingCartItem.quantity + 1,
          },
        });
      } else {
        // Создаем новый элемент корзины
        await prisma.cartItem.create({
          data: {
            cartId: cart!.id,
            userId: session.userId,
            productId: product.id,
            quantity: 1,
            warehouseId: firstWarehouseStock?.warehouseId,
          },
        });
      }

      addedCount++;
    }

    // Удаляем перенесенные товары из вишлиста
    await prisma.wishlistItem.deleteMany({
      where: {
        id: {
          in: wishlistItems.map(item => item.id),
        },
      },
    });

    revalidatePath('/cart');
    revalidatePath('/wishlist');
    revalidatePath('/api/cart');
    revalidatePath('/api/wishlist');

    return {
      success: true,
      message: `Перенесено ${addedCount} товаров в корзину`,
      addedCount,
    };
  } catch (error) {
    console.error('Error moving wishlist to cart:', error);
    return {
      success: false,
      error: 'Ошибка при переносе товаров в корзину',
    };
  }
}

/**
 * Очистить вишлист
 */
export async function clearWishlist() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return {
        success: false,
        error: 'Требуется авторизация',
        requiresAuth: true,
      };
    }

    // Удаляем все элементы вишлиста
    await prisma.wishlistItem.deleteMany({
      where: {
        wishlist: {
          userId: session.userId,
        },
      },
    });

    revalidatePath('/wishlist');
    revalidatePath('/api/wishlist');

    return {
      success: true,
      message: 'Вишлист очищен',
    };
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return {
      success: false,
      error: 'Ошибка при очистке вишлиста',
    };
  }
}
