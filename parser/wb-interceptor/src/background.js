'use strict';

// ============================================================
// CONFIG - Server webhook URL

const SERVER_WEBHOOK_URL = 'http://72.56.240.16:3000/api/admin/parser/webhook';

// Проверяем storage на запросы парсинга каждые 2 секунды
setInterval(async () => {
  try {
    const data = await chrome.storage.local.get('wb_parser_request');
    if (data.wb_parser_request) {
      const req = data.wb_parser_request;
      // Удаляем старые запросы (старше 60 секунд)
      if (Date.now() - req.timestamp > 60000) {
        await chrome.storage.local.remove('wb_parser_request');
        return;
      }
      
      console.log('[1000fps] Получен запрос на парсинг из админки:', req);
      
      // Открываем вкладку с товаром
      const tab = await chrome.tabs.create({ url: req.source, active: true });
      
      // Ждём загрузки страницы
      const checkLoaded = setInterval(async () => {
        try {
          const [tabInfo] = await chrome.tabs.query({ id: tab.id });
          if (tabInfo && tabInfo.status === 'complete') {
            clearInterval(checkLoaded);
            
            // Получаем данные через content script
            const results = await chrome.tabs.sendMessage(tab.id, { type: 'PARSE_CURRENT_PAGE' });
            
            if (results && results.price) {
              // Сохраняем результат
              await chrome.storage.local.set({
                wb_parser_result: {
                  article: req.article,
                  source: req.source,
                  price: results.price,
                  oldPrice: results.oldPrice || null,
                  name: results.name || null,
                  timestamp: Date.now(),
                }
              });
              
              console.log('[1000fps] Результат парсинга:', results);
              
              // Можно закрыть вкладку
              // chrome.tabs.remove(tab.id);
            } else {
              console.error('[1000fps] Не удалось получить данные со страницы');
            }
            
            // Удаляем запрос
            await chrome.storage.local.remove('wb_parser_request');
          }
        } catch (e) {
          console.error('[1000fps] Ошибка при ожидании загрузки:', e);
        }
      }, 1000);
    }
  } catch (e) {
    // ignore
  }
}, 2000);

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
// ============================================================
// DELIVERY DATE PARSING — порт Python-логики
// Три стратегии в порядке приоритета:
//   1. Класс содержит 'deliveryTitleWrapper' (до хеша CSS-модуля)
//   2. SVG иконки доставки → ближайший родитель с датой
//   3. Брутфорс — любой лёгкий элемент с русским месяцем
// ============================================================

const MONTHS_RU = {
  'января': 1, 'февраля': 2, 'марта': 3, 'апреля': 4,
  'мая': 5, 'июня': 6, 'июля': 7, 'августа': 8,
  'сентября': 9, 'октября': 10, 'ноября': 11, 'декабря': 12
};

// Тот же паттерн что в питоне: «4 мая» или «4 мая 2026»
const DATE_PATTERN = /(\d{1,2})\s+([а-яёА-ЯЁ]+)(?:\s+(\d{4}))?/;

/**
 * Извлекает дату из строки с русским месяцем.
 * @param {string} text
 * @returns {Date|null}
 */
function extractDateFromText(text) {
  text = text.replace(/[\s\u00a0]+/g, ' ').trim().toLowerCase();

  // Ключевые слова: «сегодня» / «завтра» / «послезавтра»
  if (/сегодня/.test(text)) {
    return new Date();
  }
  if (/послезавтра/.test(text)) {
    const d = new Date(); d.setDate(d.getDate() + 2); return d;
  }
  if (/завтра/.test(text)) {
    const d = new Date(); d.setDate(d.getDate() + 1); return d;
  }

  const match = DATE_PATTERN.exec(text);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const monthName = match[2].toLowerCase();
  const monthNum = MONTHS_RU[monthName];
  if (!monthNum) return null;

  const hasYear = !!match[3];
  const year = hasYear ? parseInt(match[3], 10) : new Date().getFullYear();
  let result = new Date(year, monthNum - 1, day);

  // Если год не указан и дата уже прошла — берём следующий год
  if (!hasYear && result < new Date()) {
    result = new Date(year + 1, monthNum - 1, day);
  }
  return result;
}

/**
 * Считает количество дней от сегодня до целевой даты.
 * Использует UTC-полночь обоих значений во избежание timezone-сдвигов.
 * @param {Date} date
 * @returns {number}
 */
function dateToDaysFromNow(date) {
  const n = new Date();
  const nowUtc  = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
  const destUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.max(0, Math.round((destUtc - nowUtc) / 86400000));
}

/**
 * Инжектирует скрипт в вкладку WB и ищет дату доставки по DOM.
 * Повторяет три стратегии Python find_delivery_wrapper.
 * @param {number} tabId
 * @returns {Promise<{deliveryMin:number, deliveryMax:number, deliveryDate:string}|null>}
 */
