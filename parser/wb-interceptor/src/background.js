"use strict";

// ===================== 1000fps WB ПАРСЕР =====================
// Адаптивный парсер с поддержкой нескольких API endpoint'ов
// Синхронизация с сервером 1000fps

// Локальный сервер (базовый URL)
const BACKEND_BASE = "http://localhost:3002";

// Webhook URL для отправки данных на сервер
const BACKEND_URL = `${BACKEND_BASE}/webhook`;

// API для синхронизации с сервером
const SYNC_API_URL = `${BACKEND_BASE}/api/wb/products`;

// === КОНФИГУРАЦИЯ API ===
// Актуальный endpoint WB (www.wildberries.ru/__internal/card/cards/v4/detail)
const API_ENDPOINTS = [
  // v4/detail - основной рабочий endpoint
  (article, dest) =>
    `https://www.wildberries.ru/__internal/card/cards/v4/detail?appType=1&curr=rub&dest=${dest}&spp=30&hide_vflags=4294967296&ab_testing=false&lang=ru&nm=${article}`,

  // v4/detail без hide_vflags - запасной
  (article, dest) =>
    `https://www.wildberries.ru/__internal/card/cards/v4/detail?appType=1&curr=rub&dest=${dest}&spp=30&lang=ru&nm=${article}`,
];

// Актуальный dest для Москвы (старый, но рабочий)
const DEFAULT_DEST = "123585942";

