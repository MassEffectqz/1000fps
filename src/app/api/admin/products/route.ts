import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createProductSchema } from '@/lib/validations/product';
import { revalidatePath } from 'next/cache';
import { revalidateTag } from 'next/cache';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { z } from 'zod';

// GET /api/admin/products - получить все товары
// (защищено middleware — только ADMIN/MANAGER)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');
    const slug = searchParams.get('slug');

    // Если запрошена проверка slug
    if (slug) {
      const existing = await prisma.product.findFirst({
        where: { slug },
        select: { id: true },
      });
      return NextResponse.json(!!existing);
    }

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (category) {
      where.categoryId = category;
    }

    if (brand) {
      where.brandId = brand;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          images: {
            orderBy: { order: 'asc' },
          },
          variants: true,
          tags: {
            include: { tag: true },
          },
          warehouseStocks: {
            include: {
              warehouse: true,
            },
          },
          specs: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - создать товар
// (защищено middleware — только ADMIN/MANAGER)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Фильтруем пустые варианты перед валидацией
    const filteredBody = {
      ...body,
      variants: body.variants?.filter((v: { name?: string }) => v.name && v.name.trim() !== ''),
      images: body.images?.filter((img: { url?: string }) =>
        img.url &&
        !img.url.startsWith('blob:') &&
        img.url !== '' &&
        (img.url.startsWith('/uploads/') || img.url.startsWith('http://') || img.url.startsWith('https://'))
      ) ?? [],
    };
    // Валидация входных данных
    const validatedData = createProductSchema.parse(filteredBody);

    // Проверяем уникальность SKU
    const existingSku = await prisma.product.findUnique({
      where: { sku: validatedData.sku },
    });

    if (existingSku) {
      return NextResponse.json(
        { error: 'SKU уже существует', sku: validatedData.sku },
        { status: 409 }
      );
    }

    const {
      images,
      specifications,
      variants,
      tags,
      warehouseStocks,
      categoryId,
      price,
      oldPrice,
      discountValue,
      weight,
      length,
      width,
      height,
      ...productData
    } = validatedData;

    // Создаем товар в транзакции
    const product = await prisma.$transaction(async (tx) => {
      // Нормализуем brandId - пустая строка = null
      const brandId = validatedData.brandId || null;
      
      // Создаем основной товар
      const createData: Prisma.ProductUncheckedCreateInput = {
        ...productData,
        price: new Decimal(String(price)),
        oldPrice: oldPrice ? new Decimal(String(oldPrice)) : null,
        discountValue: new Decimal(String(discountValue)),
        weight: weight ? new Decimal(String(weight)) : null,
        length: length ? new Decimal(String(length)) : null,
        width: width ? new Decimal(String(width)) : null,
        height: height ? new Decimal(String(height)) : null,
        categoryId,
        brandId: brandId || undefined,
      };
      
      const newProduct = await tx.product.create({
        data: createData,
      });

      // Создаем изображения
      if (images && images.length > 0) {
        // Фильтруем blob: URL и несуществующие /images/
        const validImages = images.filter(img =>
          img.url &&
          !img.url.startsWith('blob:') &&
          (img.url.startsWith('/uploads/') || img.url.startsWith('http://') || img.url.startsWith('https://'))
        );

        if (validImages.length > 0) {
          await tx.productImage.createMany({
            data: validImages.map((img, index) => ({
              productId: newProduct.id,
              url: img.url,
              alt: img.alt,
              order: img.order ?? index,
              isMain: img.isMain ?? false,
            })),
          });
        }
      }

      // Создаем характеристики
      if (specifications && specifications.length > 0) {
        await tx.productSpecification.createMany({
          data: specifications.map((spec, index) => ({
            productId: newProduct.id,
            name: spec.name,
            value: spec.value,
            unit: spec.unit,
            isVariant: spec.isVariant ?? false,
            order: spec.order ?? index,
          })),
        });
      }

      // Создаем варианты
      if (variants && variants.length > 0) {
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

      // Создаем теги
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          // Проверяем существует ли тег
          let existingTag = await tx.tag.findUnique({
            where: { id: tag.tagId },
          });

          if (!existingTag && tag.name) {
            // Создаем новый тег
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
                productId: newProduct.id,
                tagId: existingTag.id,
              },
            });

            // Увеличиваем счетчик использования тега
            await tx.tag.update({
              where: { id: existingTag.id },
              data: { usageCount: { increment: 1 } },
            });
          }
        }
      }

      // Создаем складские остатки
      if (warehouseStocks && warehouseStocks.length > 0) {
        await tx.warehouseStock.createMany({
          data: warehouseStocks.map((ws) => ({
            productId: newProduct.id,
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
    revalidateTag('products');
    revalidateTag('catalog');

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products - удалить все товары
export async function DELETE() {
  try {
    const result = await prisma.product.deleteMany({});
    
    return NextResponse.json({ 
      success: true, 
      deletedCount: result.count 
    });
  } catch (error) {
    console.error('Delete all products error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
