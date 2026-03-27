// Локальный Node.js сервер для WB Price Tracker
// Хранение данных и API для расширения
// Запуск: node server.js
// Требует: Node.js 18+ (встроенный fetch)

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── КОНФИГУРАЦИЯ ─────────────────────────────────────────────────────────────
const DEFAULT_CHECK_INTERVAL = 120; // минут
const PYTHON_PARSER_URL = "http://localhost:8080";
const PORT = 3000; // Порт локального сервера

// ─── ЛОКАЛЬНОЕ ХРАНИЛИЩЕ ───────────────────────────────────────────────────────
const DB_FILE = path.join(__dirname, "wb_data.json");

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    }
  } catch (e) {
    console.error("Ошибка чтения БД:", e.message);
  }
  return {};
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (e) {
    console.error("Ошибка записи БД:", e.message);
  }
}

function makeKV() {
  return {
    get(key) {
      const db = loadDB();
      return db[key] ?? null;
    },
    put(key, value) {
      const db = loadDB();
      db[key] = value;
      saveDB(db);
    },
    delete(key) {
      const db = loadDB();
      delete db[key];
      saveDB(db);
    },
    list() {
      const db = loadDB();
      const keys = Object.keys(db).map((name) => ({ name }));
      return { keys };
    },
  };
}

// ─── ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ──────────────────────────────────────────────────
function formatDate(ts) {
  const d = new Date(ts);
  return (
    d.toLocaleDateString("ru-RU") +
    " " +
    d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  );
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function sendJSON(res, data, status = 200) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  res.writeHead(status, corsHeaders);
  res.end(JSON.stringify(data));
}

// ─── УВЕДОМЛЕНИЯ (без Telegram, только логирование) ───────────────────────────
async function logPriceChange(product, prevPrice, kv) {
  const price = Number(product.price);
  const prevPriceNum = Number(prevPrice);
  if (isNaN(price) || isNaN(prevPriceNum)) return;

  const diff = price - prevPriceNum;
  const emoji = diff > 0 ? "📈" : diff < 0 ? "📉" : "➖";
  const sign = diff > 0 ? "+" : "";

  console.log(
    `${emoji} ${product.name}: ${prevPrice}₽ → ${price}₽ (${sign}${diff}₽)`,
  );

  // Сохраняем в лог
  try {
    const v = kv.get("logs:notifications");
    const logs = v ? JSON.parse(v) : [];
    logs.push({
      ts: Date.now(),
      type: `price_change ${emoji}`,
      message: `${product.article}: ${prevPrice}→${price}`,
    });
    if (logs.length > 100) logs.splice(0, logs.length - 100);
    kv.put("logs:notifications", JSON.stringify(logs));
  } catch (e) {}
}

