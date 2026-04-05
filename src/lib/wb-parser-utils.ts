/**
 * WB Parser Utilities
 * Methods extracted from background.js (1000fps WB Parser)
 * These are pure functions that work in both Node.js and browser environments
 */

// ===================== PRICE EXTRACTION =====================
// Multi-format price extraction from various WB API response formats

export interface ExtractedPrice {
  price: number | null;
  originalPrice: number | null;
  outOfStock: boolean;
}

export function extractPrice(product: Record<string, unknown>): ExtractedPrice {
  let price: number | null = null;
  let originalPrice: number | null = null;

  // Проверяем наличие товара на складах
  const totalQuantity = product.totalQuantity as number | undefined;
  if (totalQuantity === 0) {
    return { price: null, originalPrice: null, outOfStock: true };
  }

  // Формат 1: sizes[0].price.product/basic
  const sizes = product.sizes as Array<{ price?: Record<string, number> }> | undefined;
  if (sizes && sizes[0]?.price) {
    const p = sizes[0].price;
    if (p.product) price = Math.round(p.product / 100);
    if (p.basic) originalPrice = Math.round(p.basic / 100);
  }

  // Формат 1.1: sizes[0].price.total/old
  if (!price && sizes && sizes[0]?.price) {
    const p = sizes[0].price;
    if (p.total) price = Math.round(p.total / 100);
    if (p.old && !originalPrice) originalPrice = Math.round(p.old / 100);
  }

  // Формат 2: salePriceU / priceU (копейки)
  if (!price && typeof product.salePriceU === 'number') price = Math.round(product.salePriceU / 100);
  if (!originalPrice && typeof product.priceU === 'number') originalPrice = Math.round(product.priceU / 100);

  // Формат 3: salePrice / price (рубли)
  if (!price && typeof product.salePrice === 'number') price = product.salePrice;
  if (!originalPrice && typeof product.price === 'number') originalPrice = product.price;

  // Формат 4: salePrice / price (строки с валютой)
  if (!price && typeof product.salePrice === 'string') {
    price = parseFloat(product.salePrice.replace(/[^0-9.]/g, ''));
  }
  if (!originalPrice && typeof product.price === 'string' && !price) {
    originalPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
  }

  // Формат 5: prices[0].value / prices[0].oldValue
  if (!price && Array.isArray(product.prices) && product.prices[0]) {
    const fp = product.prices[0] as Record<string, number>;
    if (fp.value) price = Math.round(fp.value / 100);
    if (fp.oldValue && !originalPrice) originalPrice = Math.round(fp.oldValue / 100);
  }

  // Формат 6: salePriceObj / priceObj
  if (!price && product.salePriceObj && typeof (product.salePriceObj as Record<string, number>).value === 'number') {
    price = Math.round((product.salePriceObj as Record<string, number>).value / 100);
  }
  if (!originalPrice && product.priceObj && typeof (product.priceObj as Record<string, number>).value === 'number') {
    originalPrice = Math.round((product.priceObj as Record<string, number>).value / 100);
  }

  // Формат 7: currentPrice / basePrice (копейки)
  if (!price && typeof product.currentPrice === 'number') price = Math.round(product.currentPrice / 100);
  if (!originalPrice && typeof product.basePrice === 'number') originalPrice = Math.round(product.basePrice / 100);

  // Формат 8: priceRub / salePriceRub
  if (!price && typeof product.priceRub === 'number') price = product.priceRub;
  if (!originalPrice && typeof product.salePriceRub === 'number') originalPrice = product.salePriceRub;

  // Формат 9: saleprice / price (lowercase)
  if (!price && typeof product.saleprice === 'number') price = product.saleprice;
  if (!originalPrice && typeof product.price === 'number') originalPrice = product.price;

  return { price, originalPrice, outOfStock: totalQuantity === 0 };
}

// ===================== STOCK QUANTITY =====================
// Multi-format stock quantity extraction

export function extractStockQuantity(product: Record<string, unknown>): number {
  // Приоритет 1: totalQuantity
  if (typeof product.totalQuantity === 'number') {
    return product.totalQuantity;
  }

  // Приоритет 2: sizes[0].stocks[].qty - сумма по всем складам
  const sizes = product.sizes as Array<{ stocks?: Array<{ qty?: number }> }> | undefined;
  if (sizes && sizes[0]?.stocks) {
    const total = sizes[0].stocks.reduce((sum, stock) => sum + (typeof stock.qty === 'number' ? stock.qty : 0), 0);
    if (total > 0) return total;
  }

  // Приоритет 3: sum
  if (typeof product.sum === 'number') return product.sum;

  // Приоритет 4: availableQuantity
  if (typeof product.availableQuantity === 'number') return product.availableQuantity;

  // Приоритет 5: stocks - массив складов
  const stocks = product.stocks as Array<{ qty?: number }> | undefined;
  if (Array.isArray(stocks) && stocks.length > 0) {
    const total = stocks.reduce((sum, stock) => sum + (typeof stock.qty === 'number' ? stock.qty : 0), 0);
    if (total > 0) return total;
  }

  // Приоритет 6: quantity
  if (typeof product.quantity === 'number') return product.quantity;

  return 0;
}

// ===================== DELIVERY DAYS =====================
// Extract delivery time ranges

export interface DeliveryInfo {
  deliveryMin: number;
  deliveryMax: number;
}