// === КЭШИРОВАНИЕ ПАРАМЕТРОВ ===
const CACHE = {
  dest: null,
  destTs: 0,
  workingEndpoint: 0, // индекс рабочего endpoint
  lastError: null,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 минут

// ===================== ФУНКЦИИ =====================

// Получение dest из localStorage страницы WB
function getDestFromPage() {
  try {
    const geoStr =
      localStorage.getItem("wba-geo") ||
      localStorage.getItem("x-wba-geo") ||
      "";
    const m = geoStr.match(/"?dest"?\s*:\s*"?(-?\d+)"?/);
    if (m) return m[1];
  } catch (e) {}
  return "123585942"; // рабочий dest для Москвы
}

// Расчёт номера корзины для старого CDN
function getBasketOld(vol) {
  // Старый формат: basket-XX.wbbasket.ru
  if (vol >= 0 && vol <= 143) return "01";
  if (vol >= 144 && vol <= 287) return "02";
  if (vol >= 288 && vol <= 431) return "03";
  if (vol >= 432 && vol <= 719) return "04";
  if (vol >= 720 && vol <= 1007) return "05";
  if (vol >= 1008 && vol <= 1061) return "06";
  if (vol >= 1062 && vol <= 1115) return "07";
  if (vol >= 1116 && vol <= 1169) return "08";
  if (vol >= 1170 && vol <= 1313) return "09";
  if (vol >= 1314 && vol <= 1601) return "10";
  if (vol >= 1602 && vol <= 1655) return "11";
  if (vol >= 1656 && vol <= 1919) return "12";
  if (vol >= 1920 && vol <= 2045) return "13";
  if (vol >= 2046 && vol <= 2189) return "14";
  if (vol >= 2190 && vol <= 2405) return "15";
  if (vol >= 2406 && vol <= 2621) return "16";
  if (vol >= 2622 && vol <= 2837) return "17";
  if (vol >= 2838 && vol <= 3053) return "18";
  if (vol >= 3054 && vol <= 3269) return "19";
  if (vol >= 3270 && vol <= 3485) return "20";
  return "21";
}

// Извлечение цены из разных форматов ответа
function extractPrice(product) {
  let price = null;
  let originalPrice = null;

  // Проверяем, есть ли товар в наличии
  const totalQuantity = product.totalQuantity || 0;
  if (totalQuantity === 0) {
    console.log(`[1000fps] Товар отсутствует на складах (totalQuantity=0)`);
    return { price: null, originalPrice: null, outOfStock: true };
  }

  // Формат 1: sizes[0].price.product/basic
  if (product.sizes && product.sizes[0] && product.sizes[0].price) {
    const p = product.sizes[0].price;
    if (p.product) price = Math.round(p.product / 100);
    if (p.basic) originalPrice = Math.round(p.basic / 100);
  }

  // Формат 1.1: sizes[0].price.total/old
  if (!price && product.sizes && product.sizes[0] && product.sizes[0].price) {
    const p = product.sizes[0].price;
    if (p.total) price = Math.round(p.total / 100);
    if (p.old && !originalPrice) originalPrice = Math.round(p.old / 100);
  }

  // Формат 2: salePriceU / priceU (копейки)
  if (!price && product.salePriceU)
    price = Math.round(product.salePriceU / 100);
  if (!originalPrice && product.priceU)
    originalPrice = Math.round(product.priceU / 100);

  // Формат 3: salePrice / price (рубли)
  if (!price && typeof product.salePrice === "number")
    price = product.salePrice;
  if (!originalPrice && typeof product.price === "number")
    originalPrice = product.price;

  // Формат 4: salePrice / price (строки с валютой)
  if (!price && typeof product.salePrice === "string") {
    price = parseFloat(product.salePrice.replace(/[^0-9.]/g, ""));
  }
  if (!originalPrice && typeof product.price === "string" && !price) {
    originalPrice = parseFloat(product.price.replace(/[^0-9.]/g, ""));
  }

  // Формат 5: prices[0].value / prices[0].oldValue (массив цен)
  if (
    !price &&
    product.prices &&
    Array.isArray(product.prices) &&
    product.prices[0]
  ) {
    if (product.prices[0].value)
      price = Math.round(product.prices[0].value / 100);
    if (product.prices[0].oldValue && !originalPrice)
      originalPrice = Math.round(product.prices[0].oldValue / 100);
  }

  // Формат 6: salePriceObj / priceObj (объекты с value)
  if (!price && product.salePriceObj && product.salePriceObj.value) {
    price = Math.round(product.salePriceObj.value / 100);
  }
  if (!originalPrice && product.priceObj && product.priceObj.value) {
    originalPrice = Math.round(product.priceObj.value / 100);
  }

  // Формат 7: currentPrice / basePrice (числа в копейках)
  if (!price && typeof product.currentPrice === "number") {
    price = Math.round(product.currentPrice / 100);
  }
  if (!originalPrice && typeof product.basePrice === "number") {
    originalPrice = Math.round(product.basePrice / 100);
  }

  // Формат 8: priceRub / salePriceRub (цена в рублях сразу)
  if (!price && typeof product.priceRub === "number") price = product.priceRub;
  if (!originalPrice && typeof product.salePriceRub === "number")
    originalPrice = product.salePriceRub;

  // Формат 9: saleprice / price (lowercase)
  if (!price && typeof product.saleprice === "number")
    price = product.saleprice;
  if (!originalPrice && typeof product.price === "number")
    originalPrice = product.price;

  return { price, originalPrice, outOfStock: totalQuantity === 0 };
}

// Извлечение количества товара со складов
function extractStockQuantity(product) {
  // Приоритет 1: totalQuantity (основное поле)
  if (typeof product.totalQuantity === "number") {
    return product.totalQuantity;
  }

  // Приоритет 2: sizes[0].stocks[].qty - сумма количества по всем складам
  if (
    product.sizes &&
    Array.isArray(product.sizes) &&
    product.sizes.length > 0
  ) {
    const firstSize = product.sizes[0];
    if (firstSize.stocks && Array.isArray(firstSize.stocks)) {
      const total = firstSize.stocks.reduce((sum, stock) => {
        return sum + (typeof stock.qty === "number" ? stock.qty : 0);
      }, 0);
      if (total > 0) return total;
    }
  }

  // Приоритет 3: sum (сумма остатков)
  if (typeof product.sum === "number") {
    return product.sum;
  }

  // Приоритет 4: availableQuantity
  if (typeof product.availableQuantity === "number") {
    return product.availableQuantity;
  }

  // Приоритет 5: stocks - массив складов, суммируем
  if (Array.isArray(product.stocks) && product.stocks.length > 0) {
    const total = product.stocks.reduce((sum, stock) => {
      return sum + (typeof stock.qty === "number" ? stock.qty : 0);
    }, 0);
    if (total > 0) return total;
  }

  // Приоритет 6: quantity
  if (typeof product.quantity === "number") {
    return product.quantity;
  }

  return 0;
}

// Извлечение сроков доставки
function extractDeliveryDays(product) {
  let deliveryMin = null;
  let deliveryMax = null;

  // Приоритет 1: time1/time2 из sizes/stocks
  // time1 - минимальное время обработки (дни)
  // time2 - максимальное время обработки (часы/дни, может быть большим)
  // Для отображения используем time1 как основной срок
  if (typeof product.time1 === "number") {
    // Если time1 <= 24, считаем что это часы, конвертируем в дни
    if (product.time1 <= 24) {
      deliveryMin = Math.ceil(product.time1 / 24);
    } else {
      deliveryMin = product.time1;
    }

    // deliveryMax = deliveryMin + 1 день (ориентировочно)
    deliveryMax = deliveryMin + 1;
  }

  // Если time1 не найден, пробуем другие форматы
  if (deliveryMin === null) {
    // Приоритет 2: deliveryData / delivery - объект с deliveryDays
    const deliveryData = product.deliveryData || product.delivery;
    if (deliveryData) {
      if (typeof deliveryData.deliveryDaysMin === "number") {
        deliveryMin = deliveryData.deliveryDaysMin;
      } else if (typeof deliveryData.minDays === "number") {
        deliveryMin = deliveryData.minDays;
      }

      if (typeof deliveryData.deliveryDaysMax === "number") {
        deliveryMax = deliveryData.deliveryDaysMax;
      } else if (typeof deliveryData.maxDays === "number") {
        deliveryMax = deliveryData.maxDays;
      }

      // deliveryTime - строка вида "3-5 дней"
      if (deliveryMin === null && deliveryData.deliveryTime) {
        const match = String(deliveryData.deliveryTime).match(
          /(\d+)\s*[-–—]\s*(\d+)/,
        );
        if (match) {
          deliveryMin = parseInt(match[1], 10);
          deliveryMax = parseInt(match[2], 10);
        }
      }
    }

    // Приоритет 3: deliveryPeriod - строка вида "3-5 дн."
    if (deliveryMin === null && product.deliveryPeriod) {
      const match = String(product.deliveryPeriod).match(
        /(\d+)\s*[-–—]\s*(\d+)/,
      );
      if (match) {
        deliveryMin = parseInt(match[1], 10);
        deliveryMax = parseInt(match[2], 10);
      }
    }

    // Приоритет 4: estimatedDeliveryDate - дата, вычисляем дни
    if (deliveryMin === null && product.estimatedDeliveryDate) {
      const estimatedDate = new Date(product.estimatedDeliveryDate);
      const now = new Date();
      const diffDays = Math.ceil((estimatedDate - now) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        deliveryMin = diffDays;
        deliveryMax = diffDays + 1;
      }
    }
  }

  // Если всё ещё не нашли, ставим дефолтное значение
  if (deliveryMin === null) {
    deliveryMin = 2; // "послезавтра" по умолчанию
    deliveryMax = 4;
  }

  return { deliveryMin, deliveryMax };
}

// Извлечение данных о товаре из разных структур ответа
function extractProductData(article, data) {
  // Пытаемся найти товар в разных форматах ответа

  // Формат 1: data.data.products[0]
  let product = data?.data?.products?.[0];

  // Формат 2: data.products[0]
  if (!product) product = data?.products?.[0];

  // Формат 3: data.card (для card.wb.ru)
  if (!product) product = data?.card;

  // Формат 4: data (если это сам товар)
  if (!product && data?.id) product = data;

  if (!product) {
    console.warn(
      `[1000fps] Не удалось найти товар в ответе для ${article}. Структура:`,
      JSON.stringify(data).slice(0, 500),
    );
    return null;
  }

  // Извлекаем цену (адаптивно)
  const { price, originalPrice, outOfStock } = extractPrice(product);

  // Извлекаем количество товара
  const stockQuantity = extractStockQuantity(product);

  // Извлекаем сроки доставки (time1/time2 из sizes/stocks)
  const { deliveryMin, deliveryMax } = extractDeliveryDays(product);

  // Отладочный вывод если цена не найдена
  if (!price) {
    console.warn(
      `[1000fps] Цена не найдена для ${article}. Данные товара:`,
      JSON.stringify(product).slice(0, 1000),
    );
  }

  // Отладочная информация о количестве и доставке
  console.log(
    `[1000fps] 📦 ${article}: stock=${stockQuantity}, delivery=${deliveryMin}-${deliveryMax} дн.`,
  );

  // Извлекаем ID товара
  const id = product.id || product.nmId || product.article;

  // Извлекаем название из разных полей (WB может использовать разные форматы)
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
    description: "",
    brand:
      product.brand || product.brandName || product.selling?.brand_name || "",
    price,
    originalPrice,
    rating: product.reviewRating || product.rating || null,
    feedbacks: product.feedbacks || product.feedbackCount || 0,
    imageUrl: "",
    url: `https://www.wildberries.ru/catalog/${article}/detail.aspx`,
    checkedAt: new Date().toISOString(),
    specifications: product.options || product.grouped_options || [],
    stockQuantity, // Количество товара
    deliveryMin, // Мин. срок доставки (дней)
    deliveryMax, // Макс. срок доставки (дней)
    outOfStock: outOfStock || stockQuantity === 0,
    _raw: {
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
    },
  };
}