async function getDeliveryDateFromTab(tabId) {
  try {
    // Guard: scripting permission may be absent in some installs
    if (!chrome.scripting) {
      console.warn('[1000fps] chrome.scripting недоступен — добавьте "scripting" в манифест');
      return null;
    }
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const DATE_RE = /(\d{1,2})\s+([а-яёА-ЯЁ]+)(?:\s+(\d{4}))?/;
        // Вспомогательная функция: элемент «подходит» если содержит дату или ключевое слово
        const hasDate = (txt) => DATE_RE.test(txt) || /завтра|сегодня|послезавтра/i.test(txt);

        // Стратегия 1: класс содержит 'deliveryTitleWrapper' (до хеша)
        for (const el of document.querySelectorAll('[class]')) {
          if ([...el.classList].some(c => /deliveryTitleWrapper/i.test(c))) {
            return el.textContent;
          }
        }

        // Стратегия 2: SVG с path иконки посылки WB → ищем родителя с датой
        const ICON_PATH_RE = /M11\.2239\s+1\.24175/;
        for (const svg of document.querySelectorAll('svg')) {
          let found = false;
          for (const path of svg.querySelectorAll('path')) {
            if (ICON_PATH_RE.test(path.getAttribute('d') || '')) {
              found = true;
              break;
            }
          }
          // Запасной вариант: класс deliveryIcon
          if (!found) {
            found = [...(svg.classList || [])].some(c => /deliveryIcon/i.test(c));
          }
          if (found) {
            for (let p = svg.parentElement; p; p = p.parentElement) {
              if (hasDate(p.textContent)) return p.textContent;
            }
          }
        }

        // Стратегия 3: брутфорс — любой некрупный элемент с датой или ключевым словом
        for (const el of document.querySelectorAll('*')) {
          if (hasDate(el.textContent) && el.children.length < 6) {
            return el.textContent;
          }
        }

        return null;
      }
    });

    const text = results?.[0]?.result;
    if (!text) return null;

    const date = extractDateFromText(text);
    if (!date) return null;

    const days = dateToDaysFromNow(date);
    return {
      deliveryMin: days,
      deliveryMax: days + 1,
      deliveryDate: date.toISOString().split('T')[0], // «2026-05-04»
    };
  } catch (e) {
    console.warn('[1000fps] Не удалось спарсить дату доставки из DOM:', e.message);
    return null;
  }
}

/**
 * Фолбэк: вычисляет диапазон доставки из API-поля time1.
 * Используется когда tabId недоступен (плановая проверка цен).
 */
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
      // Парсинг по URL с страницы админки
      if (msg.type === 'PRICE_PARSE') {
        console.log('[1000fps] PRICE_PARSE:', msg);
        
        // Получаем список артикулов из URL
        const articles = [];
        for (const source of msg.sources || []) {
          // Извлекаем артикул из URL типа https://www.wildberries.ru/catalog/12345678/detail.aspx
          const match = source.match(/catalog\/(\d+)/);
          if (match) {
            articles.push(match[1]);
          }
        }
        
        if (articles.length === 0) {
          sendResponse({ ok: false, error: 'Не найдены артикулы в URL' });
          return;
        }
        
        // Парсим первый артикул
        const article = articles[0];
        try {
          const info = await fetchProductInfo(article);
          if (!info || !info.price) {
            sendResponse({ ok: false, error: 'Товар не найден или нет цены' });
            return;
          }
          
          console.log('[1000fps] PRICE_PARSE результат:', info);
          sendResponse({ ok: true, parsedData: info, results: [{ url: msg.sources[0], success: true, data: info }] });
        } catch (e) {
          console.error('[1000fps] PRICE_PARSE ошибка:', e);
          sendResponse({ ok: false, error: e.message });
        }
        return;
      }
      
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
          // Получаем реальную дату доставки из DOM вкладки (стратегии как в Python)
          const tabDelivery = sender?.tab?.id
            ? await getDeliveryDateFromTab(sender.tab.id)
            : null;
          if (tabDelivery) {
            Object.assign(info, tabDelivery);
            console.log(`[1000fps] 📦 Дата доставки из DOM: ${tabDelivery.deliveryDate} (${tabDelivery.deliveryMin} дн.)`);
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
// ============================================================
// URL-парсинг: все паттерны WB где артикул в URL
// ============================================================
const WB_ARTICLE_PATTERNS = [
  /wildberries\.ru\/catalog\/(\d+)\/detail/,   // .../catalog/123/detail.aspx
  /wildberries\.ru\/catalog\/(\d+)\/?(?:[?#]|$)/, // .../catalog/123/ или /catalog/123
  /wildberries\.ru\/catalog\/(\d+)\/[a-z-]+/,  // .../catalog/123/otzyvy и пр.
  /[?&]nm=(\d+)/,                              // API/поиск: ?nm=123
  /[?&]article=(\d+)/,                         // альтернативный query-param
];

/**
 * Извлекает артикул WB из URL страницы.
 * @param {string} url
 * @returns {string|null}
 */
function extractArticleFromUrl(url) {
  for (const re of WB_ARTICLE_PATTERNS) {
    const m = url.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

// Ключевые слова: автопарсинг только если URL содержит одно из них
// (позволяет ограничить парсинг страницами товаров, а не всем WB)
const KEYWORD_ALLOWLIST = [
  'catalog', 'detail', 'card', 'product', 'item'
];

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url || !tab.url.includes('wildberries.ru')) return;

  // Фильтр по ключевым словам — не парсим главную, поиск, категории без товара
  const urlLower = tab.url.toLowerCase();
  const hasKeyword = KEYWORD_ALLOWLIST.some(kw => urlLower.includes(kw));
  if (!hasKeyword) return;

  const article = extractArticleFromUrl(tab.url);
  if (!article) return;
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
      const tabDelivery = await getDeliveryDateFromTab(tabId);
      if (tabDelivery) {
        Object.assign(productInfo, tabDelivery);
        console.log(`[1000fps] 📦 Дата доставки из DOM: ${tabDelivery.deliveryDate} (${tabDelivery.deliveryMin} дн.)`);
      }
      const store = await getStore();
      store.products[article] = {
        ...productInfo,
        addedAt: new Date().toISOString(),
        history: [{ price: productInfo.price, ts: new Date().toISOString() }]
      };
      await saveStore(store);
      console.log(`[1000fps]  Спарсено: ${article} - ${productInfo.price}₽`);
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
