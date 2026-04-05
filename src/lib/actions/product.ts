'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createProductSchema, updateProductSchema } from '@/lib/validations/product';
import { Decimal } from '@prisma/client/runtime/library';
import { requireAdmin } from '@/lib/session';

export interface ProductFormData {
  // Основные поля
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  brandId?: string | null;
  description?: string | null;
  fullDescription?: string | null;
  
  // Цена и скидки
  price: number;
  oldPrice?: number | null;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  
  // Габариты и вес
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  
  // Гарантия
  warrantyPeriod: number;
  warrantyType: 'MANUFACTURER' | 'SELLER';
  
  // Статусы
  isActive: boolean;
  isDraft: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isHit: boolean;
  
  // SEO
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  
  // Связанные данные
  images?: Array<{
    url: string;
    alt?: string;
    order: number;
    isMain: boolean;
  }>;
  
  specifications?: Array<{
    name: string;
    value: string;
    unit?: string;
    isVariant: boolean;
    order: number;
  }>;
  
  variants?: Array<{
    name: string;
    value: string;
    priceMod: number;
    stock: number;
    sku?: string;
    order: number;
  }>;
  
  tags?: Array<{
    tagId: string;
    name?: string;
    slug?: string;
    color?: string;
  }>;
  
  warehouseStocks?: Array<{
    warehouseId: string;
    quantity: number;
    reserved: number;
  }>;
}

export async function createProduct(data: ProductFormData) {
  try {
    // Проверка прав администратора
    await requireAdmin();

    // Валидация
    const validatedData = createProductSchema.parse(data);

    const {
      images = [],
      specifications = [],
      variants = [],
      tags = [],
      warehouseStocks = [],
      ...productData
    } = validatedData;

    // Создаем товар в транзакции
    const product = await prisma.$transaction(async (tx) => {
      // Создаем основной товар
      const newProduct = await tx.product.create({
        data: {
          ...productData,
          price: new Decimal(String(productData.price)),
          oldPrice: productData.oldPrice ? new Decimal(String(productData.oldPrice)) : null,
          discountValue: new Decimal(String(productData.discountValue)),
          weight: productData.weight ? new Decimal(String(productData.weight)) : null,
          length: productData.length ? new Decimal(String(productData.length)) : null,
          width: productData.width ? new Decimal(String(productData.width)) : null,
          height: productData.height ? new Decimal(String(productData.height)) : null,
        },
      });

      // Создаем изображения
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img, index) => ({
            productId: newProduct.id,
            url: img.url,
            alt: img.alt,
            order: img.order ?? index,
            isMain: img.isMain ?? false,
          })),
        });
      }

      // Создаем характеристики
      if (specifications.length > 0) {
        await tx.productSpecification.createMany({
          data: specifications.map((spec, index) => ({
            productId: newProduct.id,
            name: spec.name,
            value: spec.value,
            unit: spec.unit,
            isVariant: spec.isVariant,
            order: spec.order ?? index,
          })),
        });
      }

      // Создаем варианты
      if (variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((variant, index) => ({
            productId: newProduct.id,
            name: variant.name,
            value: variant.value,
            priceMod: new Decimal(String(variant.priceMod)),
            stock: variant.stock,
            sku: variant.sku,
            order: variant.order ?? index,
          })),
        });
      }

      // Создаем теги - атомарная операция
      if (tags.length > 0) {
        // Сначала собираем все данные для операций
        const tagOperations = await Promise.all(
          tags.map(async (tag) => {
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

            return existingTag;
          })
        );

        // Создаем связи ProductTag и обновляем usageCount атомарно
        const productTagsData = [];
        const tagUpdates = [];

        for (const existingTag of tagOperations) {
          if (existingTag) {
            productTagsData.push({
              productId: newProduct.id,
              tagId: existingTag.id,
            });
            tagUpdates.push(
              tx.tag.update({
                where: { id: existingTag.id },
                data: { usageCount: { increment: 1 } },
              })
            );
          }
        }

        // Создаем все связи
        if (productTagsData.length > 0) {
          await tx.productTag.createMany({
            data: productTagsData,
          });
        }

        // Обновляем все счетчики атомарно
        if (tagUpdates.length > 0) {
          await Promise.all(tagUpdates);
        }
      }

      // Создаем складские остатки
      if (warehouseStocks.length > 0) {
        await tx.warehouseStock.createMany({
          data: warehouseStocks.map((ws) => ({
            productId: newProduct.id,
            warehouseId: ws.warehouseId,
            quantity: ws.quantity,
            reserved: ws.reserved,
          })),
        });

        const totalStock = warehouseStocks.reduce(
          (sum, ws) => sum + ws.quantity,
          0
        );
        await tx.product.update({
          where: { id: newProduct.id },
          data: { stock: totalStock },
        });
      }

      return newProduct;
    });

    // Реинвалидация кэша
    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidatePath('/catalog');
    revalidatePath('/');

    return { success: true, data: product };
  } catch (error) {
    console.error('Error creating product:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create product' 
    };
  }
}

