import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { webhookPayloadSchema, parserResultSchema } from '@/lib/validations/parser';
import { normalizeParserResult, type NormalizedParserResult } from '@/lib/wb-parser';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Rate limiting: храним последние запросы по jobId
const webhookCache = new Map<string, { timestamp: number; response: NextResponse }>();
const WEBHOOK_CACHE_TTL_MS = 2000; // 2 секунды — предотвращаем дубли

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// POST /api/admin/parser/webhook - получить результат парсинга от парсера
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const rawBody = await request.json();

    // Zod-валидация входящих данных
    const parseResult = webhookPayloadSchema.safeParse(rawBody);
    if (!parseResult.success) {
      console.error('[WEBHOOK] Validation failed:', parseResult.error.flatten());
      return NextResponse.json(
        { error: 'Невалидные данные', details: parseResult.error.flatten() },
        { status: 400, headers: corsHeaders }
      );
    }

    const { jobId, productId, status, result, error } = parseResult.data;

    // Rate limiting: предотвращаем дубликаты webhook
    if (jobId) {
      const cached = webhookCache.get(jobId);
      if (cached && Date.now() - cached.timestamp < WEBHOOK_CACHE_TTL_MS) {
        console.log('[WEBHOOK] Duplicate webhook ignored for jobId:', jobId);
        return cached.response;
      }
    }

    // Проверяем на пакетную обработку
    const isBatch = productId === '__BATCH__';

    if (isBatch) {
      const response = await handleBatchProcessing(jobId ?? '', status ?? 'PENDING', result, error ?? null);

      // Cache response
      if (jobId) {
        webhookCache.set(jobId, { timestamp: Date.now(), response });
      }
      return response;
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'productId обязателен' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Проверяем существование товара или создаём новый
    let product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, useParserPrice: true, parserSources: true, name: true, price: true },
    });

    if (!product) {
      console.log('[WEBHOOK] Product not found, creating new:', productId);
      const defaultCategory = await prisma.category.findFirst({ select: { id: true } });
      product = await prisma.product.create({
        data: {
          id: productId,
          slug: `product-${productId}`,
          name: `Товар ${productId}`,
          sku: `SKU-${productId}`,
          price: 0,
          useParserPrice: true,
          parserSources: [],
          categoryId: defaultCategory?.id || 'default',
        },
        select: { id: true, useParserPrice: true, parserSources: true, name: true, price: true },
      });
      console.log('[WEBHOOK] Created product:', productId);
    }

    // Атомарное создание или обновление задачи
    let parseJob: Awaited<ReturnType<typeof prisma.parseJob.findFirst>> | null = null;

    if (jobId) {
      const existingJob = await prisma.parseJob.findFirst({ where: { jobId } });

      if (existingJob) {
        parseJob = await prisma.parseJob.update({
          where: { id: existingJob.id },
          data: {
            status: status as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
            result: result ? (JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue) : Prisma.DbNull,
            error: error || null,
            completedAt: status === 'COMPLETED' || status === 'FAILED' ? new Date() : existingJob.completedAt,
          },
        });
        console.log(`[WEBHOOK] Updated job ${parseJob.id} (jobId: ${jobId}) -> ${status}`);
      } else {
        parseJob = await prisma.parseJob.create({
          data: {
            productId,
            sources: Array.isArray(result) ? [] : (result?.sources as string[]) || [],
            status: status as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
            result: result ? (JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue) : Prisma.DbNull,
            error: error || null,
            jobId,
            completedAt: status === 'COMPLETED' || status === 'FAILED' ? new Date() : null,
          },
        });
        console.log(`[WEBHOOK] Created job ${parseJob.id} (jobId: ${jobId}) -> ${status}`);
      }
    } else {
      // Без jobId — всегда создаём новую запись
      parseJob = await prisma.parseJob.create({
        data: {
          productId,
          sources: Array.isArray(result) ? [] : (result?.sources as string[]) || [],
          status: status as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
          result: result ? (JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue) : Prisma.DbNull,
          error: error || null,
          completedAt: status === 'COMPLETED' || status === 'FAILED' ? new Date() : null,
        },
      });
      console.log(`[WEBHOOK] Created job ${parseJob.id} (no jobId) -> ${status}`);
    }

    // Если парсинг завершён успешно — обрабатываем результаты
    if (status === 'COMPLETED' && result) {
      const resultsArray = Array.isArray(result)
        ? result
        : (result as { parsedData?: { results?: unknown[] } })?.parsedData?.results ||
          (result as { results?: unknown[] })?.results ||
          [];

// Извлекаем sources из payload (массив URL)
      // Поддерживаем оба формата: result.sources или [{source, ...}]
      let sourcesFromPayload: string[] = [];
      if (Array.isArray(result)) {
        for (const r of result) {
          if (r && typeof r === 'object' && 'source' in r) {
            sourcesFromPayload.push(String(r.source));
          }
        }
      } else if (result && typeof result === 'object' && 'sources' in result) {
        const sources = result.sources;
        if (Array.isArray(sources)) {
          sourcesFromPayload = sources.map(s => String(s));
        }
      }

      if (resultsArray.length > 0) {
        try {
          // Оборачиваем сохранение поставщиков, обновление цены и источников в транзакцию
          console.log(`[WEBHOOK] Saving suppliers for ${productId}:`, JSON.stringify(resultsArray));
          const transactionResult = await prisma.$transaction(async (tx) => {
            const suppliersResult = await saveSuppliers(productId, resultsArray, tx as unknown as Omit<typeof prisma, '$extends' | '$transaction'>);
            if (!suppliersResult.success) {
              throw new Error(`saveSuppliers failed: ${suppliersResult.error}`);
            }

            // Сохраняем источники из payload в Product.parserSources если они есть
            if (sourcesFromPayload.length > 0) {
              await updateProductParserSources(productId, sourcesFromPayload as string[], tx as unknown as Omit<typeof prisma, '$extends' | '$transaction'>);
            }

            if (product.useParserPrice) {
              const priceResult = await updateProductPriceFromParser(
                productId,
                resultsArray,
                product.parserSources,
                tx as unknown as Omit<typeof prisma, '$extends' | '$transaction'>
              );
              if (!priceResult.success) {
                throw new Error(`updateProductPriceFromParser failed: ${priceResult.error}`);
              }
              return { suppliers: suppliersResult, price: priceResult };
            }

            return { suppliers: suppliersResult };
          });

          const { revalidatePath, revalidateTag } = await import('next/cache');
          revalidatePath(`/product/${productId}`);
          revalidatePath('/catalog');
          revalidatePath('/');
          revalidateTag('products');
          revalidateTag('catalog');

          console.log(`[WEBHOOK] Transaction completed for product ${productId}:`, JSON.stringify(transactionResult));
        } catch (txError) {
          // Транзакция не удалась, но задача сохранена
          console.error('[WEBHOOK] Transaction failed:', txError);
          // Обновляем задачу с ошибкой
          await prisma.parseJob.update({
            where: { id: parseJob.id },
            data: {
              error: `Транзакция не удалась: ${txError instanceof Error ? txError.message : 'Unknown error'}`,
              status: 'FAILED',
            },
          });
        }
      }
    } else if (status === 'FAILED') {
      console.error(`[WEBHOOK] Job ${jobId} failed:`, error);
    }

    const response = NextResponse.json({ success: true }, { headers: corsHeaders });

    // Cache response для предотвращения дублей
    if (jobId) {
      webhookCache.set(jobId, { timestamp: Date.now(), response });
    }

    const elapsed = Date.now() - startTime;
    console.log(`[WEBHOOK] Processed in ${elapsed}ms`);

    return response;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[WEBHOOK] Error after ${elapsed}ms:`, error);
    const message = error instanceof Error ? error.message : 'Failed to process webhook';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Очистка кэша webhook каждые 30 секунд
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of webhookCache.entries()) {
    if (now - value.timestamp > WEBHOOK_CACHE_TTL_MS * 2) {
      webhookCache.delete(key);
    }
  }
}, 30000);

// Обработка пакетного парсинга
async function handleBatchProcessing(
  jobId: string,
  status: string,
  result: unknown,
  error: string | null
) {
  try {
    console.log(`[BATCH] Processing batch job ${jobId}, status: ${status}`);

    if (status !== 'COMPLETED' || !result) {
      // Даже если не completed, сохраняем статус
      if (jobId) {
        await prisma.parseJob.updateMany({
          where: { jobId },
          data: {
            status: status as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
            error: error || null,
            completedAt: status === 'FAILED' ? new Date() : undefined,
          },
        }).catch(() => {}); // Игнорируем если job не существует
      }
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    const results = (result as { parsedData?: { results?: Array<{ source?: string }> } })?.parsedData?.results || [];
    const sourcesList = (result as { sources?: string[] })?.sources || [];

    // ИСПРАВЛЕНИЕ N+1: выносим findMany ЗА пределы цикла
    const allProductsWithParser = await prisma.product.findMany({
      where: {
        parserSources: {
          not: Prisma.DbNull,
        },
      },
      select: {
        id: true,
        useParserPrice: true,
        parserSources: true,
        price: true,
      },
    });

    // Строим Map: url -> product для быстрого поиска
    const urlToProductMap = new Map<string, typeof allProductsWithParser[number]>();
    for (const product of allProductsWithParser) {
      const sourcesList = product.parserSources as Array<{ url: string }> | null;
      if (sourcesList && Array.isArray(sourcesList)) {
        for (const source of sourcesList) {
          if (source?.url) {
            urlToProductMap.set(source.url, product);
          }
        }
      }
    }

    const processedProducts = new Set<string>();
    const errors: string[] = [];

    for (const sourceUrl of sourcesList) {
      const product = urlToProductMap.get(sourceUrl);

      if (!product) {
        console.log(`[BATCH] Product not found for source: ${sourceUrl}`);
        continue;
      }

      try {
        // Обёртываем операции для каждого товара в транзакцию
        await prisma.$transaction(async (tx) => {
          const txDb = tx as unknown as Omit<typeof prisma, '$extends' | '$transaction'>;

          // Создаём задачу для этого товара
          await txDb.parseJob.create({
            data: {
              productId: product.id,
              sources: [sourceUrl],
              status: status as 'COMPLETED',
              result: result as Prisma.InputJsonValue,
              completedAt: new Date(),
            },
          });

          // Фильтруем результаты для этого источника
          const productResults = results.filter(
            (r) => (r as { source?: string })?.source === sourceUrl
          );

          if (productResults.length > 0) {
            const suppliersResult = await saveSuppliers(product.id, productResults, txDb);
            if (!suppliersResult.success) {
              throw new Error(`saveSuppliers failed for ${product.id}: ${suppliersResult.error}`);
            }

            if (product.useParserPrice) {
              const priceResult = await updateProductPriceFromParser(
                product.id,
                productResults,
                product.parserSources,
                txDb
              );
              if (!priceResult.success) {
                throw new Error(
                  `updateProductPriceFromParser failed for ${product.id}: ${priceResult.error}`
                );
              }
            }
          }
        });

        processedProducts.add(product.id);
        console.log(`[BATCH] Updated product ${product.id} from source ${sourceUrl}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Product ${product.id}: ${message}`);
        console.error(`[BATCH] Error processing product ${product.id}:`, err);
      }
    }

    console.log(`[BATCH] Processed ${processedProducts.size} products, ${errors.length} errors`);

    return NextResponse.json(
      {
        success: true,
        processedCount: processedProducts.size,
        errors: errors.length > 0 ? errors : undefined,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in batch processing:', error);
    const message = error instanceof Error ? error.message : 'Failed to process batch';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Результат операции с поставщиками
interface OperationResult {
  success: boolean;
  error?: string;
  savedCount?: number;
}

// Функция для сохранения поставщиков
async function saveSuppliers(
  productId: string,
  results: unknown[],
  tx?: Omit<typeof prisma, '$extends' | '$transaction'>
): Promise<OperationResult> {
  try {
    const db = tx || prisma;
    let savedCount = 0;
    let supplierIndex = 1;

    for (const result of results) {
      // Try to normalize as WB parser result first (from background.js)
      const wbResult = result as { 
        article?: string; 
        source?: string; 
        url?: string;
        name?: string; 
        brand?: string; 
        price?: number | null; 
        originalPrice?: number | null; 
        stockQuantity?: number; 
        deliveryMin?: number; 
        deliveryMax?: number; 
        inStock?: boolean; 
        outOfStock?: boolean;
        rating?: number | null; 
        feedbacks?: number; 
        imageUrl?: string 
      };

      const source = wbResult.source || wbResult.url || '';
      if (!source) continue;

      const price = wbResult.price ?? null;
      const oldPrice = wbResult.originalPrice ?? null;
      const inStock = (wbResult.inStock ?? true) && !wbResult.outOfStock && price !== null;
      const stockQuantity = wbResult.stockQuantity ?? 0;
      const deliveryMin = wbResult.deliveryMin ?? null;
      const deliveryMax = wbResult.deliveryMax ?? null;
      const rating = wbResult.rating ?? null;
      const feedbacks = wbResult.feedbacks ?? 0;
      const name = wbResult.name || wbResult.brand || 'Поставщик';
      const imageUrl = wbResult.imageUrl || '';

      // Генерируем имя поставщика
      const sourceName = `Поставщик ${supplierIndex}`;
      supplierIndex++;
      console.log('[SUPPLIERS] Saving supplier:', sourceName, 'for product', productId);

      // Формируем срок доставки
      let deliveryTime: string | null = null;
      if (deliveryMin !== null && deliveryMax !== null) {
        deliveryTime = `${deliveryMin}–${deliveryMax} дн.`;
      }

      const priceValue = price ?? 0;
      if (priceValue === 0) continue; // Пропускаем товары без цены

      // Применяем скидку 2% (как и для цены товара)
      const discountedPrice = Math.round(priceValue * 0.98);

      // Сохраняем или обновляем поставщика
      await db.productSupplier.upsert({
        where: {
          productId_url: { productId, url: source },
        },
        create: {
          productId,
          name: sourceName,
          url: source,
          price: new Decimal(discountedPrice),
          oldPrice: oldPrice ? new Decimal(Math.round(oldPrice * 0.98)) : null,
          deliveryTime,
          inStock,
          rating,
          reviewsCount: feedbacks,
        },
        update: {
          name: sourceName,
          price: new Decimal(discountedPrice),
          oldPrice: oldPrice ? new Decimal(Math.round(oldPrice * 0.98)) : null,
          deliveryTime,
          inStock,
          rating,
          reviewsCount: feedbacks,
        },
      });

      savedCount++;
    }

    console.log(`[SUPPLIERS] Saved ${savedCount} suppliers for product ${productId}`);
    return { success: true, savedCount };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving suppliers:', error);
    return { success: false, error: message };
  }
}

// Функция приоритетного обновления цены товара
async function updateProductPriceFromParser(
  productId: string,
  results: unknown[],
  parserSources: unknown,
  tx?: Omit<typeof prisma, '$extends' | '$transaction'>
): Promise<OperationResult> {
  try {
    const db = tx || prisma;

    // Получаем настроенные источники из товара
    let sources: Array<{ url: string; priority: number; isActive: boolean }> = [];

    if (parserSources && Array.isArray(parserSources)) {
      sources = parserSources as Array<{ url: string; priority: number; isActive: boolean }>;
    } else {
      // Если нет настроенных источников — используем все результаты по порядку
      sources = results
        .map((r, i) => ({
          url: (r as { source?: string })?.source || '',
          priority: i,
          isActive: true,
        }))
        .filter((s) => s.url);
    }

    // Сортируем по приоритету
    sources.sort((a, b) => a.priority - b.priority);

    // Если sources пустой (новый товар) — создаём из результатов
    if (sources.length === 0 && results.length > 0) {
      sources = results
        .filter((r) => (r as { price?: number })?.price)
        .map((r, i) => ({
          url: (r as { source?: string })?.source || (r as { url?: string })?.url || '',
          priority: i,
          isActive: true,
        }))
        .filter((s) => s.url) as typeof sources;
    }

    // Создаём карту результатов по URL
    const resultMap = new Map<
      string,
      {
        price?: number | null;
        oldPrice?: number | null;
        deliveryMin?: number | null;
        deliveryMax?: number | null;
        inStock?: boolean;
        name?: string;
        brand?: string;
        stockQuantity?: number;
        rating?: number | null;
        feedbacks?: number;
      }
    >();

    for (const result of results) {
      const r = result as { source?: string; price?: number | null; originalPrice?: number | null; deliveryMin?: number; deliveryMax?: number; inStock?: boolean; name?: string; brand?: string; stockQuantity?: number; rating?: number | null; feedbacks?: number };
      if (r.source) {
        resultMap.set(r.source, {
          price: r.price,
          oldPrice: r.originalPrice,
          deliveryMin: r.deliveryMin ?? null,
          deliveryMax: r.deliveryMax ?? null,
          inStock: r.inStock,
          name: r.name,
          brand: r.brand,
          stockQuantity: r.stockQuantity,
          rating: r.rating,
          feedbacks: r.feedbacks,
        });
      }
    }

    // Ищем источник с минимальной ценой
    let selectedSource: { url: string; priority: number } | null = null;
    let selectedData: {
      price?: number | null;
      oldPrice?: number | null;
      deliveryMin?: number | null;
      deliveryMax?: number | null;
      inStock?: boolean;
      name?: string;
      brand?: string;
      stockQuantity?: number;
      rating?: number | null;
      feedbacks?: number;
    } | null = null;

    let minPrice = Infinity;

    for (const source of sources) {
      if (!source.isActive) continue;

      const data = resultMap.get(source.url);
      if (!data || !data.price || data.price <= 0) continue;

      // Берём минимальную цену
      if (data.price < minPrice) {
        minPrice = data.price;
        selectedSource = { url: source.url, priority: source.priority };
        selectedData = data;
      }
    }

    // Если ни один источник не доступен — не обновляем
    if (!selectedSource || !selectedData) {
      console.log(`[PRICE UPDATE] No available source with price > 0 for ${productId}`);

      // Обновляем статус товара — не в наличии
      await db.product.update({
        where: { id: productId },
        data: {
          parserInStock: false,
          parserUpdatedAt: new Date(),
        },
      });

      return { success: true, error: 'No available source with in-stock item' };
    }

    const data = selectedData!;

    // Извлекаем срок доставки
    let delivery: string | null = null;
    if (data.deliveryMin !== null && data.deliveryMax !== null) {
      delivery = `${data.deliveryMin}–${data.deliveryMax} дн.`;
    }

    // Получаем текущую цену товара для корректной истории цен
    const currentProduct = await db.product.findUnique({
      where: { id: productId },
      select: { price: true },
    });

    const currentPrice = currentProduct?.price?.toNumber() ?? null;
    const newPrice = data.price ?? null;

    // Обновляем товар
    const updateData: Record<string, unknown> = {
      parserPrice: newPrice ? new Decimal(newPrice) : null,
      parserOldPrice: data.oldPrice ? new Decimal(data.oldPrice) : null,
      parserDelivery: delivery,
      parserName: data.name || data.brand || null,
      parserInStock: true,
      parserUpdatedAt: new Date(),
      name: data.name || `Товар ${productId}`,
    };

    // Если цена получена от парсера — обновляем основную цену
    // Применяем скидку 2% (скидка от цены = цена * 0.98)
    if (newPrice && newPrice > 0) {
      const discountedPrice = Math.round(newPrice * 0.98);
      updateData.price = new Decimal(discountedPrice);

      if (data.oldPrice && data.oldPrice > 0) {
        updateData.oldPrice = new Decimal(data.oldPrice);
      }

      // Записываем в историю цен с реальными oldPrice и newPrice
      if (currentPrice !== null && currentPrice !== newPrice) {
        await db.priceHistory.create({
          data: {
            productId,
            oldPrice: new Decimal(currentPrice),
            newPrice: new Decimal(newPrice),
            reason: 'parser_auto',
          },
        });
        console.log(
          `[PRICE HISTORY] ${productId}: ${currentPrice} -> ${newPrice} (parser_auto)`
        );
      } else if (currentPrice === null) {
        // Если у товара не было цены (null), записываем как установку цены
        await db.priceHistory.create({
          data: {
            productId,
            oldPrice: new Decimal(0),
            newPrice: new Decimal(newPrice),
            reason: 'parser_auto_initial',
          },
        });
        console.log(`[PRICE HISTORY] ${productId}: 0 -> ${newPrice} (parser_auto_initial)`);
      }
    }

    await db.product.update({
      where: { id: productId },
      data: updateData,
    });

    console.log(`[PRICE UPDATE] Updated product ${productId} from ${selectedSource.url}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating product price from parser:', error);
    return { success: false, error: message };
  }
}