export function extractDeliveryDays(product: Record<string, unknown>): DeliveryInfo {
  let deliveryMin: number | null = null;
  let deliveryMax: number | null = null;

  // Приоритет 1: time1/time2 из sizes/stocks
  if (typeof product.time1 === 'number') {
    if (product.time1 <= 24) {
      deliveryMin = Math.ceil(product.time1 / 24);
    } else {
      deliveryMin = product.time1;
    }
    deliveryMax = deliveryMin + 1;
  }

  // Приоритет 2: deliveryData / delivery
  if (deliveryMin === null) {
    const deliveryData = (product.deliveryData || product.delivery) as Record<string, unknown> | undefined;
    if (deliveryData) {
      if (typeof deliveryData.deliveryDaysMin === 'number') {
        deliveryMin = deliveryData.deliveryDaysMin;
      } else if (typeof deliveryData.minDays === 'number') {
        deliveryMin = deliveryData.minDays;
      }
      if (typeof deliveryData.deliveryDaysMax === 'number') {
        deliveryMax = deliveryData.deliveryDaysMax;
      } else if (typeof deliveryData.maxDays === 'number') {
        deliveryMax = deliveryData.maxDays;
      }
    }
  }

  // Приоритет 3: deliveryPeriod - строка "3-5 дн."
  if (deliveryMin === null && typeof product.deliveryPeriod === 'string') {
    const match = product.deliveryPeriod.match(/(\d+)\s*[-–—]\s*(\d+)/);
    if (match) {
      deliveryMin = parseInt(match[1], 10);
      deliveryMax = parseInt(match[2], 10);
    }
  }

  // Приоритет 4: estimatedDeliveryDate
  if (deliveryMin === null && typeof product.estimatedDeliveryDate === 'string') {
    const estimatedDate = new Date(product.estimatedDeliveryDate);
    const now = new Date();
    const diffDays = Math.ceil((estimatedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      deliveryMin = diffDays;
      deliveryMax = diffDays + 1;
    }
  }

  // Дефолтное значение
  if (deliveryMin === null) {
    deliveryMin = 2;
    deliveryMax = 4;
  }

  return { deliveryMin, deliveryMax: deliveryMax || deliveryMin + 1 };
}

// ===================== PRODUCT DATA EXTRACTION =====================
// Combined extraction into a unified format

export interface WbProductData {
  article: string;
  name: string;
  brand: string;
  price: number | null;
  originalPrice: number | null;
  rating: number | null;
  feedbacks: number;
  imageUrl: string;
  url: string;
  checkedAt: string;
  stockQuantity: number;
  deliveryMin: number;
  deliveryMax: number;
  outOfStock: boolean;
}

export function extractProductData(article: string, data: unknown): WbProductData | null {
  // Пытаемся найти товар в разных форматах ответа
  const d = data as Record<string, unknown>;

  let product: Record<string, unknown> | null = null;

  // Формат 1: data.data.products[0]
  if (d?.data && typeof d.data === 'object') {
    const dd = d.data as Record<string, unknown>;
    const products = dd.products as unknown[] | undefined;
    if (products?.[0]) product = products[0] as Record<string, unknown>;
  }

  // Формат 2: data.products[0]
  if (!product) {
    const products = d?.products as unknown[] | undefined;
    if (products?.[0]) product = products[0] as Record<string, unknown>;
  }

  // Формат 3: data (если это сам товар)
  if (!product && d?.id) product = d;

  if (!product) return null;

  const { price, originalPrice, outOfStock } = extractPrice(product);
  const stockQuantity = extractStockQuantity(product);
  const { deliveryMin, deliveryMax } = extractDeliveryDays(product);

  const productName =
    (product.name as string) ||
    (product.nameFull as string) ||
    (product.brandName as string) ||
    (product.productName as string) ||
    (product.title as string) ||
    (product.imt_name as string) ||
    `Товар ${article}`;

  return {
    article: String(article),
    name: productName.slice(0, 200),
    brand: (product.brand as string) || (product.brandName as string) || (product.selling as Record<string, string>)?.brand_name || '',
    price,
    originalPrice,
    rating: (product.reviewRating as number) || (product.rating as number) || null,
    feedbacks: (product.feedbacks as number) || (product.feedbackCount as number) || 0,
    imageUrl: (product.imageUrl as string) || (product.image as string) || '',
    url: `https://www.wildberries.ru/catalog/${article}/detail.aspx`,
    checkedAt: new Date().toISOString(),
    stockQuantity,
    deliveryMin,
    deliveryMax,
    outOfStock: outOfStock || stockQuantity === 0,
  };
}

// ===================== WB API ENDPOINTS =====================
// Available WB API endpoints with fallback order

export const WB_API_ENDPOINTS = [
  // v4/detail - основной рабочий endpoint
  (article: string, dest: string) =>
    `https://www.wildberries.ru/__internal/card/cards/v4/detail?appType=1&curr=rub&dest=${dest}&spp=30&hide_vflags=4294967296&ab_testing=false&lang=ru&nm=${article}`,
  // v4/detail без hide_vflags - запасной
  (article: string, dest: string) =>
    `https://www.wildberries.ru/__internal/card/cards/v4/detail?appType=1&curr=rub&dest=${dest}&spp=30&lang=ru&nm=${article}`,
];

export const DEFAULT_DEST = '123585942';