export async function updateProduct(id: string, data: Partial<ProductFormData>) {
  try {
    // Проверка прав администратора
    await requireAdmin();

    // Валидация
    const validatedData = updateProductSchema.parse(data);

    const {
      images,
      specifications,
      variants,
      tags,
      warehouseStocks,
      ...productData
    } = validatedData;

    // Проверяем существование товара
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return { success: false, error: 'Product not found' };
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
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          ...filteredProductData,
          price: productData.price ? new Decimal(String(productData.price)) : undefined,
          oldPrice: productData.oldPrice !== undefined
            ? (productData.oldPrice ? new Decimal(String(productData.oldPrice)) : null)
            : undefined,
          discountValue: productData.discountValue !== undefined
            ? new Decimal(String(productData.discountValue))
            : undefined,
          weight: productData.weight !== undefined
            ? (productData.weight ? new Decimal(String(productData.weight)) : null)
            : undefined,
          length: productData.length !== undefined
            ? (productData.length ? new Decimal(String(productData.length)) : null)
            : undefined,
          width: productData.width !== undefined
            ? (productData.width ? new Decimal(String(productData.width)) : null)
            : undefined,
          height: productData.height !== undefined
            ? (productData.height ? new Decimal(String(productData.height)) : null)
            : undefined,
        },
      });

      // Обновляем изображения
      if (images !== undefined && images !== null) {
        await tx.productImage.deleteMany({
          where: { productId: id },
        });

        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img, index) => ({
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
              isVariant: spec.isVariant,
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

      // Обновляем теги - атомарная операция
      if (tags !== undefined && tags !== null) {
        // Сначала читаем старые связи для обновления счетчиков
        const oldProductTags = await tx.productTag.findMany({
          where: { productId: id },
        });

        // Уменьшаем счетчики использования старых тегов
        const oldTagUpdates = oldProductTags.map(pt =>
          tx.tag.update({
            where: { id: pt.tagId },
            data: { usageCount: { decrement: 1 } },
          })
        );

        if (oldTagUpdates.length > 0) {
          await Promise.all(oldTagUpdates);
        }

        // Удаляем все текущие связи
        await tx.productTag.deleteMany({
          where: { productId: id },
        });

        // Собираем данные для новых тегов атомарно
        const tagOperations = await Promise.all(
          tags.map(async (tag) => {
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

            return existingTag;
          })
        );

        // Создаем новые связи и обновляем счетчики
        const productTagsData = [];
        const tagUpdates = [];

        for (const existingTag of tagOperations) {
          if (existingTag) {
            productTagsData.push({
              productId: id,
              tagId: existingTag.id,
            });
            tagUpdates.push(
              tx.tag.update({
                where: { id: existingTag.id },
                data: { usageCount: { increment: 1 } },
              })
            );
          }
        }

        // Создаем все связи
        if (productTagsData.length > 0) {
          await tx.productTag.createMany({
            data: productTagsData,
          });
        }

        // Обновляем все счетчики атомарно
        if (tagUpdates.length > 0) {
          await Promise.all(tagUpdates);
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
              reserved: ws.reserved,
            })),
          });

          const totalStock = warehouseStocks.reduce(
            (sum, ws) => sum + ws.quantity,
            0
          );
          await tx.product.update({
            where: { id },
            data: { stock: totalStock },
          });
        } else {
          await tx.product.update({
            where: { id },
            data: { stock: 0 },
          });
        }
      }

      return updatedProduct;
    });

    // Реинвалидация кэша
    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidatePath(`/admin/products/${id}`);
    revalidatePath('/catalog');
    revalidatePath('/');

    return { success: true, data: product };
  } catch (error) {
    console.error('Error updating product:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update product' 
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    // Проверка прав администратора
    await requireAdmin();

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidatePath('/catalog');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete product' 
    };
  }
}

export async function getProductById(id: string) {
  try {
    // Проверка прав администратора
    await requireAdmin();

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
            warehouse: true,
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch product' 
    };
  }
}