// Find the best available WB tab for script injection
// Prefers complete tabs on www.wildberries.ru, falls back to any ready WB tab
async function getWBTab() {
  try {
    const tabs = await chrome.tabs.query({});

    // Фильтруем только валидные вкладки WB
    const wbTabs = tabs.filter(
      (t) =>
        t.url &&
        t.url.includes("wildberries.ru") &&
        !t.url.startsWith("chrome://") &&
        !t.url.startsWith("about:"),
    );

    // Priority 1: complete tab on www.wildberries.ru
    let tab = wbTabs.find(
      (t) =>
        t.status === "complete" &&
        /https:\/\/(www\.)?wildberries\.ru\//.test(t.url),
    );

    // Priority 2: any tab on wildberries.ru regardless of status
    if (!tab) {
      tab = wbTabs.find((t) => t.status === "complete");
    }

    // Priority 3: any WB tab even if not complete
    if (!tab) {
      tab = wbTabs[0];
    }

    return tab || null;
  } catch (e) {
    console.error("[1000fps] Error finding WB tab:", e.message);
    return null;
  }
}

// Fetch product info via the user's WB tab context so real session cookies are sent
async function fetchProductInfo(article) {
  let tab = await getWBTab();

  if (!tab) {
    throw new Error(
      "Нет открытых вкладок wildberries.ru. Откройте WB в браузере и попробуйте снова.",
    );
  }

  // Проверяем, что вкладка не показывает ошибку
  if (
    tab.status !== "complete" ||
    (tab.url && tab.url.startsWith("chrome://"))
  ) {
    throw new Error("Вкладка не готова или невалидна");
  }

  // Refresh dest from the page if cache is stale
  if (!CACHE.dest || Date.now() - CACHE.destTs > CACHE_TTL) {
    try {
      const destResult = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: "MAIN",
        func: getDestFromPage,
      });
      const d = destResult?.[0]?.result;
      if (d) {
        CACHE.dest = d;
        CACHE.destTs = Date.now();
      }
    } catch (e) {
      // Non-fatal: will use DEFAULT_DEST
      console.warn("[1000fps] Не удалось получить dest:", e.message);
    }
  }

  const dest = CACHE.dest || DEFAULT_DEST;
  let lastError = null;

  for (let i = CACHE.workingEndpoint; i < API_ENDPOINTS.length; i++) {
    // Fix 6: ограничиваем количество смен вкладки на один endpoint
    let tabSwitchAttempts = 0;
    const MAX_TAB_SWITCHES = 2;

    try {
      const url = API_ENDPOINTS[i](article, dest);

      // Проверяем, что вкладка всё ещё существует и готова
      try {
        const tabCheck = await chrome.tabs.get(tab.id);
        if (
          !tabCheck ||
          tabCheck.status !== "complete" ||
          !tabCheck.url ||
          !tabCheck.url.includes("wildberries.ru")
        ) {
          tab = await getWBTab();
          if (!tab) {
            lastError = "Нет доступных вкладок WB";
            break;
          }
        }
      } catch (e) {
        console.warn(`[1000fps] Вкладка ${tab.id} недоступна, ищем новую`);
        tab = await getWBTab();
        if (!tab) {
          lastError = "Нет доступных вкладок WB";
          break;
        }
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: "MAIN",
        func: fetchFromUrl,
        args: [url],
      });

      const res = results?.[0]?.result;

      if (!res) {
        lastError = "Нет ответа от вкладки WB";
        continue;
      }
      if (res.error) {
        lastError = res.error;
        if (res.error.startsWith("HTTP ")) {
          console.warn(
            `[1000fps] ${res.error} для endpoint ${i}, пробуем следующий`,
          );
        }
        continue;
      }

      CACHE.workingEndpoint = i;
      CACHE.lastError = null;

      const product = extractProductData(article, res.data || res);
      if (!product) {
        lastError = "Не удалось извлечь данные товара";
        continue;
      }
      if (!product.price) {
        lastError = "Цена не найдена в ответе";
        continue;
      }

      delete product._raw;
      return product;
    } catch (e) {
      lastError = e.message;
      console.warn(`[1000fps] Попытка ${i} не удалась:`, e.message);

      if (
        e.message &&
        (e.message.includes("Cannot access") || e.message.includes("Frame")) &&
        tabSwitchAttempts < MAX_TAB_SWITCHES
      ) {
        const freshTab = await getWBTab();
        if (freshTab && freshTab.id !== tab.id) {
          console.warn(
            `[1000fps] Вкладка ${tab.id} недоступна, пробуем ${freshTab.id}`,
          );
          tab = freshTab;
          tabSwitchAttempts++;
          i--; // повторяем тот же endpoint с новой вкладкой
          continue;
        }
      }
      // Превышен лимит смен вкладки или нет альтернативы — переходим к следующему endpoint
    }
  }

  throw new Error(
    `Не удалось получить данные. Последняя ошибка: ${lastError || "неизвестно"}`,
  );
}

