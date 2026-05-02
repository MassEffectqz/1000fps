import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-helpers';
import { createOrderSchema } from '@/lib/validations/checkout';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (orderId) {
      const order = await prisma.order.findFirst({
        where: { id: orderId, userId: session.userId },
        include: {
          warehouse: true,
          supplier: true,
          items: {
            include: {
              product: {
                include: {
                  images: { where: { isMain: true }, take: 1 },
                },
              },
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: 'Заказ не найден' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          deliveryMethod: order.deliveryMethod,
          deliveryAddress: order.deliveryAddress,
          deliveryCost: Number(order.deliveryCost),
          subtotal: Number(order.subtotal),
          discount: Number(order.discount),
          total: Number(order.total),
          trackingNumber: order.trackingNumber,
          notes: order.notes,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
          paidAt: order.paidAt?.toISOString() || null,
          shippedAt: order.shippedAt?.toISOString() || null,
          deliveredAt: order.deliveredAt?.toISOString() || null,
          cancelledAt: order.cancelledAt?.toISOString() || null,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          warehouse: order.warehouse ? {
            id: order.warehouse.id,
            name: order.warehouse.name,
            address: order.warehouse.address,
          } : null,
          supplier: order.supplier ? {
            id: order.supplier.id,
            name: order.supplier.name,
          } : null,
          items: order.items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: Number(item.price),
            total: Number(item.total),
            product: {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              image: item.product.images[0]?.url || null,
            },
          })),
        },
      });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isMain: true }, take: 1 },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: Number(order.total),
        createdAt: order.createdAt.toISOString(),
        itemsCount: order.items.length,
      })),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении заказов' },
      { status: 500 }
    );
  }
}

function calculateFinalPrice(product: {
  price: unknown;
  discountValue: unknown;
  discountType: string | null;
}, supplierPrice?: unknown): number {
  if (supplierPrice !== undefined && supplierPrice !== null) {
    return Number(supplierPrice);
  }

  const price = Number(product.price);
  const discountValue = Number(product.discountValue || 0);

  if (discountValue > 0) {
    if (product.discountType === 'PERCENT') {
      return price * (1 - discountValue / 100);
    } else {
      return Math.max(0, price - discountValue);
    }
  }

  return price;
}

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
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Некорректные данные' },
        { status: 400 }
      );
    }

    const { name, email, phone, warehouseId: selectedWarehouseId, supplierId: selectedSupplierId, notes } = validation.data;

    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                warehouseStocks: true,
              },
            },
            supplier: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Корзина пуста' },
        { status: 400 }
      );
    }

    for (const item of cart.items) {
      if (!item.product.isActive || item.product.isDraft) {
        return NextResponse.json(
          { error: `Товар "${item.product.name}" недоступен для заказа` },
          { status: 400 }
        );
      }

      const warehouseId = item.warehouseId;
      if (warehouseId && !item.supplierId) {
        const stock = item.product.warehouseStocks.find(s => s.warehouseId === warehouseId);
        if (!stock || stock.quantity < item.quantity) {
          return NextResponse.json(
            { error: `Недостаточное количество товара "${item.product.name}" на складе` },
            { status: 400 }
          );
        }
      } else if (!warehouseId && !item.supplierId) {
        if (item.product.stock <= 0) {
          return NextResponse.json(
            { error: `Товар "${item.product.name}" отсутствует в наличии` },
            { status: 400 }
          );
        }
        if (item.product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Недостаточное количество товара "${item.product.name}"` },
            { status: 400 }
          );
        }
      }
    }

    const itemsByWarehouse = new Map<string, typeof cart.items>();
    
    for (const item of cart.items) {
      const effectiveWarehouseId = item.warehouseId || selectedWarehouseId;
      const effectiveSupplierId = item.supplierId || (selectedSupplierId && !item.warehouseId ? selectedSupplierId : null);
      const key = `${effectiveWarehouseId || 'no-warehouse'}-${effectiveSupplierId || 'no-supplier'}`;
      if (!itemsByWarehouse.has(key)) {
        itemsByWarehouse.set(key, []);
      }
      itemsByWarehouse.get(key)!.push(item);
    }

    const createdOrders: { id: string; orderNumber: string; total: number }[] = [];

    await prisma.$transaction(async (tx) => {
      for (const [groupKey, groupItems] of itemsByWarehouse) {
        const firstItem = groupItems[0];
        const isSupplierOrder = !!firstItem.supplierId || (selectedSupplierId && !firstItem.warehouseId);
        const warehouseId = firstItem.warehouseId || selectedWarehouseId;
        const supplierId = firstItem.supplierId || (selectedSupplierId && !firstItem.warehouseId ? selectedSupplierId : null);
        
        let subtotal = 0;
        for (const item of groupItems) {
          const finalPrice = calculateFinalPrice(item.product, item.supplier?.price);
          subtotal += finalPrice * item.quantity;
        }

        const orderSource = isSupplierOrder ? 'SUPPLIER' : 'WAREHOUSE';
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            userId: session.userId,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            warehouseId: warehouseId || null,
            supplierId: supplierId,
            source: orderSource,
            paymentMethod: 'CASH',
            deliveryMethod: 'PICKUP',
            notes: notes || null,
            deliveryCost: 0,
            subtotal,
            total: subtotal,
            items: {
              create: groupItems.map((item) => {
                const finalPrice = calculateFinalPrice(item.product, item.supplier?.price);
                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  price: finalPrice,
                  total: finalPrice * item.quantity,
                };
              }),
            },
          },
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        });

        for (const item of groupItems) {
          if (item.warehouseId && !item.supplierId) {
            await tx.warehouseStock.update({
              where: {
                warehouseId_productId: {
                  warehouseId: item.warehouseId,
                  productId: item.productId,
                },
              },
              data: {
                quantity: { decrement: item.quantity },
              },
            });
          }

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              salesCount: { increment: item.quantity },
            },
          });
        }

        await tx.activityLog.create({
          data: {
            userId: session.userId,
            action: 'ORDER_CREATED',
            entity: 'Order',
            entityId: newOrder.id,
            details: { orderNumber, total: subtotal, itemsCount: groupItems.length },
          },
        });

        createdOrders.push({
          id: newOrder.id,
          orderNumber: newOrder.orderNumber,
          total: Number(newOrder.total),
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    });

    if (createdOrders.length === 1) {
      return NextResponse.json({
        success: true,
        order: createdOrders[0],
      });
    }

    return NextResponse.json({
      success: true,
      orders: createdOrders,
      message: `Создано ${createdOrders.length} заказов`,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании заказа' },
      { status: 500 }
    );
  }
}