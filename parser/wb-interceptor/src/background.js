'use strict';

// ============================================================
// CONFIG - Server webhook URL
// ============================================================
const SERVER_WEBHOOK_URL = 'http://localhost:3000/api/admin/parser/webhook';

const API_ENDPOINTS = [
  (article, dest) => `https://www.wildberries.ru/__internal/card/cards/v4/detail?appType=1&curr=rub&dest=${dest}&spp=30&hide_vflags=4294967296&ab_testing=false&lang=ru&nm=${article}`,
  (article, dest) => `https://www.wildberries.ru/__internal/card/cards/v4/detail?appType=1&curr=rub&dest=${dest}&spp=30&lang=ru&nm=${article}`,
];
const DEFAULT_DEST = '123585942';
const CHECK_INTERVAL = 120;
const STORAGE_KEY = 'wbPrices';
const CACHE = {
  dest: null,
  destTs: 0,
  workingEndpoint: 0,
};
const CACHE_TTL = 5 * 60 * 1000; 

// ============================================================
// Send price to server
// ============================================================
async function sendToWebhook(article, productData) {
  try {
    const payload = {
      jobId: `ext_${Date.now()}_${article}`,
      productId: article,
      status: 'COMPLETED',
      result: [{
        source: `https://www.wildberries.ru/catalog/${article}/detail.aspx`,
        success: true,
        ...productData
      }]
    };
    
    const response = await fetch(SERVER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      console.log(`[1000fps] ✅ Webhook sent for ${article}`);
      return true;
    } else {
      console.error(`[1000fps] ❌ Webhook failed:`, response.status);
      return false;
    }
  } catch(e) {
    console.error(`[1000fps] ❌ Webhook error:`, e.message);
    return false;
  }
} 
function extractPrice(product) {
  let price = null;
  let originalPrice = null;
  const totalQuantity = product.totalQuantity || 0;
  if (totalQuantity === 0) {
    return { price: null, originalPrice: null, outOfStock: true };
  }
  if (product.sizes && product.sizes[0] && product.sizes[0].price) {
    const p = product.sizes[0].price;
    if (p.product) price = Math.round(p.product / 100);
    if (p.basic) originalPrice = Math.round(p.basic / 100);
  }
  if (!price && product.sizes && product.sizes[0] && product.sizes[0].price) {
    const p = product.sizes[0].price;
    if (p.total) price = Math.round(p.total / 100);
    if (p.old && !originalPrice) originalPrice = Math.round(p.old / 100);
  }
  if (!price && product.salePriceU) price = Math.round(product.salePriceU / 100);
  if (!originalPrice && product.priceU) originalPrice = Math.round(product.priceU / 100);
  if (!price && typeof product.salePrice === 'number') price = product.salePrice;
  if (!originalPrice && typeof product.price === 'number') originalPrice = product.price;
  if (!price && typeof product.salePrice === 'string') {
    price = parseFloat(product.salePrice.replace(/[^0-9.]/g, ''));
  }
  if (!originalPrice && typeof product.price === 'string' && !price) {
    originalPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
  }
  if (!price && product.prices && Array.isArray(product.prices) && product.prices[0]) {
    if (product.prices[0].value) price = Math.round(product.prices[0].value / 100);
    if (product.prices[0].oldValue && !originalPrice) originalPrice = Math.round(product.prices[0].oldValue / 100);
  }

  return { price, originalPrice, outOfStock: totalQuantity === 0 };
}
function extractStockQuantity(product) {
  if (typeof product.totalQuantity === 'number') return product.totalQuantity;
  if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
    const firstSize = product.sizes[0];
    if (firstSize.stocks && Array.isArray(firstSize.stocks)) {
      const total = firstSize.stocks.reduce((sum, stock) => sum + (typeof stock.qty === 'number' ? stock.qty : 0), 0);
      if (total > 0) return total;
    }
  }
  if (typeof product.availableQuantity === 'number') return product.availableQuantity;
  return 0;
}
function extractDeliveryDays(product) {
  let deliveryMin = null;
  let deliveryMax = null;
  if (typeof product.time1 === 'number') {
    deliveryMin = product.time1 <= 24 ? Math.ceil(product.time1 / 24) : product.time1;
    deliveryMax = deliveryMin + 1;
  }
  if (deliveryMin === null) {
    deliveryMin = 2;
    deliveryMax = 4;
  }
  return { deliveryMin, deliveryMax };
}
function extractProductData(article, data) {
  let product = data?.data?.products?.[0] || data?.products?.[0] || data?.card || null;
  if (!product && data?.id) product = data;
  if (!product) return null;
  const { price, originalPrice, outOfStock } = extractPrice(product);
  const stockQuantity = extractStockQuantity(product);
  const { deliveryMin, deliveryMax } = extractDeliveryDays(product);
  const productName =
    product.name ||
    product.nameFull ||
    product.brandName ||
    product.productName ||
    product.title ||
    product.imt_name ||
    `Товар ${article}`;
  return {
    article: String(article),
    name: productName.slice(0, 200),
    description: '',
    brand: product.brand || product.brandName || '',
    price,
    originalPrice,
    rating: product.reviewRating || product.rating || null,
    feedbacks: product.feedbacks || product.feedbackCount || 0,
    imageUrl: '',
    url: `https://www.wildberries.ru/catalog/${article}/detail.aspx`,
    checkedAt: new Date().toISOString(),
    specifications: product.options || product.grouped_options || [],
    stockQuantity,
    deliveryMin,
    deliveryMax,
    outOfStock: outOfStock || stockQuantity === 0,
  };
}
async function fetchProductInfo(article) {
  const dest = CACHE.dest || DEFAULT_DEST;
  let lastError = null;
  for (let i = CACHE.workingEndpoint; i < API_ENDPOINTS.length; i++) {
    try {
      const url = API_ENDPOINTS[i](article, dest);
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.wildberries.ru/'
        }
      });

      if (!response.ok) {
        lastError = `HTTP ${response.status}`;
        continue;
      }
      const data = await response.json();
      CACHE.workingEndpoint = i;
      const product = extractProductData(article, data);
      if (!product) { lastError = 'Не удалось извлечь данные'; continue; }
      if (!product.price) { lastError = 'Цена не найдена'; continue; }
      return product;
    } catch(e) {
      lastError = e.message;
    }
  }
  throw new Error(`Не удалось получить данные. Последняя ошибка: ${lastError || 'неизвестно'}`);
}
async function getStore() {
  try {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    return data[STORAGE_KEY] || { products: {} };
  } catch(e) {
    console.error('Get store error:', e);
    return { products: {} };
  }
}
async function saveStore(store) {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: store });
  } catch(e) {
    console.error('Save store error:', e);
  }
}
async function checkAllPrices() {
  const store = await getStore();
  const articles = Object.keys(store.products || {});
  let successCount = 0;
  let errorCount = 0;
  let priceChangedCount = 0;
  let firstPriceCount = 0;
  console.log(`[1000fps] 🔄 Начинаем проверку ${articles.length} товаров...`);
  for (const article of articles) {
    try {
      const info = await fetchProductInfo(article);
      if (!info || !info.price) {
        errorCount++;
        continue;
      }
      const product = store.products[article];
      const history = product.history || [];
      const lastPrice = history.length ? history[history.length - 1].price : null;
      if (lastPrice !== null && lastPrice !== info.price) {
        priceChangedCount++;
        console.log(`[1000fps] 💰 ${article}: ${lastPrice}₽ → ${info.price}₽`);
        try {
          await chrome.notifications.create('wb-' + article + '-' + Date.now(), {
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Цена изменилась: ' + info.name.slice(0, 40),
            message: `${lastPrice}₽ → ${info.price}₽ (${info.price > lastPrice ? '+' : ''}${info.price - lastPrice}₽)`
          });
        } catch(e) {}
      }
      if (lastPrice === null && info.price) {
        firstPriceCount++;
      }
      if (info.outOfStock) {
        console.log(`[1000fps] ⚠️ ${article}: отсутствует на складах`);
      }
      if (info.price) {
        if (lastPrice === null || lastPrice !== info.price) {
          history.push({ price: info.price, ts: new Date().toISOString() });
          if (history.length > 300) history.splice(0, history.length - 300);
        }
      }
      store.products[article] = Object.assign({}, product, info, {
        history,
        addedAt: product.addedAt || new Date().toISOString()
      });
      successCount++;
    } catch(e) {
      errorCount++;
      console.error(`[1000fps] ❌ Ошибка проверки ${article}:`, e.message);
    }
  }
  store.lastChecked = Date.now();
  store.lastStats = { success: successCount, errors: errorCount, priceChanged: priceChangedCount };
  await saveStore(store);
  console.log(`[1000fps] ✅ Проверка завершена: ${successCount} успешно, ${errorCount} ошибок, 💰 изменилось: ${priceChangedCount}`);
  chrome.runtime.sendMessage({ type: 'PRICES_UPDATED' }).catch(() => {});
}
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async function() {
    try {
      if (msg.type === 'PRICE_ADD') {
        const store = await getStore();
        // No product limit!
        if (store.products[msg.article]) {
          sendResponse({ ok: false, error: 'Уже добавлен' });
          return;
        }
        try {
          const info = await fetchProductInfo(msg.article);
          if (!info) {
            sendResponse({ ok: false, error: 'Товар не найден' });
            return;
          }
          if (!info.price) {
            sendResponse({ ok: false, error: 'Цена не найдена' });
            return;
          }
          store.products[msg.article] = Object.assign({}, info, {
            history: [{ price: info.price, ts: new Date().toISOString() }],
            addedAt: new Date().toISOString()
          });
          await saveStore(store);
          // Send to server webhook
          await sendToWebhook(msg.article, info);
          sendResponse({ ok: true, product: store.products[msg.article] });
        } catch(e) {
          sendResponse({ ok: false, error: e.message });
        }
        return;
      }
      if (msg.type === 'PRICE_REMOVE') {
        const store = await getStore();
        delete store.products[msg.article];
        await saveStore(store);
        sendResponse({ ok: true });
        return;
      }
      if (msg.type === 'PRICE_GET_ALL') {
        const store = await getStore();
        sendResponse({ store });
        return;
      }
      if (msg.type === 'PRICE_REFRESH_ONE') {
        const store = await getStore();
        const product = store.products[msg.article];
        if (!product) {
          sendResponse({ ok: false, error: 'Не найден' });
          return;
        }
        try {
          const info = await fetchProductInfo(msg.article);
          if (!info) {
            sendResponse({ ok: false, error: 'Ошибка получения данных' });
            return;
          }
          const history = product.history || [];
          const lastPrice = history.length ? history[history.length - 1].price : null;
          if (lastPrice === null || lastPrice !== info.price) {
            history.push({ price: info.price, ts: new Date().toISOString() });
            if (history.length > 300) history.splice(0, history.length - 300);
          }
          store.products[msg.article] = Object.assign({}, product, info, { history });
          await saveStore(store);
          // Send to server webhook
          await sendToWebhook(msg.article, info);
          if (lastPrice !== null && lastPrice !== info.price) {
            try {
              await chrome.notifications.create('wb-' + msg.article + '-' + Date.now(), {
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: 'Цена изменилась: ' + info.name.slice(0, 40),
                message: `${lastPrice}₽ → ${info.price}₽`
              });
            } catch(e) {}
          }
          chrome.runtime.sendMessage({ type: 'PRICES_UPDATED' }).catch(() => {});
          sendResponse({ ok: true, product: store.products[msg.article] });
        } catch(e) {
          sendResponse({ ok: false, error: e.message });
        }
        return;
      }
      if (msg.type === 'PRICE_REFRESH_ALL') {
        await checkAllPrices();
        sendResponse({ ok: true });
        return;
      }
      if (msg.type === 'OPEN_TRACKER') {
        await chrome.tabs.create({ url: chrome.runtime.getURL('tracker.html') });
        sendResponse({ ok: true });
        return;
      }
      if (msg.type === 'EXPORT_JSON') {
        const store = await getStore();
        const exportData = {
          exported_at: new Date().toISOString(),
          products: Object.values(store.products || {}),
          total_count: Object.keys(store.products || {}).length,
          last_stats: store.lastStats
        };
        sendResponse({ ok: true, data: exportData });
        return;
      }
      if (msg.type === 'GET_CACHE_INFO') {
        sendResponse({
          cache: CACHE,
          endpoints: API_ENDPOINTS.length
        });
        return;
      }
    } catch(e) {
      console.error('Message handler error:', e);
      sendResponse({ ok: false, error: e.message });
    }
  })();
  return true;
});
chrome.alarms.create('wbPriceCheck', { periodInMinutes: CHECK_INTERVAL });
console.log(`[1000fps] Автообновление: каждые ${CHECK_INTERVAL} мин`);

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'wbPriceCheck') {
    checkAllPrices();
  }
});
const PARSED_TABS = new Set();
const PARSING_IN_PROGRESS = new Set();
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url || !tab.url.includes('wildberries.ru/catalog/')) return;
  const match = tab.url.match(/catalog\/(\d+)\/detail/);
  if (!match || !match[1]) return;
  const article = match[1];
  const cacheKey = `${tabId}-${article}`;
  if (PARSED_TABS.has(cacheKey) || PARSING_IN_PROGRESS.has(cacheKey)) return;
  const settings = await chrome.storage.local.get(['autoParseEnabled']);
  if (settings.autoParseEnabled === false) return;
  const store = await getStore();
  PARSED_TABS.add(cacheKey);
  PARSING_IN_PROGRESS.add(cacheKey);
  setTimeout(() => {
    PARSED_TABS.delete(cacheKey);
    PARSING_IN_PROGRESS.delete(cacheKey);
  }, 300000);
  console.log(`[1000fps]  Автопарсинг: ${article}`);
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const productInfo = await fetchProductInfo(article);
    if (productInfo && productInfo.price) {
      const store = await getStore();
      store.products[article] = {
        ...productInfo,
        addedAt: new Date().toISOString(),
        history: [{ price: productInfo.price, ts: new Date().toISOString() }]
      };
      await saveStore(store);
      console.log(`[1000fps]  Спарсено: ${article} - ${productInfo.price}₽`);
      // Send to server webhook
      await sendToWebhook(article, productInfo);
      chrome.runtime.sendMessage({ type: 'PRICES_UPDATED', article }).catch(() => {});
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '1000fps WB Парсер',
        message: `Цена для ${article}: ${productInfo.price}₽`
      }, (id) => {
        if (chrome.runtime.lastError) {
          console.log('[1000fps] Уведомление не показано:', chrome.runtime.lastError.message);
        }
      });
      const { autoCloseEnabled } = await chrome.storage.local.get('autoCloseEnabled');
      if (autoCloseEnabled === true) {
        setTimeout(async () => {
          try {
            await chrome.tabs.remove(tabId);
            console.log(`[1000fps]  Вкладка ${tabId} закрыта`);
          } catch (e) {
            console.error('[1000fps] Ошибка закрытия:', e);
          }
        }, 2000);
      }
    }
    PARSING_IN_PROGRESS.delete(cacheKey);
  } catch (e) {
    console.error(`[1000fps] ❌ Ошибка парсинга ${article}:`, e.message);
    PARSING_IN_PROGRESS.delete(cacheKey);
  }
});
console.log('[1000fps WB Парсер]  Автономный режим запущен');
console.log('[1000fps] Endpoint\'ов:', API_ENDPOINTS.length);