// Эта функция выполняется в контексте страницы
function fetchFromUrl(url) {
  return (async function () {
    try {
      // Проверяем, что мы всё ещё в контексте страницы
      if (!window || !window.fetch) {
        return { error: "Недоступен контекст страницы" };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд таймаут

      const response = await fetch(url, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "User-Agent": navigator.userAgent,
          Referer: "https://www.wildberries.ru/",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return { error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { data };
    } catch (e) {
      // Более подробная информация об ошибке
      if (e.name === "AbortError") {
        return { error: "Таймаут запроса" };
      }
      if (e.name === "TypeError") {
        return { error: "Ошибка сети: " + e.message };
      }
      return { error: e.message || "Неизвестная ошибка" };
    }
  })();
}

// Get all products from storage
async function getStore() {
  try {
    const data = await chrome.storage.local.get("wbPrices");
    return data.wbPrices || { products: {} };
  } catch (e) {
    console.error("Get store error:", e);
    return { products: {} };
  }
}

// Save store to storage
async function saveStore(store) {
  try {
    await chrome.storage.local.set({ wbPrices: store });
  } catch (e) {
    console.error("Save store error:", e);
  }
}

// ===================== MULTI-SOURCE PARSING =====================
// Загружает источники с сервера и парсит по приоритету с fallback

/**
 * Загрузить список источников для товара с сервера
 * @param {string} article - Артикул товара (основной или любой из источников)
 * @returns {Promise<Array>} Массив источников, отсортированных по приоритету
 */
async function getProductSources(article) {
  const { backendUrl } = await chrome.storage.local.get("backendUrl");
  const BACKEND = backendUrl || "http://localhost:3002";

  console.log(`[1000fps] 🔍 Поиск источников для ${article}...`);

  try {
    // 1. Ищем товар по основному артикулу (wb_article)
    let productId = null;

    // Пробуем найти по wb_article
    console.log(`[1000fps] Поиск по wb_article: ${article}`);
    const res = await fetch(`${BACKEND}/api/wb/products/${article}`);
    if (res.ok) {
      const result = await res.json();
      if (result.ok && result.data && result.data.id) {
        productId = result.data.id;
        console.log(
          `[1000fps] ✅ Найдено по wb_article: product_id=${productId}`,
        );
      } else {
        console.log(`[1000fps] ❌ Не найдено по wb_article`);
      }
    } else {
      console.log(`[1000fps] ❌ Ошибка запроса: HTTP ${res.status}`);
    }

    // 2. Если не нашли, ищем по products API (search)
    if (!productId) {
      console.log(`[1000fps] Поиск по products API: ${article}`);
      const productsRes = await fetch(
        `${BACKEND}/api/products?search=${article}&limit=100`,
      );
      if (productsRes.ok) {
        const productsResult = await productsRes.json();
        if (productsResult.ok && productsResult.data) {
          // Ищем товар, у которого wb_article совпадает
          for (const product of productsResult.data) {
            if (product.wb_article === article) {
              productId = product.id;
              console.log(
                `[1000fps] ✅ Найдено по search: product_id=${productId}`,
              );
              break;
            }
          }
        }
      }
      if (!productId) {
        console.log(`[1000fps] ❌ Не найдено по products API`);
      }
    }

    if (!productId) {
      console.log(`[1000fps] ⚠️ Товар не найден в базе, источников не будет`);
      return [];
    }

    // 3. Загружаем источники для найденного товара
    console.log(`[1000fps] Загрузка источников для product_id=${productId}`);
    const sourcesRes = await fetch(
      `${BACKEND}/api/products/${productId}/sources`,
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!sourcesRes.ok) {
      console.warn(
        `[1000fps] ❌ Не удалось загрузить источники: HTTP ${sourcesRes.status}`,
      );
      return [];
    }

    const sourcesResult = await sourcesRes.json();
    if (!sourcesResult.ok) {
      console.warn(`[1000fps] ❌ Ошибка в ответе источников:`, sourcesResult);
      return [];
    }

    // Фильтруем только активные и сортируем по приоритету
    const sources = (sourcesResult.data || [])
      .filter((s) => s.is_active)
      .sort((a, b) => a.priority - b.priority);

    console.log(
      `[1000fps] ✅ Загружено ${sources.length} источников для product_id=${productId}:`,
      sources.map((s) => `${s.source_article}(p${s.priority})`).join(", "),
    );
    return sources;
  } catch (e) {
    console.warn(`[1000fps] ❌ Ошибка загрузки источников:`, e.message);
    return [];
  }
}

/**
 * Парсинг товара с fallback по источникам
 * @param {string} article - Артикул товара (основной)
 * @returns {Promise<Object|null>} Данные товара или null
 */
async function fetchProductWithSources(article) {
  // Загружаем источники
  const sources = await getProductSources(article);

  if (sources.length === 0) {
    console.log(`[1000fps] Нет источников для ${article}, парсим как обычно`);
    // Если нет источников, парсим основной артикул
    const info = await fetchProductInfo(article);
    if (info) {
      info.sourceArticle = article;
    }
    return info;
  }

  console.log(
    `[1000fps] Multi-source: ${sources.length} источников для ${article}`,
  );

  // Парсим источники по порядку
  for (const source of sources) {
    try {
      console.log(
        `[1000fps] Пробую источник ${source.source_article} (priority: ${source.priority})`,
      );

      const info = await fetchProductInfo(source.source_article);

      if (info && info.price) {
        console.log(
          `[1000fps] ✅ Успех: ${source.source_article} - ${info.price}₽`,
        );
        info.sourceArticle = source.source_article;
        info.sourceId = source.id;
        return info;
      }

      console.log(
        `[1000fps] ❌ Не удалось получить цену из ${source.source_article}`,
      );
    } catch (e) {
      console.warn(
        `[1000fps] Ошибка парсинга ${source.source_article}:`,
        e.message,
      );
    }
  }

  console.log(`[1000fps] ❌ Все источники недоступны для ${article}`);
  return null;
}

// Check all prices
async function checkAllPrices() {
  const store = await getStore();
  const articles = Object.keys(store.products || {});
  let successCount = 0;
  let errorCount = 0;
  let priceChangedCount = 0;
  let firstPriceCount = 0;
  let multiSourceCount = 0;

  console.log(`[1000fps] 🔄 Начинаем проверку ${articles.length} товаров...`);

  for (const article of articles) {
    try {
      // Multi-source: парсим с fallback по источникам
      const info = await fetchProductWithSources(article);

      if (!info || !info.price) {
        errorCount++;
        continue;
      }

      // Считаем количество товаров с несколькими источниками
      if (info.sourceArticle && info.sourceArticle !== article) {
        multiSourceCount++;
      }

      const product = store.products[article];
      const history = product.history || [];
      const lastPrice = history.length
        ? history[history.length - 1].price
        : null;

      // Notify if price changed
      if (lastPrice !== null && lastPrice !== info.price) {
        priceChangedCount++;
        const diff = info.price - lastPrice;
        console.log(
          `[1000fps] 💰 ${article}: ${lastPrice}₽ → ${info.price}₽ (${diff > 0 ? "+" : ""}${diff}₽)`,
        );

        // Browser notification
        try {
          await chrome.notifications.create(
            "wb-" + article + "-" + Date.now(),
            {
              type: "basic",
              iconUrl: "icons/icon128.png",
              title: "Цена изменилась: " + info.name.slice(0, 40),
              message:
                lastPrice +
                "₽ → " +
                info.price +
                "₽ (" +
                (diff > 0 ? "+" : "") +
                diff +
                "₽)",
            },
          );
        } catch (e) {}
      }

      // Notify if first price received
      if (lastPrice === null && info.price) {
        firstPriceCount++;
        console.log(`[1000fps] ✅ ${article}: первая цена ${info.price}₽`);
      }

      // Notify if out of stock
      if (info.outOfStock) {
        console.log(`[1000fps] ⚠️ ${article}: отсутствует на складах`);
      }

      // Сохраняем только если есть цена
      if (info.price) {
        // Добавляем в историю только если цена изменилась или это первая запись
        if (lastPrice === null || lastPrice !== info.price) {
          history.push({ price: info.price, ts: new Date().toISOString() });
          if (history.length > 300) history.splice(0, history.length - 300);
        }
      }

      store.products[article] = Object.assign({}, product, info, {
        history,
        addedAt: product.addedAt || new Date().toISOString(),
      });

      successCount++;

      // Отправляем обновленную цену на сервер с указанием источника
      await sendToServer(
        store.products[article],
        "update",
        0,
        info.sourceArticle,
      );
    } catch (e) {
      errorCount++;
      console.error(`[1000fps] ❌ Ошибка проверки ${article}:`, e.message);
    }
  }

  store.lastChecked = Date.now();
  store.lastStats = {
    success: successCount,
    errors: errorCount,
    priceChanged: priceChangedCount,
  };
  await saveStore(store);

  // Итоговое сообщение
  const changeMsg =
    priceChangedCount > 0 ? ` | 💰 Изменилось цен: ${priceChangedCount}` : "";
  const firstMsg =
    firstPriceCount > 0 ? ` | ✅ Первых цен: ${firstPriceCount}` : "";
  const multiMsg =
    multiSourceCount > 0 ? ` | 🔀 Multi-source: ${multiSourceCount}` : "";
  console.log(
    `[1000fps] ✅ Проверка завершена: ${successCount} успешно, ${errorCount} ошибок${changeMsg}${firstMsg}${multiMsg}`,
  );

  // Тестовое уведомление для проверки сервера
  if (successCount > 0) {
    const firstArticle = articles[0];
    const firstProduct = store.products[firstArticle];
    if (firstProduct && firstProduct.price) {
      console.log("[1000fps] 📤 Отправка данных на сервер...");
    }
  }

  // Notify popup/tracker
  chrome.runtime.sendMessage({ type: "PRICES_UPDATED" }).catch(() => {});
}

// Send data to server webhook

// Message handlers
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async function () {
    try {
      if (msg.type === "PRICE_ADD") {
        const store = await getStore();

        if (store.products[msg.article]) {
          sendResponse({ ok: false, error: "Уже добавлен" });
          return;
        }

        // ПРОВЕРКА: не является ли этот артикул резервным источником
        try {
          const sources = await getProductSources(msg.article);
          if (sources.length > 0) {
            sendResponse({
              ok: false,
              error: `Артикул ${msg.article} является резервным источником для другого товара. Добавьте основной товар.`,
            });
            return;
          }
        } catch (e) {
          // Игнорируем ошибки проверки
        }

        // Multi-source: парсим с fallback по источникам
        const info = await fetchProductWithSources(msg.article);

        if (!info) {
          sendResponse({ ok: false, error: "Товар не найден" });
          return;
        }

        if (info.error) {
          sendResponse({ ok: false, error: info.error });
          return;
        }

        if (!info.price) {
          sendResponse({ ok: false, error: "Цена не найдена" });
          return;
        }

        store.products[msg.article] = Object.assign({}, info, {
          history: [{ price: info.price, ts: new Date().toISOString() }],
          addedAt: new Date().toISOString(),
        });

        await saveStore(store);

        // Отправляем на сервер с указанием источника
        await sendToServer(
          store.products[msg.article],
          "add",
          0,
          info.sourceArticle,
        );

        sendResponse({ ok: true, product: store.products[msg.article] });
      }

      if (msg.type === "PRICE_REMOVE") {
        const store = await getStore();
        const product = store.products[msg.article];
        delete store.products[msg.article];
        await saveStore(store);

        // Удаляем с сервера
        if (product) {
          await fetch(`${SYNC_API_URL}/${msg.article}`, { method: "DELETE" });
        }
        sendResponse({ ok: true });
      }

      if (msg.type === "PRICE_GET_ALL") {
        const store = await getStore();
        sendResponse({ store });
      }

      if (msg.type === "PRICE_REFRESH_ONE") {
        const store = await getStore();
        const product = store.products[msg.article];

        if (!product) {
          sendResponse({ ok: false, error: "Не найден" });
          return;
        }

        // Multi-source: парсим с fallback по источникам
        const info = await fetchProductWithSources(msg.article);

        if (!info || info.error) {
          sendResponse({ ok: false, error: info?.error || "Ошибка" });
          return;
        }

        const history = product.history || [];
        const lastPrice = history.length
          ? history[history.length - 1].price
          : null;

        // Добавляем в историю только если цена изменилась или это первая запись
        if (lastPrice === null || lastPrice !== info.price) {
          history.push({ price: info.price, ts: new Date().toISOString() });
          if (history.length > 300) history.splice(0, history.length - 300);
        }

        store.products[msg.article] = Object.assign({}, product, info, {
          history,
        });
        await saveStore(store);

        // Уведомления только если цена изменилась
        if (lastPrice !== null && lastPrice !== info.price) {
          const prevPriceNum =
            typeof lastPrice === "string" ? parseFloat(lastPrice) : lastPrice;
          const priceNum =
            typeof info.price === "string"
              ? parseFloat(info.price)
              : info.price;
          console.log(
            `[1000fps] PRICE_REFRESH_ONE: ${msg.article} ${prevPriceNum}→${priceNum}, diff=${priceNum - prevPriceNum}`,
          );

          // Browser notification
          try {
            await chrome.notifications.create(
              "wb-" + msg.article + "-" + Date.now(),
              {
                type: "basic",
                iconUrl: "icons/icon128.png",
                title: "Цена изменилась: " + info.name.slice(0, 40),
                message:
                  lastPrice +
                  "₽ → " +
                  info.price +
                  "₽ (" +
                  (info.price > lastPrice ? "+" : "") +
                  (info.price - lastPrice) +
                  "₽)",
              },
            );
          } catch (e) {}
        }

        chrome.runtime.sendMessage({ type: "PRICES_UPDATED" }).catch(() => {});

        // Отправляем обновленные данные на сервер с указанием источника
        try {
          await sendToServer(
            store.products[msg.article],
            "update",
            0,
            info.sourceArticle,
          );
        } catch (e) {
          console.error("[1000fps] Send to server error:", e);
        }

        sendResponse({ ok: true, product: store.products[msg.article] });
      }

      if (msg.type === "PRICE_REFRESH_ALL") {
        await checkAllPrices();
        sendResponse({ ok: true });
      }

      if (msg.type === "OPEN_TRACKER") {
        await chrome.tabs.create({
          url: chrome.runtime.getURL("tracker.html"),
        });
        sendResponse({ ok: true });
      }

      if (msg.type === "EXPORT_JSON") {
        const store = await getStore();
        const exportData = {
          exported_at: new Date().toISOString(),
          products: Object.values(store.products || {}),
          total_count: Object.keys(store.products || {}).length,
          last_stats: store.lastStats,
        };
        sendResponse({ ok: true, data: exportData });
      }

      if (msg.type === "GET_CACHE_INFO") {
        sendResponse({
          cache: CACHE,
          endpoints: API_ENDPOINTS.length,
        });
      }

      if (msg.type === "SYNC_FROM_WORKER") {
        syncFromServer().then(async () => {
          const store = await getStore();
          sendResponse({
            ok: true,
            count: Object.keys(store.products || {}).length,
          });
        });
        return true; // async
      }
    } catch (e) {
      console.error("Message handler error:", e);
      sendResponse({ ok: false, error: e.message });
    }
  })();

  return true;
});