/**
 * Обновляет источники парсинга в Product.parserSources
 * Добавляет новые URL к существующим, сохраняя уникальность
 */
async function updateProductParserSources(
  productId: string,
  sources: string[],
  tx?: Omit<typeof prisma, '$extends' | '$transaction'>
): Promise<OperationResult> {
  try {
    const db = tx || prisma;

    // Получаем текущие источники товара
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { parserSources: true },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Преобразуем существующие источники в массив URL
    const existingSources: string[] = [];
    if (product.parserSources && Array.isArray(product.parserSources)) {
      for (const source of product.parserSources as Array<{ url?: string }>) {
        if (source?.url) {
          existingSources.push(source.url);
        }
      }
    }

    // Объединяем существующие и новые источники, сохраняем уникальность
    const allSources = [...new Set([...existingSources, ...sources])];

    // Формируем структуру parserSources: [{url, priority, isActive}]
    const parserSources = allSources.map((url, index) => ({
      url,
      priority: index,
      isActive: true,
    }));

    // Обновляем Product.parserSources
    await db.product.update({
      where: { id: productId },
      data: { parserSources },
    });

    console.log(`[PARSER SOURCES] Updated ${productId}: ${allSources.length} sources (${allSources.join(', ')})`);
    return { success: true, savedCount: allSources.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating product parser sources:', error);
    return { success: false, error: message };
  }
}