// ─── HTTP СЕРВЕР ──────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const kv = makeKV();

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  try {
    // ─── WEBHOOK ──────────────────────────────────────────────────────────────
    if (req.method === "POST" && url.pathname === "/webhook") {
      const body = await parseBody(req);
      console.log("[Webhook]", body.action || "data", body);

      const { action, product, products } = body;

      if (action === "price_add" && product) {
        // Добавление товара
        kv.put(
          product.article,
          JSON.stringify({
            ...product,
            history: [{ ts: Date.now(), price: product.price }],
            addedAt: new Date().toISOString(),
          }),
        );
        console.log(`✅ Добавлен: ${product.article} - ${product.price}₽`);
      }

      if (action === "price_update" && product) {
        // Обновление цены
        const existing = kv.get(product.article);
        if (existing) {
          const parsed = JSON.parse(existing);
          const history = parsed.history || [];
          const lastPrice = history.length
            ? history[history.length - 1].price
            : null;

          if (lastPrice !== product.price) {
            history.push({ ts: Date.now(), price: product.price });
            if (history.length > 100) history.splice(0, history.length - 100);

            await logPriceChange(product, lastPrice, kv);
          }

          kv.put(
            product.article,
            JSON.stringify({ ...parsed, ...product, history }),
          );
          console.log(`🔄 Обновлён: ${product.article} - ${product.price}₽`);
        }
      }

      if (products) {
        // Массовая синхронизация
        for (const article of Object.keys(products)) {
          const product = products[article];
          const existing = kv.get(article);

          if (existing) {
            const parsed = JSON.parse(existing);
            const history = parsed.history || [];
            const lastPrice = history.length
              ? history[history.length - 1].price
              : null;

            if (lastPrice !== product.price) {
              history.push({ ts: Date.now(), price: product.price });
              if (history.length > 100) history.splice(0, history.length - 100);
            }

            kv.put(article, JSON.stringify({ ...parsed, ...product, history }));
          } else {
            kv.put(
              article,
              JSON.stringify({
                ...product,
                history: [{ ts: Date.now(), price: product.price }],
                addedAt: new Date().toISOString(),
              }),
            );
          }
        }
        console.log(
          `📦 Синхронизировано ${Object.keys(products).length} товаров`,
        );
      }

      sendJSON(res, { ok: true });
      return;
    }

    // ─── API ──────────────────────────────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/products") {
      const keys = kv.list();
      const productKeys = (keys.keys || []).filter(
        (k) => !k.name.startsWith("config:") && !k.name.startsWith("logs:"),
      );

      const products = productKeys.map((key) => {
        const p = JSON.parse(kv.get(key.name));
        return {
          article: p.article,
          name: p.name,
          brand: p.brand,
          price: p.price,
          originalPrice: p.originalPrice,
          rating: p.rating,
          feedbacks: p.feedbacks,
          url: p.url,
          checkedAt: p.checkedAt,
          stockQuantity: p.stockQuantity,
          deliveryMin: p.deliveryMin,
          deliveryMax: p.deliveryMax,
          outOfStock: p.outOfStock,
          history: p.history,
        };
      });

      sendJSON(res, { ok: true, data: products, count: products.length });
      return;
    }

    if (req.method === "GET" && url.pathname.startsWith("/api/products/")) {
      const article = url.pathname.split("/").pop();
      const raw = kv.get(article);

      if (!raw) {
        sendJSON(res, { ok: false, message: "Товар не найден" }, 404);
        return;
      }

      const product = JSON.parse(raw);
      sendJSON(res, { ok: true, data: product });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/stats") {
      const keys = kv.list();
      const productKeys = (keys.keys || []).filter(
        (k) => !k.name.startsWith("config:") && !k.name.startsWith("logs:"),
      );

      let total = 0,
        withPrice = 0,
        minPrice = Infinity,
        maxPrice = 0,
        sumPrice = 0;

      for (const key of productKeys) {
        const p = JSON.parse(kv.get(key.name));
        total++;
        if (p.price) {
          withPrice++;
          sumPrice += p.price;
          if (p.price < minPrice) minPrice = p.price;
          if (p.price > maxPrice) maxPrice = p.price;
        }
      }

      sendJSON(res, {
        ok: true,
        data: {
          total,
          withPrice,
          withoutPrice: total - withPrice,
          minPrice: minPrice === Infinity ? 0 : minPrice,
          maxPrice,
          avgPrice: withPrice > 0 ? Math.round(sumPrice / withPrice) : 0,
        },
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/logs") {
      const logs = kv.get("logs:notifications");
      if (!logs) {
        sendJSON(res, { ok: true, data: [] });
        return;
      }
      sendJSON(res, { ok: true, data: JSON.parse(logs) });
      return;
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────
    if (req.method === "DELETE" && url.pathname.startsWith("/api/products/")) {
      const article = url.pathname.split("/").pop();
      kv.delete(article);
      sendJSON(res, { ok: true, message: "Товар удалён" });
      return;
    }

    // ─── CONFIG ───────────────────────────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/api/config") {
      const intervalConfig = kv.get("config:interval");
      const interval = intervalConfig
        ? JSON.parse(intervalConfig).value
        : DEFAULT_CHECK_INTERVAL;
      sendJSON(res, {
        ok: true,
        data: { interval, pythonParserUrl: PYTHON_PARSER_URL },
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/config/interval") {
      const body = await parseBody(req);
      const newInterval = parseInt(body.value);

      if (isNaN(newInterval) || newInterval < 30) {
        sendJSON(res, { ok: false, message: "Минимум 30 минут" }, 400);
        return;
      }

      kv.put(
        "config:interval",
        JSON.stringify({
          value: newInterval,
          updatedAt: new Date().toISOString(),
        }),
      );
      sendJSON(res, { ok: true, data: { value: newInterval } });
      return;
    }

    // ─── STATIC ───────────────────────────────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>WB Price Tracker</title>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui; max-width: 800px; margin: 40px auto; padding: 20px; }
          h1 { color: #667eea; }
          .card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .stat { display: inline-block; padding: 10px 20px; background: #667eea; color: white; border-radius: 8px; margin: 5px; }
          pre { background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 8px; overflow-x: auto; }
        </style>
        </head>
        <body>
          <h1>📊 WB Price Tracker Server</h1>
          <div class="card">
            <h2>API Endpoints</h2>
            <ul>
              <li><code>GET /api/products</code> — Список товаров</li>
              <li><code>GET /api/products/:article</code> — Товар по артикулу</li>
              <li><code>GET /api/stats</code> — Статистика</li>
              <li><code>GET /api/logs</code> — История изменений</li>
              <li><code>POST /webhook</code> — Webhook для расширения</li>
            </ul>
          </div>
          <div class="card">
            <h2>Статус</h2>
            <p>Порт: ${PORT}</p>
            <p>Python Parser: ${PYTHON_PARSER_URL}</p>
          </div>
        </body>
        </html>
      `);
      return;
    }

    // ─── 404 ──────────────────────────────────────────────────────────────────
    sendJSON(res, { ok: false, message: "Not found" }, 404);
  } catch (e) {
    console.error("Server error:", e);
    sendJSON(res, { ok: false, message: e.message }, 500);
  }
});

// ─── ЗАПУСК ───────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log("📊 WB Price Tracker Server");
  console.log("=".repeat(60));
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📡 Webhook: http://localhost:${PORT}/webhook`);
  console.log(`🤖 Python Parser: ${PYTHON_PARSER_URL}`);
  console.log("=".repeat(60));
});