// Hourly alarm for price checks
async function initAlarm() {
  // Интервал по умолчанию (2 часа)
  let interval = 120;

  // Пытаемся получить интервал с локального сервера
  if (BACKEND_BASE) {
    try {
      const response = await fetch(`${BACKEND_BASE}/api/config`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.config && result.config.checkInterval) {
          interval = result.config.checkInterval;
        }
      }
    } catch (e) {
      // Сервер ещё не запущен или нет конфига
    }
  }

  // Создаём будильник для основной проверки (каждые N минут)
  chrome.alarms.create("wbPriceCheck", { periodInMinutes: interval });
  console.log(`[1000fps] Автообновление: каждые ${interval} мин`);
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "wbPriceCheck") {
    // checkAllPrices requires an open WB tab for script injection
    chrome.tabs.query({}, (tabs) => {
      const hasWBTab = tabs.some(
        (t) => t.url && t.url.includes("wildberries.ru"),
      );
      if (!hasWBTab) {
        console.log(
          "[1000fps] Нет открытой вкладки WB — пропускаем автопроверку. Откройте wildberries.ru.",
        );
        return;
      }
      checkAllPrices();
    });
  }

  // Быстрая проверка pending товаров (отключена из-за лимитов KV)
  // if (alarm.name === 'wbPendingCheck') { ... }
});

