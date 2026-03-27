import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить вишлист пользователя
   */
  async getWishlist(userId: number) {
    let wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
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

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: { userId },
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

    return { wishlist };
  }

  /**
   * Добавить товар в вишлист
   */
  async addItem(userId: number, productId: number) {
    // Найти вишлист
    let wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({ data: { userId } });
    }

    // Проверить существующий элемент
    const existing = await this.prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (!existing) {
      await this.prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
    }

    return { message: 'Добавлено в вишлист' };
  }

  /**
   * Удалить товар из вишлиста
   */
  async removeItem(itemId: number) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Элемент вишлиста не найден');
    }

    await this.prisma.wishlistItem.delete({
      where: { id: itemId },
    });

    return { message: 'Удалено из вишлиста' };
  }
}
