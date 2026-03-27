import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';
import { WarehousesService } from '../warehouses/warehouses.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private warehousesService: WarehousesService
  ) {}

  /**
   * Список заказов пользователя
   */
  async findAll(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { brand: true, category: true, images: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { orders };
  }

  /**
   * Заказ по ID
   */
  async findOne(id: number, userId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: { brand: true, category: true, images: true },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    // Проверка прав доступа
    if (order.userId !== userId) {
      throw new BadRequestException('Нет доступа к этому заказу');
    }

    return order;
  }

  /**
   * Создать заказ
   */
  async create(createOrderDto: CreateOrderDto) {
    const { userId, items, shippingAddress, shippingMethod, paymentMethod, comment, warehouseId } =
      createOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Корзина пуста');
    }

    // Определяем склад для самовывоза (по умолчанию первый активный)
    let effectiveWarehouseId = warehouseId;
    if (!effectiveWarehouseId) {
      const defaultWarehouse = await this.prisma.warehouse.findFirst({
        where: { isActive: true },
      });
      effectiveWarehouseId = defaultWarehouse?.id;
    }

    // Подсчёт стоимости и проверка наличия
    let subtotal = 0;
    const orderItemsData: {
      productId: number;
      quantity: number;
      price: number;
      total: number;
      name: string;
      sku: string;
    }[] = [];

    for (const item of items) {
      // Проверяем наличие на конкретном складе
      const warehouseStock = await this.prisma.warehouseStock.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: effectiveWarehouseId!,
            productId: item.productId,
          },
        },
        include: {
          product: {
            select: {
              price: true,
              name: true,
              sku: true,
              available: true,
            },
          },
        },
      });

      if (!warehouseStock) {
        throw new NotFoundException(`Товар ID ${item.productId} не найден на складе`);
      }

      const availableQuantity = warehouseStock.quantity - warehouseStock.reserved;
      if (!warehouseStock.product.available || availableQuantity < item.quantity) {
        throw new BadRequestException(
          `Товар "${warehouseStock.product.name}" недоступен или недостаточно на складе`
        );
      }

      const itemTotal = Number(warehouseStock.product.price) * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(warehouseStock.product.price),
        total: itemTotal,
        name: warehouseStock.product.name,
        sku: warehouseStock.product.sku,
      });
    }

    const shippingCost = shippingMethod === 'pickup' ? 0 : 0; // TODO: рассчитать стоимость доставки
    const total = subtotal + shippingCost;

    // Создание заказа в транзакции
    const order = await this.prisma.$transaction(async (tx) => {
      // Создать заказ
      const createdOrder = await tx.order.create({
        data: {
          userId,
          orderNumber: `ORD-${Date.now()}`,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          shippingAddress: shippingAddress as Prisma.InputJsonValue,
          shippingMethod,
          paymentMethod,
          comment,
          subtotal,
          shippingCost,
          total,
          warehouseId: effectiveWarehouseId,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: { brand: true, category: true, images: true },
              },
            },
          },
        },
      });

      // Резервируем товар на складе
      for (const item of items) {
        await tx.warehouseStock.update({
          where: {
            warehouseId_productId: {
              warehouseId: effectiveWarehouseId!,
              productId: item.productId,
            },
          },
          data: {
            reserved: { increment: item.quantity },
          },
        });
      }

      // Очистить корзину пользователя
      await tx.cartItem.deleteMany({
        where: {
          cart: {
            userId,
          },
        },
      });

      // Обновить корзину
      await tx.cart.updateMany({
        where: { userId },
        data: { totalPrice: 0 },
      });

      // Начислить бонусные баллы (1% от суммы)
      const bonusPoints = Math.floor(total / 100);
      if (bonusPoints > 0) {
        await tx.user.update({
          where: { id: userId },
          data: {
            bonusPoints: { increment: bonusPoints },
          },
        });

        await tx.order.update({
          where: { id: createdOrder.id },
          data: { bonusPointsEarned: bonusPoints },
        });
      }

      return createdOrder;
    });

    return order;
  }

  /**
   * Отменить заказ
   */
  async cancel(id: number, userId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Нет доступа к этому заказу');
    }

    if (['SHIPPED', 'DELIVERING', 'DELIVERED'].includes(order.status)) {
      throw new BadRequestException('Нельзя отменить заказ, который уже отправлен');
    }

    await this.prisma.$transaction(async (tx) => {
      // Обновить статус заказа
      await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      // Вернуть товары на склад
      const orderItems = await tx.orderItem.findMany({
        where: { orderId: id },
      });

      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            reserved: { decrement: item.quantity },
          },
        });
      }
    });

    return { message: 'Заказ отменён' };
  }
}