// Инициализация при старте
initAlarm();

// Очистка кэша при старте
CACHE.workingEndpoint = 0;
CACHE.lastError = null;
CACHE.dest = null;
CACHE.destTs = 0;

// Автоматический парсинг при открытии вкладки WB с артикулом
const PARSED_TABS = new Set();
const PARSING_IN_PROGRESS = new Set(); // Защита от параллельных запусков

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Реагируем только на завершение загрузки
  if (changeInfo.status !== "complete") return;

  // Проверяем, что это WB каталог
  if (!tab.url || !tab.url.includes("wildberries.ru/catalog/")) return;

  // Извлекаем артикул из URL
  const match = tab.url.match(/catalog\/(\d+)\/detail/);
  if (!match || !match[1]) return;

  const article = match[1];
  const cacheKey = `${tabId}-${article}`;

  // Защита от дублирования — проверяем ПЕРЕД любыми другими действиями
  if (PARSED_TABS.has(cacheKey)) {
    return; // Тихо пропускаем, без логов
  }

  // Защита от параллельных запусков
  if (PARSING_IN_PROGRESS.has(cacheKey)) {
    return; // Тихо пропускаем
  }

  // Проверяем, включён ли автопарсинг
  const settings = await new Promise((resolve) => {
    chrome.storage.local.get(["autoParseEnabled"], resolve);
  });

  // По умолчанию включено (если настройка не установлена)
  if (settings.autoParseEnabled === false) {
    console.log("[1000fps] ⏭️ Автопарсинг выключен, пропускаем");
    return;
  }

  // Помечаем как正在 парсинг
  PARSED_TABS.add(cacheKey);
  PARSING_IN_PROGRESS.add(cacheKey);

  // Очищаем кэш через 5 минут
  setTimeout(() => {
    PARSED_TABS.delete(cacheKey);
    PARSING_IN_PROGRESS.delete(cacheKey);
  }, 300000);

  console.log(`[1000fps] 🎯 Вкладка WB открыта, артикул: ${article}`);

  // Парсим цену
  try {
    console.log(`[1000fps] 🔄 Начинаем парсинг для ${article}...`);

    // Ждём немного для полной загрузки страницы
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Multi-source: парсим с fallback по источникам
    const productInfo = await fetchProductWithSources(article);

    if (productInfo && productInfo.price) {
      console.log(`[1000fps] 📊 Получены данные:`, productInfo);
      console.log(
        `[1000fps] 🔍 Сырые данные WB:`,
        JSON.stringify(productInfo._raw),
      );

      // Сохраняем в хранилище расширения
      const store = await getStore();
      store.products[article] = {
        ...productInfo,
        addedAt: new Date().toISOString(),
        history: [{ price: productInfo.price, ts: new Date().toISOString() }],
      };
      await saveStore(store);

      // Отправляем на сервер с указанием источника
      await sendToServer(productInfo, "update", 0, productInfo.sourceArticle);

      console.log(
        `[1000fps] ✅ Спарсено: ${article} - ${productInfo.price}₽${productInfo.sourceArticle && productInfo.sourceArticle !== article ? ` (источник: ${productInfo.sourceArticle})` : ""}`,
      );
      console.log(`[1000fps] 📤 Отправлено на сервер`);

      // Уведомляем popup
      chrome.runtime
        .sendMessage({ type: "PRICES_UPDATED", article })
        .catch(() => {});

      // Уведомление пользователя
      chrome.notifications.create(
        {
          type: "basic",
          iconUrl: "icons/icon128.png",
          title: "1000fps WB Парсер",
          message: `Цена для ${article}: ${productInfo.price}₽`,
        },
        (id) => {
          if (chrome.runtime.lastError) {
            console.log(
              "[1000fps] Уведомление не показано:",
              chrome.runtime.lastError.message,
            );
          }
        },
      );

      // Проверяем настройку автозакрытия
      const { autoCloseEnabled } =
        await chrome.storage.local.get("autoCloseEnabled");

      if (autoCloseEnabled === true) {
        // Закрываем вкладку через 2 секунды после успешного парсинга
        console.log(
          `[1000fps] 🔄 Закрываем вкладку ${tabId} через 2 секунды...`,
        );
        setTimeout(async () => {
          try {
            await chrome.tabs.remove(tabId);
            console.log(`[1000fps] ✅ Вкладка ${tabId} закрыта`);
          } catch (e) {
            console.error("[1000fps] Ошибка закрытия вкладки:", e);
          }
        }, 2000);
      } else {
        console.log(
          `[1000fps] ℹ️ Автозакрытие выключено, вкладка ${tabId} остаётся открытой`,
        );
      }

      // Очищаем флаг парсинга
      PARSING_IN_PROGRESS.delete(cacheKey);
    } else {
      console.error(`[1000fps] ❌ Не удалось получить цену:`, productInfo);
      PARSING_IN_PROGRESS.delete(cacheKey);
    }
  } catch (e) {
    console.error(`[1000fps] ❌ Ошибка парсинга ${article}:`, e.message);
    PARSING_IN_PROGRESS.delete(cacheKey);
  }
});

