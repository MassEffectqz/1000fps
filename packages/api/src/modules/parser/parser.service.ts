import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProductsService } from '../products/products.service';
import { BrandsService } from '../brands/brands.service';
import { CategoriesService } from '../categories/categories.service';
import { ImportProductDto } from './dto/import-product.dto';
import { ParseRequestDto } from './dto/parse-request.dto';
import { ProductSource, Prisma } from '@prisma/client';

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);

  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
    private brandsService: BrandsService,
    private categoriesService: CategoriesService
  ) {}

  /**
   * Запуск парсинга
   */
  async parse(parseRequestDto: ParseRequestDto) {
    const { source, url, article } = parseRequestDto;

    this.logger.log(`Запуск парсинга: ${source} - ${url || article}`);

    // Логирование начала парсинга
    await this.log('parser', 'parse_started', `Запуск парсинга: ${source}`, {
      source,
      url,
      article,
    });

    // Здесь будет вызов внешнего парсера
    // Для сейчас - заглушка
    return {
      status: 'success',
      message: 'Парсинг запущен',
      data: { source, url, article },
    };
  }

  /**
   * Импорт товара из парсера
   */
  async importProduct(importProductDto: ImportProductDto) {
    const {
      article,
      name,
      brand: brandName,
      price,
      originalPrice,
      category: categoryName,
      description,
      images,
      specifications,
      url,
      source = 'WB',
    } = importProductDto;

    this.logger.log(`Импорт товара: ${article} - ${name}`);

    try {
      // 1. Найти или создать бренд
      let brand = await this.prisma.brand.findUnique({
        where: { slug: this.toSlug(brandName) },
      });

      if (!brand) {
        brand = await this.prisma.brand.create({
          data: {
            slug: this.toSlug(brandName),
            name: brandName,
          },
        });
      }

      // 2. Найти или создать категорию
      let category = await this.prisma.category.findUnique({
        where: { slug: this.toSlug(categoryName) },
      });

      if (!category) {
        category = await this.prisma.category.create({
          data: {
            slug: this.toSlug(categoryName),
            name: categoryName,
          },
        });
      }

      // 3. Проверить существующий товар по SKU (article)
      const existingProduct = await this.prisma.product.findUnique({
        where: { sku: article },
      });

      if (existingProduct) {
        // Обновить цену и наличие
        const updatedProduct = await this.prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            price,
            oldPrice: originalPrice || null,
            stock: { increment: 1 },
          },
        });

        // Сохранить историю цен
        await this.prisma.priceHistory.create({
          data: {
            productId: existingProduct.id,
            price,
            oldPrice: originalPrice || null,
            source: source.toLowerCase(),
          },
        });

        this.logger.log(`Товар обновлён: ${article}`);

        await this.log('parser', 'product_updated', `Товар обновлён: ${article}`, {
          productId: existingProduct.id,
          price,
        });

        return {
          status: 'updated',
          product: updatedProduct,
        };
      }

      // 4. Создать новый товар
      const product = await this.prisma.product.create({
        data: {
          slug: this.toSlug(name),
          sku: article,
          name,
          description: description || null,
          categoryId: category.id,
          brandId: brand.id,
          price,
          oldPrice: originalPrice || null,
          stock: 1,
          available: true,
          mainImageUrl: images?.[0] || null,
          specifications: specifications ? (specifications as Prisma.InputJsonValue) : {},
          source: this.mapSource(source),
          externalId: article,
          externalUrl: url,
        },
        include: {
          category: true,
          brand: true,
        },
      });

      // 5. Создать изображения
      if (images && images.length > 0) {
        const imageRecords = images.map((url, index) => ({
          productId: product.id,
          url,
          position: index,
        }));

        await this.prisma.productImage.createMany({
          data: imageRecords,
        });
      }

      this.logger.log(`Товар импортирован: ${article}`);

      await this.log('parser', 'product_imported', `Товар импортирован: ${article}`, {
        productId: product.id,
        price,
      });

      return {
        status: 'created',
        product,
      };
    } catch (error) {
      this.logger.error(`Ошибка импорта товара ${article}: ${error.message}`);

      await this.log(
        'parser',
        'import_error',
        `Ошибка импорта: ${article}`,
        { error: error.message },
        false
      );

      throw error;
    }
  }

  /**
   * Статус парсера
   */
  async getStatus() {
    const logsCount = await this.prisma.parserLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });

    const productsCount = await this.prisma.product.count({
      where: {
        source: {
          in: [ProductSource.PARSER_WB, ProductSource.PARSER_OZON, ProductSource.PARSER_OTHER],
        },
      },
    });

    return {
      enabled: true,
      lastRun: new Date(),
      logsLast24h: logsCount,
      productsImported: productsCount,
    };
  }

  /**
   * Логи парсера
   */
  async getLogs(source?: string, limit: number = 100) {
    const where: Record<string, unknown> = {};
    if (source) {
      where.source = source;
    }

    return this.prisma.parserLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Обработка webhook от wb-server
   */
  async handleWebhook(data: Record<string, unknown>) {
    this.logger.log(`Webhook получен: ${data.action}`);

    const { action, product, _products } = data;
    const productData = product as Record<string, unknown> | undefined;

    if (action === 'price_add' && productData) {
      return this.importProduct({
        article: productData.article as string,
        name: productData.name as string,
        brand: (productData.brand as string) || 'Unknown',
        price: productData.price as number,
        originalPrice: productData.originalPrice as number,
        category: 'Видеокарты', // Нужно мапить
        url: productData.url as string,
        source: 'WB',
      });
    }

    if (action === 'price_update' && productData) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { sku: productData.article as string },
      });

      if (existingProduct) {
        // Обновить цену
        await this.prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            price: productData.price as number,
            oldPrice: (productData.originalPrice as number) || null,
          },
        });

        // История цен
        await this.prisma.priceHistory.create({
          data: {
            productId: existingProduct.id,
            price: productData.price as number,
            oldPrice: (productData.originalPrice as number) || null,
            source: 'wb',
          },
        });

        return { status: 'updated', productId: existingProduct.id };
      }
    }

    return { status: 'ignored', action };
  }

  /**
   * Логирование
   */
  private async log(
    source: string,
    action: string,
    message: string,
    data?: Record<string, unknown>,
    success: boolean = true
  ) {
    await this.prisma.parserLog.create({
      data: { source, action, message, data: (data as Prisma.InputJsonValue) ?? null, success },
    });
  }

  /**
   * Конвертация в slug
   */
  private toSlug(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9а-яё -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Маппинг источника
   */
  private mapSource(source: string): ProductSource {
    switch (source.toLowerCase()) {
      case 'wb':
      case 'wildberries':
        return ProductSource.PARSER_WB;
      case 'ozon':
        return ProductSource.PARSER_OZON;
      default:
        return ProductSource.PARSER_OTHER;
    }
  }
}
