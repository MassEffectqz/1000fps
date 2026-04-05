import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateProductSchema } from '@/lib/validations/product';
import { revalidatePath } from 'next/cache';
import { revalidateTag } from 'next/cache';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { z } from 'zod';
import { rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET /api/admin/products/[id] - получить товар по ID
// (защищено middleware — только ADMIN/MANAGER)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { order: 'asc' },
        },
        variants: {
          orderBy: { order: 'asc' },
        },
        tags: {
          include: { tag: true },
        },
        specs: {
          orderBy: { order: 'asc' },
        },
        warehouseStocks: {
          include: {
            warehouse: {
              select: {
                id: true,
                name: true,
                city: true,
                isActive: true,
              }
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Возвращаем parseSources из Product.parserSources (единый источник)
    // Преобразуем [{url, priority, isActive}] -> [url1, url2, ...] для обратной совместимости
    const parserSources = product.parserSources && Array.isArray(product.parserSources)
      ? (product.parserSources as Array<{ url?: string }>).map(s => s.url).filter(Boolean)
      : [];

    console.log('[API GET /products/:id] Product loaded:', {
      id: product.id,
      name: product.name,
      parserSourcesCount: parserSources.length,
      parserSources: parserSources,
    });

    return NextResponse.json({
      ...product,
      parseSources: parserSources,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - обновить товар
// (защищено middleware — только ADMIN/MANAGER)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    // Валидация входных данных
    const validatedData = updateProductSchema.parse(body);

    const {
      images,
      specifications,
      variants,
      tags,
      warehouseStocks,
      categoryId,
      brandId,
      price,
      oldPrice,
      discountValue,
      weight,
      length,
      width,
      height,
      parseSources,
      ...productData
    } = validatedData;

    // Проверяем существование товара
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Проверяем уникальность SKU (исключая текущий товар)
    if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku: validatedData.sku,
          id: { not: id },
        },
      });

      if (existingSku) {
        return NextResponse.json(
          { error: 'SKU уже существует', sku: validatedData.sku },
          { status: 409 }
        );
      }
    }

    // Обновляем товар в транзакции
    const product = await prisma.$transaction(async (tx) => {
      // Фильтруем null/undefined из productData
      const filteredProductData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(productData)) {
        if (value !== undefined && value !== null) {
          filteredProductData[key] = value;
        }
      }

      // Обновляем основной товар
      const updateData: Prisma.ProductUpdateInput = {
        ...filteredProductData,
        price: price !== undefined && price !== null ? new Decimal(String(price)) : undefined,
        oldPrice: oldPrice !== undefined
          ? (oldPrice ? new Decimal(String(oldPrice)) : null)
          : undefined,
        discountValue: discountValue !== undefined && discountValue !== null
          ? new Decimal(String(discountValue))
          : undefined,
        weight: weight !== undefined && weight !== null
          ? (weight ? new Decimal(String(weight)) : null)
          : undefined,
        length: length !== undefined && length !== null
          ? (length ? new Decimal(String(length)) : null)
          : undefined,
        width: width !== undefined && width !== null
          ? (width ? new Decimal(String(width)) : null)
          : undefined,
        height: height !== undefined && height !== null
          ? (height ? new Decimal(String(height)) : null)
          : undefined,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        brand: brandId ? { connect: { id: brandId } } : undefined,
      };
      
      const updatedProduct = await tx.product.update({
        where: { id },
        data: updateData,
      });

      // Обновляем изображения
      if (images !== undefined && images !== null) {
        // Удаляем все текущие изображения
        await tx.productImage.deleteMany({
          where: { productId: id },
        });

        // Создаем новые (фильтруем blob: URL и несуществующие /images/)
        const validImages = (images || []).filter(img =>
          img.url &&
          !img.url.startsWith('blob:') &&
          (img.url.startsWith('/uploads/') || img.url.startsWith('http://') || img.url.startsWith('https://'))
        );

        if (validImages.length > 0) {
          await tx.productImage.createMany({
            data: validImages.map((img, index) => ({
              productId: id,
              url: img.url,
              alt: img.alt,
              order: img.order ?? index,
              isMain: img.isMain ?? false,
            })),
          });
        }
      }

      // Обновляем характеристики
      if (specifications !== undefined && specifications !== null) {
        await tx.productSpecification.deleteMany({
          where: { productId: id },
        });

        if (specifications.length > 0) {
          await tx.productSpecification.createMany({
            data: specifications.map((spec, index) => ({
              productId: id,
              name: spec.name,
              value: spec.value,
              unit: spec.unit,
              isVariant: spec.isVariant ?? false,
              order: spec.order ?? index,
            })),
          });
        }
      }

      // Обновляем варианты
      if (variants !== undefined && variants !== null) {
        await tx.productVariant.deleteMany({
          where: { productId: id },
        });

        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((variant, index) => ({
              productId: id,
              name: variant.name,
              value: variant.value,
              priceMod: new Decimal(String(variant.priceMod)),
              stock: variant.stock,
              sku: variant.sku,
              order: variant.order ?? index,
            })),
          });
        }
      }

      // Обновляем теги
      if (tags !== undefined && tags !== null) {
        // Сначала читаем старые связи для обновления счетчиков
        const oldProductTags = await tx.productTag.findMany({
          where: { productId: id },
        });

        // Удаляем все текущие связи
        await tx.productTag.deleteMany({
          where: { productId: id },
        });

        // Уменьшаем счетчики использования старых тегов
        for (const pt of oldProductTags) {
          await tx.tag.update({
            where: { id: pt.tagId },
            data: { usageCount: { decrement: 1 } },
          });
        }

        // Создаем новые связи
        for (const tag of tags) {
          let existingTag = await tx.tag.findUnique({
            where: { id: tag.tagId },
          });

          if (!existingTag && tag.name) {
            existingTag = await tx.tag.create({
              data: {
                name: tag.name,
                slug: tag.slug || tag.name.toLowerCase().replace(/\s+/g, '-'),
                color: tag.color,
              },
            });
          }

          if (existingTag) {
            await tx.productTag.create({
              data: {
                productId: id,
                tagId: existingTag.id,
              },
            });

            await tx.tag.update({
              where: { id: existingTag.id },
              data: { usageCount: { increment: 1 } },
            });
          }
        }
      }

      // Обновляем складские остатки
      if (warehouseStocks !== undefined && warehouseStocks !== null) {
        await tx.warehouseStock.deleteMany({
          where: { productId: id },
        });

        if (warehouseStocks.length > 0) {
          await tx.warehouseStock.createMany({
            data: warehouseStocks.map((ws) => ({
              productId: id,
              warehouseId: ws.warehouseId,
              quantity: ws.quantity,
              reserved: ws.reserved ?? 0,
            })),
          });

          // Обновляем общий остаток товара
          const totalStock = warehouseStocks.reduce(
            (sum, ws) => sum + ws.quantity,
            0
          );
          await tx.product.update({
            where: { id },
            data: { stock: totalStock },
          });
        } else {
          // Если складов нет, обнуляем остаток
          await tx.product.update({
            where: { id },
            data: { stock: 0 },
          });
        }
      }

      return updatedProduct;
    });

    // Обновляем parseSources если они были переданы
    console.log('[API PUT /products/:id] parseSources received:', parseSources);
    
    if (parseSources && parseSources.length > 0) {
      // Формируем структуру parserSources для Product: [{url, priority, isActive}]
      const parserSourcesForProduct = parseSources.map((url: string, index: number) => ({
        url,
        priority: index,
        isActive: true,
      }));

      console.log('[API PUT /products/:id] Saving to Product.parserSources:', parserSourcesForProduct);

      // Обновляем Product.parserSources (единое хранилище источников)
      await prisma.product.update({
        where: { id },
        data: { parserSources: parserSourcesForProduct },
      });

      console.log('[API PUT /products/:id] Product.parserSources saved successfully');

      // Также обновляем ParseJob.sources для обратной совместимости
      const existingJob = await prisma.parseJob.findFirst({
        where: { productId: id },
        orderBy: { createdAt: 'desc' },
      });

      if (existingJob) {
        await prisma.parseJob.update({
          where: { id: existingJob.id },
          data: { sources: parseSources },
        });
        console.log('[API PUT /products/:id] ParseJob.sources updated');
      } else {
        await prisma.parseJob.create({
          data: {
            productId: id,
            sources: parseSources,
            status: 'PENDING',
          },
        });
        console.log('[API PUT /products/:id] New ParseJob created');
      }
    } else {
      console.log('[API PUT /products/:id] No parseSources to save');
    }

    // Реинвалидация кэша
    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidatePath(`/admin/products/${id}`);
    revalidatePath('/catalog');
    revalidatePath('/');
    revalidateTag('products');
    revalidateTag('catalog');

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - удалить товар
// (защищено middleware — только ADMIN/MANAGER)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Проверяем существование товара
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Удаляем товар (каскадно удалит все связанные записи)
    await prisma.product.delete({
      where: { id },
    });

    // Удаляем папку с изображениями товара
    const productImageDir = join(process.cwd(), 'public', 'uploads', 'products', id);
    if (existsSync(productImageDir)) {
      await rm(productImageDir, { recursive: true });
    }

    // Реинвалидация кэша
    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidatePath('/catalog');
    revalidatePath('/');
    revalidateTag('products');
    revalidateTag('catalog');

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