console.log("[1000fps WB Парсер] ✅ Service Worker запущен");
console.log("[1000fps] Endpoint'ов:", API_ENDPOINTS.length);

// Отправляем pending queue при старте
flushPendingQueue();

// Синхронизация товаров из сервера при старте
syncFromServer();

// Периодическая синхронизация с сервером (каждые 30 секунд)
// Проверяет pending товары и обновляет цены
let syncInterval = null;

function startPeriodicSync() {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = setInterval(() => {
    syncFromServer().then((store) => {
      if (store) {
        // Всегда запускаем проверку всех товаров, а не только pending
        // Это нужно для своевременного парсинга новых источников
        console.log("[1000fps] Запуск проверки всех товаров...");
        checkAllPrices();
      }
    });
  }, 30000);
  console.log("[1000fps] Периодическая синхронизация запущена (30 сек)");
}

// Запускаем периодическую синхронизацию (первый вызов syncFromServer внутри)
startPeriodicSync();

// Синхронизация товаров с сервером (двусторонняя)
async function syncFromServer() {
  if (!SYNC_API_URL) return;

  try {
    const response = await fetch(SYNC_API_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.log("[1000fps] Server sync: ошибка", response.status);
      return;
    }

    const result = await response.json();
    if (result.ok && result.data && Array.isArray(result.data)) {
      const store = await getStore();
      let newCount = 0;
      let updatedCount = 0;

      for (const product of result.data) {
        if (product.article && !store.products[product.article]) {
          // Новый товар с сервера
          store.products[product.article] = {
            article: product.article,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            url: product.url,
            pending: !product.price,
            addedAt: product.addedAt || new Date().toISOString(),
            history: product.price
              ? [{ price: product.price, ts: new Date().toISOString() }]
              : [],
          };
          console.log("[1000fps] Синхронизация (добавлен):", product.article);
          newCount++;
        } else if (store.products[product.article]) {
          // Обновление существующего
          const local = store.products[product.article];
          if (product.price && local.price !== product.price) {
            local.price = product.price;
            local.originalPrice = product.originalPrice;
            if (
              product.history &&
              product.history.length > local.history.length
            ) {
              local.history = product.history;
            }
            updatedCount++;
          }
        }
      }

      await saveStore(store);
      console.log(
        `[1000fps] Server sync: +${newCount} новых, ~${updatedCount} обновлено`,
      );

      // Уведомляем popup/tracker
      chrome.runtime.sendMessage({ type: "PRICES_UPDATED" }).catch(() => {});
    }
  } catch (e) {
    console.log("[1000fps] Server sync error:", e.message);
  }
}
async function sendToServer(
  product,
  action,
  retryCount = 0,
  sourceArticle = null,
) {
  const { backendUrl } = await chrome.storage.local.get("backendUrl");
  const SYNC_URL = backendUrl || "http://localhost:3002";
  const SEND_URL = `${SYNC_URL}/api/wb/products`;

  const payload = {
    article: product.article,
    name: product.name,
    description: "",
    price: product.price,
    originalPrice: product.originalPrice,
    url: product.url,
    source_article: sourceArticle || product.sourceArticle || null,
    stockQuantity: product.stockQuantity || 0,
    deliveryMin: product.deliveryMin || null,
    deliveryMax: product.deliveryMax || null,
  };

  console.log(
    "[1000fps] 📤 Отправка на сервер:",
    action,
    product.article,
    payload,
  );

  // Fix 4: AbortController вместо несуществующего fetch({timeout})
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(SEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(
      "[1000fps] ✅ Отправлено на сервер:",
      action,
      product.article,
      result,
    );
  } catch (e) {
    clearTimeout(timeoutId);
    const isAbort = e.name === "AbortError";
    console.log(
      `[1000fps] ❌ Server send error: ${isAbort ? "Таймаут (10s)" : e.message}`,
    );

    // Fix 3: async retry с экспоненциальной задержкой вместо fire-and-forget setTimeout
    if (retryCount < 3) {
      const delay = 5000 * Math.pow(2, retryCount); // 5s, 10s, 20s
      console.log(
        `[1000fps] 🔄 Повторная попытка ${retryCount + 1}/3 через ${delay / 1000}с...`,
      );
      await new Promise((r) => setTimeout(r, delay));
      return sendToServer(product, action, retryCount + 1, sourceArticle);
    }

    console.log("[1000fps] 💾 Сохранено в pending queue");
    await saveToPendingQueue(product, action);
  }
}

