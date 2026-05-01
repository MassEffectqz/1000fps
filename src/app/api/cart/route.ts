import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-helpers';
import { addToCartSchema } from '@/lib/validations/cart';

/**
 * GET /api/cart - получить корзину текущего пользователя
 */
export async function GET() {
  try {
    const session = await getSession();
    
    // Для авторизованных пользователей
    if (session?.userId) {
      const cart = await prisma.cart.findUnique({
        where: { userId: session.userId },
        include: {
          items: {
            where: {
              product: {
                isActive: true,
                isDraft: false,
              },
            },
            include: {
              product: {
                include: {
                  images: {
                    where: { isMain: true },
                    take: 1,
                    orderBy: { order: 'asc' },
                  },
                  category: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                  brand: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
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
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!cart) {
        return NextResponse.json({
          cart: {
            id: null,
            items: [],
            totalItems: 0,
            totalPrice: 0,
          },
        });
      }

      // Форматируем элементы корзины
      const formattedItems = cart.items.map((item) => {
        const product = item.product;
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

        const mainImage = product.images.find(img => img.isMain) || product.images[0];
        
        // Находим наличие на выбранном складе или берем первое доступное
        const warehouseStock = item.warehouseId 
          ? product.warehouseStocks.find(ws => ws.warehouseId === item.warehouseId)
          : product.warehouseStocks[0];

        return {
          id: item.id,
          productId: product.id,
          quantity: item.quantity,
          warehouseId: item.warehouseId,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            price: Math.round(price),
            finalPrice: Math.round(finalPrice),
            image: mainImage?.url || null,
            category: product.category,
            brand: product.brand,
            inStock: (warehouseStock?.quantity || 0) > 0,
            availableQuantity: warehouseStock?.quantity || 0,
            warehouse: warehouseStock?.warehouse || null,
          },
        };
      });

      const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cart.items.reduce((sum, item) => {
        const price = Number(item.product.price);
        const discountValue = Number(item.product.discountValue);
        let finalPrice = price;

        if (discountValue > 0) {
          if (item.product.discountType === 'PERCENT') {
            finalPrice = price * (1 - discountValue / 100);
          } else {
            finalPrice = Math.max(0, price - discountValue);
          }
        }

        return sum + finalPrice * item.quantity;
      }, 0);

      return NextResponse.json({
        cart: {
          id: cart.id,
          items: formattedItems,
          totalItems,
          totalPrice: Math.round(totalPrice),
        },
      });
    }

    // Для неавторизованных пользователей (гостевая корзина)
    // Возвращаем пустую корзину - данные будут в localStorage на клиенте
    return NextResponse.json({
      cart: {
        id: null,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart/items - добавить товар в корзину
 */
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
    const validation = addToCartSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Некорректные данные' },
        { status: 400 }
      );
    }

    const { productId, quantity, warehouseId } = validation.data;

    // Нормализуем warehouseId - убираем пустую строку
    const normalizedWarehouseId = warehouseId && warehouseId.trim() ? warehouseId.trim() : undefined;

    // Проверяем существование товара
    // Сначала ищем по ID, затем по ID поставщика (productSupplier), затем по supplierId (артикул WB)
    let product = await prisma.product.findUnique({
      where: { id: productId, isActive: true, isDraft: false },
      include: {
        images: {
          where: { isMain: true },
          take: 1,
        },
      },
    });

    // Если товар не найден по ID - пробуем найти по ID поставщика (productSupplier.id)
    if (!product) {
      const supplier = await prisma.productSupplier.findUnique({
        where: { id: productId },
        select: { productId: true },
      });
      if (supplier?.productId) {
        product = await prisma.product.findUnique({
          where: { id: supplier.productId, isActive: true, isDraft: false },
          include: {
            images: {
              where: { isMain: true },
              take: 1,
            },
          },
        });
      }
    }

    // Если товар не найден - пробуем найти по supplierId (артикулу WB)
    if (!product) {
      const supplierProduct = await prisma.productSupplier.findFirst({
        where: { supplierId: productId },
        select: { productId: true },
      });
      if (supplierProduct?.productId) {
        product = await prisma.product.findUnique({
          where: { id: supplierProduct.productId, isActive: true, isDraft: false },
          include: {
            images: {
              where: { isMain: true },
              take: 1,
            },
          },
        });
      }
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    // Проверяем существование склада, если указан warehouseId
    if (normalizedWarehouseId) {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: normalizedWarehouseId },
      });

      if (!warehouse) {
        return NextResponse.json(
          { error: 'Склад не найден' },
          { status: 400 }
        );
      }

      const warehouseStock = await prisma.warehouseStock.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: normalizedWarehouseId,
            productId: product.id,
          },
        },
      });

      if (!warehouseStock || warehouseStock.quantity < quantity) {
        return NextResponse.json(
          { error: 'Недостаточно товара на выбранном складе' },
          { status: 400 }
        );
      }
    }

    // Транзакция для избежания race condition
    let cartItem;
    
    try {
      cartItem = await prisma.$transaction(async (tx) => {
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

        // Проверяем, есть ли уже такой товар в корзине с таким же складом
        // Ищем по точному совпадению productId и warehouseId
        let existingItem: typeof cartItem | null = null;
        
        try {
          if (normalizedWarehouseId) {
            // Ищем товар с конкретным складом
            existingItem = await tx.cartItem.findFirst({
              where: {
                cartId: cart.id,
                productId: product.id,
                warehouseId: normalizedWarehouseId,
              },
            });
          } else {
            // Ищем товар без склада (поставщик)
            existingItem = await tx.cartItem.findFirst({
              where: {
                cartId: cart.id,
                productId: product.id,
                warehouseId: null,
              },
            });
          }
        } catch (e) {
          // Если ошибка - продолжаем без поиска
          existingItem = null;
        }

        if (existingItem) {
          // Обновляем количество
          const newQuantity = existingItem.quantity + quantity;

          // Проверяем наличие на складе при обновлении
          const stockWarehouseId = normalizedWarehouseId || existingItem.warehouseId;
          if (stockWarehouseId) {
            const warehouseStock = await tx.warehouseStock.findUnique({
              where: {
                warehouseId_productId: {
                  warehouseId: stockWarehouseId,
                  productId: product.id,
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
              warehouseId: normalizedWarehouseId || existingItem.warehouseId,
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
        } else {
          // Создаем новый элемент
          try {
            return await tx.cartItem.create({
              data: {
                cartId: cart.id,
                userId: session.userId,
                productId: product.id,
                quantity,
                warehouseId: normalizedWarehouseId || null,
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
          } catch (createError: unknown) {
            // Если ошибка уникальности - ищем существующий товар с таким же productId и обновляем
            const err = createError as { code?: string; message?: string; meta?: { target?: string[] } };
            if (err.code === 'P2002') {
              // Находим первый товар с таким productId в корзине и обновляем
              const existingItem = await tx.cartItem.findFirst({
                where: {
                  cartId: cart.id,
                  productId: product.id,
                },
              });
              
              if (existingItem) {
                return await tx.cartItem.update({
                  where: { id: existingItem.id },
                  data: { 
                    quantity: existingItem.quantity + quantity,
                    warehouseId: normalizedWarehouseId || existingItem.warehouseId,
                  },
                  include: {
                    product: {
                      include: {
                        images: { where: { isMain: true }, take: 1 },
                      },
                    },
                  },
                });
              }
            }
            throw createError;
          }
        }
      });
    } catch (txError) {
      console.error('Transaction error in add to cart:', txError);
      const errorMessage = txError instanceof Error ? txError.message : '';
      if (errorMessage.includes('склада')) {
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Ошибка при добавлении в корзину: ' + errorMessage },
        { status: 500 }
      );
    }

    // Вычисляем цену товара
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

    return NextResponse.json({
      success: true,
      item: {
        id: cartItem.id,
        productId: cartItem.product.id,
        quantity: cartItem.quantity,
        warehouseId: cartItem.warehouseId,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: Math.round(price),
          finalPrice: Math.round(finalPrice),
          image: mainImage?.url || null,
        },
      },
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart - очистить корзину
 */
export async function DELETE() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    // Удаляем все элементы корзины
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId: session.userId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Корзина очищена',
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
