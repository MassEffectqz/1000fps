'use server';

import { prisma } from '@/lib/prisma';

export interface WarehouseWithStock {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  inStock: boolean;
  quantity: number;
  price: number;
  formattedPrice: string;
}

export interface WarehousesResponse {
  productId: string;
  price: number;
  formattedPrice: string;
  warehouses: WarehouseWithStock[];
}

/**
 * Получить все склады с наличием для товара
 */
export async function getWarehousesWithStock(productId: string): Promise<WarehousesResponse | null> {
  try {
    // Получаем товар для получения цены
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        price: true,
        discountType: true,
        discountValue: true,
      },
    });

    if (!product) {
      return null;
    }

    // Вычисляем цену со скидкой
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

    // Получаем все активные склады с остатками для этого товара
    const warehouses = await prisma.warehouse.findMany({
      where: { isActive: true },
      include: {
        stock: {
          where: { productId },
          select: {
            quantity: true,
            reserved: true,
          },
        },
      },
      orderBy: { city: 'asc' },
    });

    // Форматируем ответ
    const formattedWarehouses: WarehouseWithStock[] = warehouses.map((warehouse) => {
      const stock = warehouse.stock[0];
      const quantity = stock?.quantity ?? 0;
      const reserved = stock?.reserved ?? 0;
      const available = quantity - reserved;

      return {
        id: warehouse.id,
        name: warehouse.name,
        address: warehouse.address,
        city: warehouse.city,
        phone: warehouse.phone,
        inStock: available > 0,
        quantity: available,
        price: finalPrice,
        formattedPrice: finalPrice.toLocaleString('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0,
        }),
      };
    });

    return {
      productId,
      price: finalPrice,
      formattedPrice: finalPrice.toLocaleString('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
      }),
      warehouses: formattedWarehouses,
    };
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return null;
  }
}