// Pending queue для офлайн режима
async function saveToPendingQueue(product, action) {
  try {
    const { pendingQueue = [] } =
      await chrome.storage.local.get("pendingQueue");
    pendingQueue.push({
      product,
      action,
      timestamp: Date.now(),
      retryCount: 0,
    });
    // Храним максимум 100 записей
    if (pendingQueue.length > 100) {
      pendingQueue.splice(0, pendingQueue.length - 100);
    }
    await chrome.storage.local.set({ pendingQueue });
  } catch (e) {
    console.error("[1000fps] Error saving to pending queue:", e);
  }
}

// Отправка pending queue при восстановлении соединения
async function flushPendingQueue() {
  const { pendingQueue = [] } = await chrome.storage.local.get("pendingQueue");
  if (pendingQueue.length === 0) return;

  console.log(
    `[1000fps] 📬 Отправка pending queue: ${pendingQueue.length} записей`,
  );

  // Fix 5: не мутируем массив во время итерации — собираем неудавшиеся отдельно
  const failed = [];
  for (const item of pendingQueue) {
    try {
      await sendToServer(item.product, item.action, 0);
    } catch (e) {
      item.retryCount = (item.retryCount || 0) + 1;
      if (item.retryCount <= 5) {
        failed.push(item);
      } else {
        console.log(
          `[1000fps] 🗑️ Удалено из queue после 5 попыток: ${item.product?.article}`,
        );
      }
    }
  }

  await chrome.storage.local.set({ pendingQueue: failed });
  console.log(
    `[1000fps] 📬 Queue: отправлено ${pendingQueue.length - failed.length}, осталось ${failed.length}`,
  );
}
