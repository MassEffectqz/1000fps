import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseStockDto } from './dto/update-warehouse-stock.dto';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить все склады
   */
  async findAll() {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { isActive: true },
      include: {
        stock: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                mainImageUrl: true,
              },
            },
          },
        },
      },
    });

    return { data: warehouses };
  }

  /**
   * Получить склад по ID
   */
  async findOne(id: number) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        stock: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                mainImageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Склад не найден');
    }

    return warehouse;
  }

  /**
   * Обновить склад
   */
  async update(id: number, updateWarehouseDto: UpdateWarehouseDto) {
    const warehouse = await this.prisma.warehouse.update({
      where: { id },
      data: updateWarehouseDto,
    });

    return warehouse;
  }

  /**
   * Получить остатки товара на складах
   */
  async getProductStock(productId: number) {
    const stock = await this.prisma.warehouseStock.findMany({
      where: { productId },
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
    });

    return { data: stock };
  }

  /**
   * Обновить остаток товара на складе
   */
  async updateStock(warehouseId: number, productId: number, updateStockDto: UpdateWarehouseStockDto) {
    // Проверка существования склада
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      throw new NotFoundException('Склад не найден');
    }

    // Проверка существования товара
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    // Обновление или создание записи об остатках
    const stock = await this.prisma.warehouseStock.upsert({
      where: {
        warehouseId_productId: {
          warehouseId,
          productId,
        },
      },
      update: {
        quantity: updateStockDto.quantity,
        reserved: updateStockDto.reserved,
      },
      create: {
        warehouseId,
        productId,
        quantity: updateStockDto.quantity,
        reserved: updateStockDto.reserved || 0,
      },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    // Обновление общего stock в Product (сумма по всем складам)
    const allStock = await this.prisma.warehouseStock.findMany({
      where: { productId },
      select: { quantity: true },
    });

    const totalStock = allStock.reduce((sum, s) => sum + s.quantity, 0);

    await this.prisma.product.update({
      where: { id: productId },
      data: { stock: totalStock },
    });

    return stock;
  }

  /**
   * Резервирование товара на складе
   */
  async reserveStock(warehouseId: number, productId: number, quantity: number) {
    const stock = await this.prisma.warehouseStock.findUnique({
      where: {
        warehouseId_productId: {
          warehouseId,
          productId,
        },
      },
    });

    if (!stock) {
      throw new NotFoundException('Товар не найден на складе');
    }

    if (stock.quantity - stock.reserved < quantity) {
      throw new NotFoundException('Недостаточно товара для резерва');
    }

    return this.prisma.warehouseStock.update({
      where: {
        warehouseId_productId: {
          warehouseId,
          productId,
        },
      },
      data: {
        reserved: { increment: quantity },
      },
    });
  }

  /**
   * Снять резерв с товара
   */
  async unreserveStock(warehouseId: number, productId: number, quantity: number) {
    return this.prisma.warehouseStock.update({
      where: {
        warehouseId_productId: {
          warehouseId,
          productId,
        },
      },
      data: {
        reserved: { decrement: quantity },
      },
    });
  }

  /**
   * Списать товар со склада (при отгрузке)
   */
  async deductStock(warehouseId: number, productId: number, quantity: number) {
    const stock = await this.prisma.warehouseStock.findUnique({
      where: {
        warehouseId_productId: {
          warehouseId,
          productId,
        },
      },
    });

    if (!stock) {
      throw new NotFoundException('Товар не найден на складе');
    }

    if (stock.quantity < quantity) {
      throw new NotFoundException('Недостаточно товара на складе');
    }

    await this.prisma.warehouseStock.update({
      where: {
        warehouseId_productId: {
          warehouseId,
          productId,
        },
      },
      data: {
        quantity: { decrement: quantity },
        reserved: { decrement: Math.min(stock.reserved, quantity) },
      },
    });

    // Обновление общего stock в Product
    const allStock = await this.prisma.warehouseStock.findMany({
      where: { productId },
      select: { quantity: true },
    });

    const totalStock = allStock.reduce((sum, s) => sum + s.quantity, 0);

    await this.prisma.product.update({
      where: { id: productId },
      data: { stock: totalStock },
    });
  }
}
