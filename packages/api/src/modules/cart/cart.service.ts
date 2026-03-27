import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить или создать корзину
   */
  async getOrCreateCart(userId?: number, sessionId?: string) {
    let cart = await this.prisma.cart.findFirst({
      where: {
        OR: [userId ? { userId } : {}, sessionId ? { sessionId } : {}].filter(Boolean),
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
          sessionId,
          totalPrice: 0,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  brand: true,
                  category: true,
                  images: true,
                },
              },
            },
          },
        },
      });
    }

    return { cart };
  }

  /**
   * Добавить товар в корзину
   */
  async addItem(addToCartDto: AddToCartDto & { sessionId?: string }) {
    const { userId, productId, quantity = 1, sessionId } = addToCartDto;

    // Найти или создать корзину
    const cart = await this.getOrCreateCart(userId, sessionId);

    // Проверить существующий элемент
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Обновить количество
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      // Получить цену товара
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: { price: true },
      });

      // Создать новый элемент
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.cart.id,
          productId,
          quantity,
          price: Number(product?.price) || 0,
        },
      });
    }

    // Пересчитать общую стоимость
    return this.recalculateTotal(cart.cart.id);
  }

  /**
   * Обновить количество товара
   */
  async updateItem(itemId: number, quantity: number) {
    if (quantity < 1) {
      await this.removeItem(itemId);
      return { message: 'Товар удалён из корзины' };
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    brand: true,
                    category: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Элемент корзины не найден');
    }

    await this.recalculateTotal(cartItem.cart.id);
    return this.getCart(cartItem.cart.id);
  }

  /**
   * Удалить товар из корзины
   */
  async removeItem(itemId: number) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Элемент корзины не найден');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    await this.recalculateTotal(cartItem.cart.id);
    return { message: 'Товар удалён из корзины' };
  }

  /**
   * Очистить корзину
   */
  async clearCart(userId?: number, sessionId?: string) {
    const cart = await this.prisma.cart.findFirst({
      where: {
        OR: [userId ? { userId } : {}, sessionId ? { sessionId } : {}].filter(Boolean),
      },
    });

    if (!cart) {
      return { message: 'Корзина не найдена' };
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { totalPrice: 0 },
    });

    return { message: 'Корзина очищена' };
  }

  /**
   * Применить промокод
   */
  async applyPromo(userId?: number, sessionId?: string, _code?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    // TODO: Реализовать проверку промокодов
    // Пока просто возвращаем корзину
    return this.recalculateTotal(cart.cart.id);
  }

  /**
   * Пересчитать общую стоимость
   */
  private async recalculateTotal(cartId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Корзина не найдена');
    }

    const totalPrice = cart.items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity;
    }, 0);

    await this.prisma.cart.update({
      where: { id: cartId },
      data: { totalPrice },
    });

    return {
      cart: {
        ...cart,
        totalPrice,
      },
    };
  }

  /**
   * Получить корзину по ID
   */
  private async getCart(cartId: number) {
    return this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
                images: true,
              },
            },
          },
        },
      },
    });
  }
}
