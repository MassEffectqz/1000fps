// Локальный Node.js сервер для WB Price Tracker
// Замена Cloudflare Worker — работает на вашем компьютере
// Запуск: node server.js
// Требует: Node.js 18+ (встроенный fetch)

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── КОНФИГУРАЦИЯ ─────────────────────────────────────────────────────────────
const TELEGRAM_BOT_TOKEN = '8346542644:AAG3QY4uNVL7h21dlulFsZZLcdIegWfFQb8';
const DEFAULT_ADMINS = ['5560375687', '-1002562294624'];
const DEFAULT_CHATS  = ['5560375687', '-1002562294624'];
const DEFAULT_CHECK_INTERVAL = 120; // минут
const PYTHON_PARSER_URL = 'http://localhost:8080';
const PORT = 3000; // Порт локального сервера

// ─── ЛОКАЛЬНОЕ ХРАНИЛИЩЕ (замена Cloudflare KV) ───────────────────────────────
const DB_FILE = path.join(__dirname, 'wb_data.json');

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Ошибка чтения БД:', e.message);
  }
  return {};
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {
    console.error('Ошибка записи БД:', e.message);
  }
}

// Имитация Cloudflare KV через объект с методами
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
      const keys = Object.keys(db).map(name => ({ name }));
      return { keys };
    }
  };
}

// ─── ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ──────────────────────────────────────────────────
function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, data, status = 200) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  res.writeHead(status, corsHeaders);
  res.end(JSON.stringify(data));
}

// ─── TELEGRAM ФУНКЦИИ ─────────────────────────────────────────────────────────

// Прокси для Telegram (если нужен для обхода блокировок)
// Установите переменную окружения: HTTPS_PROXY=http://proxy:port
const HTTPS_PROXY = process.env.HTTPS_PROXY || null;

async function sendMessage(chatId, text, parseMode = 'HTML', replyMarkup = null) {
  try {
    const body = { chat_id: chatId, text };
    if (parseMode) body.parse_mode = parseMode;
    if (replyMarkup) body.reply_markup = JSON.stringify(replyMarkup);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 сек таймаут

    const resp = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!resp.ok) {
      const err = await resp.json();
      console.error('sendMessage error:', JSON.stringify(err));
    }
  } catch (e) {
    console.error('Send message error:', e.message);
  }
}

async function sendFile(chatId, fileName, fileContent) {
  try {
    const boundary = '----FormBoundary' + Math.random().toString(16).slice(2);
    const fileBytes = Buffer.from(fileContent, 'utf8');

    const bodyParts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}`,
      `--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${fileName}"\r\nContent-Type: application/json\r\n\r\n${fileContent}`,
      `--${boundary}--`
    ].join('\r\n');

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body: bodyParts
    });
  } catch (e) {
    console.error('Send file error:', e);
  }
}

async function sendPhoto(chatId, photoUrl, caption = '') {
  try {
    const boundary = '----FormBoundary' + Math.random().toString(16).slice(2);
    const parts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}`,
      `--${boundary}\r\nContent-Disposition: form-data; name="photo"\r\n\r\n${photoUrl}`,
      caption ? `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n--${boundary}\r\nContent-Disposition: form-data; name="parse_mode"\r\n\r\nHTML` : '',
      `--${boundary}--`
    ].filter(Boolean).join('\r\n');

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body: parts
    });
  } catch (e) {
    console.error('Send photo error:', e);
  }
}

// ─── КОНФИГ / ДАННЫЕ ──────────────────────────────────────────────────────────
async function isAdmin(chatId, kv) {
  const admins = await getAdmins(kv);
  return admins.includes(chatId.toString());
}

async function getAdmins(kv) {
  try {
    const v = kv.get('config:admins');
    if (v) { const p = JSON.parse(v); return p.admins || DEFAULT_ADMINS; }
  } catch (e) {}
  return DEFAULT_ADMINS;
}

async function getChats(kv) {
  try {
    const v = kv.get('config:chats');
    if (v) { const p = JSON.parse(v); return p.chats || DEFAULT_CHATS; }
  } catch (e) {}
  return DEFAULT_CHATS;
}

async function getReminds(chatId, kv) {
  try {
    const v = kv.get(`remind:${chatId}`);
    if (v) return JSON.parse(v);
  } catch (e) {}
  return [];
}

async function addLog(type, message, kv) {
  try {
    const v = kv.get('logs:notifications');
    const logs = v ? JSON.parse(v) : [];
    logs.push({ ts: Date.now(), type, message });
    if (logs.length > 100) logs.splice(0, logs.length - 100);
    kv.put('logs:notifications', JSON.stringify(logs));
  } catch (e) {}
}

// ─── УВЕДОМЛЕНИЯ ──────────────────────────────────────────────────────────────
async function sendTelegramAlert(product, prevPrice, kv) {
  const price = Number(product.price);
  const prevPriceNum = Number(prevPrice);
  if (isNaN(price) || isNaN(prevPriceNum)) return;

  const diff = price - prevPriceNum;
  const emoji = diff > 0 ? '📈' : diff < 0 ? '📉' : '➖';
  const sign = diff > 0 ? '+' : '';
  const message = `${emoji} <b>Цена изменилась!</b>\n\n📦 ${product.name}\n💰 ${prevPrice} ₽ → ${price} ₽\n🔺 ${sign}${diff} ₽\n\n🔗 ${product.url}`;

  const chats = await getChats(kv);
  for (const chatId of chats) await sendMessage(chatId, message);
  await addLog(`price_change ${emoji}`, `${product.article}: ${prevPrice}→${price}`, kv);
  await checkReminders(product, kv);
}

async function checkReminders(product, kv) {
  try {
    const keys = kv.list();
    const remindKeys = (keys.keys || []).filter(k => k.name.startsWith('remind:'));
    for (const key of remindKeys) {
      const reminds = JSON.parse(kv.get(key.name));
      const chatId = key.name.replace('remind:', '');
      const matched = reminds.filter(r => r.article === product.article && product.price && product.price <= r.targetPrice);
      for (const remind of matched) {
        await sendMessage(chatId,
          `🔔 <b>Напоминание сработало!</b>\n\n📦 ${product.name}\n🔖 Артикул: ${product.article}\n💰 Цена упала до ${product.price} ₽\n🎯 Целевая: ${remind.targetPrice} ₽\n\n🔗 ${product.url}`
        );
        await addLog('remind_triggered', `${product.article} <= ${remind.targetPrice}`, kv);
      }
      const filtered = reminds.filter(r => !(r.article === product.article && product.price && product.price <= r.targetPrice));
      if (filtered.length !== reminds.length) kv.put(key.name, JSON.stringify(filtered));
    }
  } catch (e) {}
}

async function sendTelegramAdd(product, kv) {
  const price = product.price || '❓';
  const priceText = typeof price === 'number' ? `${price} ₽` : price;
  const message = `✅ <b>Товар добавлен!</b>\n\n📦 ${product.name}\n🔖 Артикул: ${product.article}\n💰 Цена: ${priceText}\n\n🔗 ${product.url}`;
  const chats = await getChats(kv);
  for (const chatId of chats) await sendMessage(chatId, message);
}

async function sendTelegramFound(product, kv) {
  const price = product.price || '❓';
  const priceText = typeof price === 'number' ? `${price} ₽` : '❓';
  const message = `✅ <b>Найден!</b>\n\n📦 ${product.name}\n🔖 Артикул: ${product.article}\n💰 Цена: ${priceText}\n\n🔗 ${product.url}`;
  const chats = await getChats(kv);
  for (const chatId of chats) await sendMessage(chatId, message);
}

// ─── ОБРАБОТКА КОМАНД TELEGRAM ────────────────────────────────────────────────
async function handleTelegramCommand(text, chatId, kv) {
  text = text.trim();
  if (!text.startsWith('/')) return;
  let command = text.split('@')[0].toLowerCase().trim();
  console.log(`Command: "${command}" from ${chatId}`);

  if (command !== '/help' && command !== '/start') {
    const admin = await isAdmin(chatId, kv);
    if (!admin) { await sendMessage(chatId, '❌ Доступ запрещён. Только администраторы.'); return; }
  }

  if (command === '/start' || command === '/help') {
    await sendMessage(chatId, `📖 Подробная справка

━━━━━━━━━━━━━━━━━━━━━

📊 РАБОТА С ТОВАРАМИ
• /list — Все товары
• /list compact — Кратко
• /list full — Подробно
• /stats — Статистика

➕ ДОБАВЛЕНИЕ
• /add артикул — Добавить
• /remove артикул — Удалить

⏱ АВТООБНОВЛЕНИЕ
• /interval — Текущий
• /interval 30 — 30 мин
• /interval 60 — 1 час
• /interval 120 — 2 часа

🔔 НАПОМИНАНИЯ
• /remind артикул цена — Напомнить
• /reminds — Список
• /remind_remove артикул — Удалить

📈 ГРАФИКИ
• /chart артикул — График

📁 ДАННЫЕ
• /export — Экспорт JSON
• /backup — Бэкап
• /logs — История

👥 АДМИНИСТРИРОВАНИЕ
• /admins — Список
• /admin_add id — Добавить
• /admin_remove id — Удалить
• /chats — Чаты
• /chat_add id — Добавить
• /chat_remove id — Удалить

━━━━━━━━━━━━━━━━━━━━━`);
    return;
  }

  if (command === '/status') {
    const keys = kv.list();
    const count = (keys.keys || []).filter(k => !k.name.startsWith('config:') && !k.name.startsWith('remind:') && !k.name.startsWith('logs:')).length;
    const intervalConfig = kv.get('config:interval');
    const interval = intervalConfig ? JSON.parse(intervalConfig).value : DEFAULT_CHECK_INTERVAL;
    await sendMessage(chatId, `📊 <b>Статистика:</b>\n\n📦 Товаров: ${count}\n⏱ Автообновление: каждые ${interval} мин\n🖥 Сервер: localhost:${PORT}`);
    return;
  }

  if (text === '/settings') {
    const intervalConfig = kv.get('config:interval');
    const interval = intervalConfig ? JSON.parse(intervalConfig).value : DEFAULT_CHECK_INTERVAL;
    await sendMessage(chatId, `⚙️ <b>Настройки автообновления</b>\n\n⏱ Текущий интервал: <b>${interval} мин</b>\n\n• /interval 30 — 30 мин\n• /interval 60 — 1 час\n• /interval 120 — 2 часа\n• /interval 180 — 3 часа\n• /interval 360 — 6 часов\n• /interval 1440 — раз в сутки\n\n⚠️ Минимум: 30 минут`);
    return;
  }

  if (text.startsWith('/interval')) {
    const parts = text.split(' ');
    if (parts.length === 1) {
      const intervalConfig = kv.get('config:interval');
      const interval = intervalConfig ? JSON.parse(intervalConfig).value : DEFAULT_CHECK_INTERVAL;
      await sendMessage(chatId, `⏱ Текущий интервал: <b>${interval} мин</b>\n\nИспользуйте /interval &lt;минуты&gt; для изменения.`);
      return;
    }
    const newInterval = parseInt(parts[1]);
    if (isNaN(newInterval) || newInterval < 30) { await sendMessage(chatId, '❌ Минимальный интервал: 30 минут'); return; }
    if (newInterval > 1440) { await sendMessage(chatId, '❌ Максимальный интервал: 1440 минут (24 часа)'); return; }
    kv.put('config:interval', JSON.stringify({ value: newInterval, updatedAt: new Date().toISOString() }));
    await sendMessage(chatId, `✅ Интервал установлен: <b>${newInterval} мин</b>`);
    return;
  }

  if (text === '/admins') {
    const admins = await getAdmins(kv);
    let msg = '👥 <b>Администраторы:</b>\n\n';
    for (const a of admins) msg += `• <code>${a}</code>\n`;
    msg += `\n📝 Всего: ${admins.length}`;
    await sendMessage(chatId, msg);
    return;
  }

  if (text.startsWith('/admin_add ')) {
    const newAdminId = text.split(' ')[1];
    if (!/^-?\d+$/.test(newAdminId)) { await sendMessage(chatId, '❌ ID должен быть числом'); return; }
    const admins = await getAdmins(kv);
    if (admins.includes(newAdminId)) { await sendMessage(chatId, '⚠️ Уже администратор'); return; }
    admins.push(newAdminId);
    kv.put('config:admins', JSON.stringify({ admins, updatedAt: new Date().toISOString() }));
    await sendMessage(chatId, `✅ ID <code>${newAdminId}</code> добавлен в администраторы`);
    return;
  }

  if (text.startsWith('/admin_remove ')) {
    const removeId = text.split(' ')[1];
    const admins = await getAdmins(kv);
    if (!admins.includes(removeId)) { await sendMessage(chatId, '⚠️ Пользователь не найден'); return; }
    admins.splice(admins.indexOf(removeId), 1);
    kv.put('config:admins', JSON.stringify({ admins, updatedAt: new Date().toISOString() }));
    await sendMessage(chatId, `✅ Пользователь <code>${removeId}</code> удалён`);
    return;
  }

  if (text === '/chats') {
    const chats = await getChats(kv);
    let msg = '💬 <b>Чаты для уведомлений:</b>\n\n';
    for (const c of chats) msg += `• <code>${c}</code>\n`;
    msg += `\n📝 Всего: ${chats.length}`;
    await sendMessage(chatId, msg);
    return;
  }

  if (text.startsWith('/chat_add ')) {
    const newChatId = text.split(' ')[1];
    const chats = await getChats(kv);
    if (chats.includes(newChatId)) { await sendMessage(chatId, '⚠️ Этот чат уже в списке'); return; }
    chats.push(newChatId);
    kv.put('config:chats', JSON.stringify({ chats, updatedAt: new Date().toISOString() }));
    await sendMessage(chatId, `✅ Чат <code>${newChatId}</code> добавлен`);
    return;
  }

  if (text.startsWith('/chat_remove ')) {
    const removeChatId = text.split(' ')[1];
    const chats = await getChats(kv);
    if (!chats.includes(removeChatId)) { await sendMessage(chatId, '⚠️ Чат не найден'); return; }
    chats.splice(chats.indexOf(removeChatId), 1);
    kv.put('config:chats', JSON.stringify({ chats, updatedAt: new Date().toISOString() }));
    await sendMessage(chatId, `✅ Чат <code>${removeChatId}</code> удалён`);
    return;
  }

  if (text === '/list' || text === '/list compact' || text === '/list full') {
    try {
      const keys = kv.list();
      const productKeys = (keys.keys || []).filter(k => !k.name.startsWith('config:') && !k.name.startsWith('remind:') && !k.name.startsWith('logs:'));
      if (productKeys.length === 0) { await sendMessage(chatId, '📭 Нет товаров в базе'); return; }

      const mode = text.includes('full') ? 'full' : text.includes('compact') ? 'compact' : 'normal';
      let listText = mode === 'compact' ? '📦 <b>Товары (кратко):</b>\n\n' : '📦 <b>Список товаров:</b>\n\n';

      for (const key of productKeys) {
        const p = JSON.parse(kv.get(key.name));
        if (mode === 'compact') {
          listText += `• ${p.article} — ${p.price ? p.price + ' ₽' : '❓'}\n`;
        } else if (mode === 'full') {
          const name = p.name.length > 50 ? p.name.slice(0, 50) + '...' : p.name;
          const url = p.url || `https://www.wildberries.ru/catalog/${p.article}/detail.aspx`;
          listText += `🔹 <i>${p.article}</i>\n   ${name}\n   💰 ${p.price ? p.price + ' ₽' : '❓'}\n   🔗 <a href="${url}">Ссылка</a>\n\n`;
        } else {
          const name = p.name.length > 40 ? p.name.slice(0, 40) + '...' : p.name;
          listText += `🔹 <i>${p.article}</i>\n   ${name}\n   💰 ${p.price ? p.price + ' ₽' : '❓ Нет цены'}\n\n`;
        }
      }
      listText += `\n📊 Всего: ${productKeys.length}`;

      const keyboard = { inline_keyboard: [[
        { text: '🔄 Обновить', callback_data: 'refresh_all' },
        { text: '📥 Экспорт', callback_data: 'export' }
      ]] };
      await sendMessage(chatId, listText, 'HTML', keyboard);
    } catch (e) { await sendMessage(chatId, `❌ Ошибка: ${e.message}`); }
    return;
  }

  if (text === '/export') {
    try {
      const keys = kv.list();
      const productKeys = (keys.keys || []).filter(k => !k.name.startsWith('config:') && !k.name.startsWith('remind:') && !k.name.startsWith('logs:'));
      if (productKeys.length === 0) { await sendMessage(chatId, '📭 Нечего экспортировать'); return; }
      const products = productKeys.map(key => { const p = JSON.parse(kv.get(key.name)); return { article: p.article, name: p.name, price: p.price || null }; });
      const exportData = { exported_at: new Date().toISOString(), products, total_count: products.length };
      await sendFile(chatId, `wb-export-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(exportData, null, 2));
    } catch (e) { await sendMessage(chatId, `❌ Ошибка: ${e.message}`); }
    return;
  }

  if (text === '/stats') {
    try {
      const keys = kv.list();
      const productKeys = (keys.keys || []).filter(k => !k.name.startsWith('config:') && !k.name.startsWith('remind:') && !k.name.startsWith('logs:'));
      if (productKeys.length === 0) { await sendMessage(chatId, '📭 Нет товаров для статистики'); return; }

      let total = 0, withPrice = 0, minPrice = Infinity, maxPrice = 0, sumPrice = 0;
      const prices = [];
      for (const key of productKeys) {
        const p = JSON.parse(kv.get(key.name));
        if (p.price) { withPrice++; sumPrice += p.price; if (p.price < minPrice) minPrice = p.price; if (p.price > maxPrice) maxPrice = p.price; prices.push(p.price); }
        total++;
      }
      const avgPrice = withPrice > 0 ? Math.round(sumPrice / withPrice) : 0;
      let msg = `📊 <b>Статистика цен:</b>\n\n📦 Всего товаров: ${total}\n💰 С ценой: ${withPrice}\n❓ Без цены: ${total - withPrice}\n\n`;
      if (withPrice > 0) {
        msg += `💵 Минимальная: ${minPrice} ₽\n💵 Максимальная: ${maxPrice} ₽\n💵 Средняя: ${avgPrice} ₽\n\n<b>Распределение цен:</b>\n\n`;
        const ranges = [{ label: '0-500', min: 0, max: 500, count: 0 }, { label: '500-1000', min: 501, max: 1000, count: 0 }, { label: '1-5K', min: 1001, max: 5000, count: 0 }, { label: '5-10K', min: 5001, max: 10000, count: 0 }, { label: '>10K', min: 10001, max: Infinity, count: 0 }];
        for (const price of prices) for (const range of ranges) if (price >= range.min && price <= range.max) { range.count++; break; }
        const maxCount = Math.max(...ranges.map(r => r.count));
        for (const range of ranges) { const b = maxCount > 0 ? Math.round((range.count / maxCount) * 20) : 0; msg += `${range.label.padEnd(8)} |${'█'.repeat(b)}${'░'.repeat(20 - b)}| ${range.count}\n`; }
      }
      const keyboard = { inline_keyboard: [[{ text: '📈 График цен', callback_data: 'chart_all' }]] };
      await sendMessage(chatId, msg, 'HTML', keyboard);
    } catch (e) { await sendMessage(chatId, `❌ Ошибка: ${e.message}`); }
    return;
  }

  if (text.startsWith('/remind ') && !text.startsWith('/remind_remove')) {
    const parts = text.split(' ');
    if (parts.length < 3) { await sendMessage(chatId, '❌ Использование: /remind &lt;артикул&gt; &lt;цена&gt;'); return; }
    const article = parts[1], targetPrice = parseFloat(parts[2]);
    if (isNaN(targetPrice) || targetPrice <= 0) { await sendMessage(chatId, '❌ Цена должна быть числом > 0'); return; }
    const reminds = await getReminds(chatId, kv);
    reminds.push({ article, targetPrice, chatId, createdAt: new Date().toISOString() });
    kv.put(`remind:${chatId}`, JSON.stringify(reminds));
    await sendMessage(chatId, `✅ Напоминание создано!\n\n🔖 Артикул: ${article}\n💰 Целевая цена: ${targetPrice} ₽`);
    return;
  }

  if (text === '/reminds') {
    const reminds = await getReminds(chatId, kv);
    if (reminds.length === 0) { await sendMessage(chatId, '📭 Нет активных напоминаний'); return; }
    let msg = '🔔 <b>Ваши напоминания:</b>\n\n';
    for (const r of reminds) msg += `• ${r.article} — до ${r.targetPrice} ₽\n`;
    await sendMessage(chatId, msg);
    return;
  }

  if (text.startsWith('/remind_remove ')) {
    const article = text.slice(15).trim();
    const reminds = await getReminds(chatId, kv);
    const filtered = reminds.filter(r => r.article !== article);
    if (filtered.length === reminds.length) { await sendMessage(chatId, '⚠️ Напоминание не найдено'); return; }
    kv.put(`remind:${chatId}`, JSON.stringify(filtered));
    await sendMessage(chatId, `✅ Напоминание для ${article} удалено`);
    return;
  }

  if (text === '/logs') {
    const logs = kv.get('logs:notifications');
    if (!logs) { await sendMessage(chatId, '📭 История пуста'); return; }
    const logList = JSON.parse(logs);
    let msg = '📋 <b>Последние уведомления:</b>\n\n';
    for (const log of logList.slice(-10).reverse()) msg += `• ${formatDate(log.ts)} — ${log.type}\n`;
    await sendMessage(chatId, msg);
    return;
  }

  if (text === '/backup') {
    try {
      const keys = kv.list();
      const backup = { backup_date: new Date().toISOString(), products: [], reminds: [], config: {} };
      for (const key of (keys.keys || [])) {
        const value = kv.get(key.name);
        if (key.name.startsWith('config:')) backup.config[key.name] = JSON.parse(value);
        else if (key.name.startsWith('remind:')) backup.reminds.push({ key: key.name, data: JSON.parse(value) });
        else if (!key.name.startsWith('logs:')) backup.products.push(JSON.parse(value));
      }
      await sendFile(chatId, `wb-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(backup, null, 2));
    } catch (e) { await sendMessage(chatId, `❌ Ошибка: ${e.message}`); }
    return;
  }

  if (text.startsWith('/chart ')) {
    const article = text.slice(7).trim();
    try {
      const raw = kv.get(article);
      if (!raw) { await sendMessage(chatId, '❌ Товар не найден'); return; }
      const product = JSON.parse(raw);
      const history = product.history || [];
      if (history.length === 0) { await sendMessage(chatId, '📭 Нет истории цен для этого товара'); return; }
      const labels = history.map(h => new Date(h.ts).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));
      const prices = history.map(h => h.price);
      const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify({
        type: 'line',
        data: { labels, datasets: [{ label: 'Цена (₽)', data: prices, borderColor: 'rgb(255, 107, 0)', backgroundColor: 'rgba(255, 107, 0, 0.1)', fill: true, tension: 0.4 }] },
        options: { plugins: { title: { display: true, text: `${product.name.slice(0, 30)}... - История цен` } }, scales: { y: { beginAtZero: false } } }
      }))}&w=800&h=400`;
      await sendPhoto(chatId, chartUrl, `📈 <b>История цен: ${product.name}</b>\n\n🔖 Артикул: ${article}\n💰 Текущая: ${product.price || '❓'} ₽`);
    } catch (e) { await sendMessage(chatId, `❌ Ошибка: ${e.message}`); }
    return;
  }

  if (text.startsWith('/add ')) {
    const article = text.slice(5).trim();
    if (kv.get(article)) { await sendMessage(chatId, `⚠️ Товар ${article} уже в базе`); return; }
    
    // Пытаемся получить цену через WB API
    await sendMessage(chatId, `⏳ Товар ${article} добавляется...`);
    
    try {
      // Запрашиваем данные через расширение (оно имеет доступ к WB)
      // Для этого отправляем webhook на расширение с флагом pending
      kv.put(article, JSON.stringify({ 
        article, 
        name: `Товар ${article}`, 
        pending: true, 
        addedAt: new Date().toISOString() 
      }));
      
      await sendMessage(chatId, `✅ Товар ${article} добавлен (ожидает проверки через расширение)`);
      
      // Уведомляем расширение о новом товаре (если открыто)
      // Расширение получит это через polling или при следующей проверке
    } catch (e) {
      await sendMessage(chatId, `❌ Ошибка добавления: ${e.message}`);
    }
    return;
  }

  if (text.startsWith('/remove ')) {
    const article = text.slice(8).trim();
    kv.delete(article);
    await sendMessage(chatId, `✅ Товар ${article} удалён`);
    return;
  }

  await sendMessage(chatId, '❓ Неизвестная команда. Используйте /help для справки.');
}

// ─── HTTP СЕРВЕР ──────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const kv = makeKV();

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') { res.writeHead(204, corsHeaders); res.end(); return; }

  // POST /telegram — webhook от Telegram
  if (url.pathname === '/telegram' && req.method === 'POST') {
    try {
      const update = await parseBody(req);
      console.log('Telegram update:', JSON.stringify(update).slice(0, 200));

      if (update.callback_query) {
        const callbackData = update.callback_query.data;
        const chatId = update.callback_query.message.chat.id;

        const answerCallback = (text) => fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ callback_query_id: update.callback_query.id, text }) }
        );

        if (callbackData === 'refresh_all') {
          await answerCallback('⏳ Обновляю цены...');
          await sendMessage(chatId, '🔄 Обновление цен запущено...\n\nРасширение проверит цены при открытой вкладке WB.');
        }
        if (callbackData === 'export') {
          await answerCallback('📥 Формирую экспорт...');
          await handleTelegramCommand('/export', chatId, kv);
        }
        if (callbackData === 'chart_all') {
          await answerCallback('📈 Формирую график...');
          try {
            const keys = kv.list();
            const productKeys = (keys.keys || []).filter(k => !k.name.startsWith('config:') && !k.name.startsWith('remind:') && !k.name.startsWith('logs:'));
            if (productKeys.length === 0) { await sendMessage(chatId, '📭 Нет товаров для графика'); }
            else {
              const priceByDate = {};
              for (const key of productKeys) {
                const p = JSON.parse(kv.get(key.name));
                if (p.history?.length > 0) {
                  for (const h of p.history) {
                    const date = new Date(h.ts).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
                    if (!priceByDate[date]) priceByDate[date] = [];
                    priceByDate[date].push(h.price);
                  }
                } else if (p.price) {
                  const date = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
                  if (!priceByDate[date]) priceByDate[date] = [];
                  priceByDate[date].push(p.price);
                }
              }
              const labels = Object.keys(priceByDate).slice(-10);
              const avgPrices = labels.map(date => { const p = priceByDate[date]; return Math.round(p.reduce((a, b) => a + b, 0) / p.length); });
              const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify({ type: 'line', data: { labels, datasets: [{ label: 'Средняя цена (₽)', data: avgPrices, borderColor: 'rgb(255, 107, 0)', backgroundColor: 'rgba(255, 107, 0, 0.1)', fill: true, tension: 0.4 }] }, options: { plugins: { title: { display: true, text: 'Динамика средних цен' } } } }))}&w=800&h=400`;
              await sendPhoto(chatId, chartUrl, '📈 <b>Динамика средних цен по всем товарам</b>');
            }
          } catch (e) { await sendMessage(chatId, `❌ Ошибка: ${e.message}`); }
        }
        sendJSON(res, { ok: true }); return;
      }

      const message = update.message || update.edited_message;
      if (!message || !message.text) { sendJSON(res, { ok: true }); return; }
      await handleTelegramCommand(message.text, message.chat.id, kv);
      sendJSON(res, { ok: true });
    } catch (e) {
      console.error('Telegram webhook error:', e);
      sendJSON(res, { ok: false, error: e.message }, 400);
    }
    return;
  }

  // POST /webhook — от расширения Chrome
  if (url.pathname === '/webhook' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      console.log('Webhook от расширения:', data.action, data.product?.article);

      if (data.product?.article) kv.put(data.product.article, JSON.stringify(data.product));

      if (data.action === 'price_update' && data.prevPrice !== null) await sendTelegramAlert(data.product, data.prevPrice, kv);
      if (data.action === 'price_add') {
        await sendTelegramAdd(data.product, kv);
        try { await fetch(`${PYTHON_PARSER_URL}/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); } catch (e) {}
      }
      if (data.action === 'price_received') await sendTelegramFound(data.product, kv);
      if (data.action === 'parser_check_complete') {
        const count = data.count || 0;
        const chats = await getChats(kv);
        for (const chatId of chats) await sendMessage(chatId, `✅ *Проверка завершена*\n\nПроверено товаров: ${count}\n\nЦены не изменились.`, 'Markdown');
      }
      sendJSON(res, { ok: true });
    } catch (e) {
      sendJSON(res, { ok: false, error: e.message }, 400);
    }
    return;
  }

  // GET /api/products
  if (url.pathname === '/api/products' && req.method === 'GET') {
    const keys = kv.list();
    const productKeys = (keys.keys || []).filter(k => !k.name.startsWith('config:') && !k.name.startsWith('remind:') && !k.name.startsWith('logs:'));
    const products = productKeys.map(key => JSON.parse(kv.get(key.name)));
    sendJSON(res, { ok: true, data: products });
    return;
  }

  // GET /health
  if (url.pathname === '/health') {
    const keys = kv.list();
    const count = (keys.keys || []).filter(k => !k.name.startsWith('config:') && !k.name.startsWith('remind:') && !k.name.startsWith('logs:')).length;
    sendJSON(res, { status: 'ok', products: count, uptime: process.uptime() });
    return;
  }

  // GET /api/config
  if (url.pathname === '/api/config' && req.method === 'GET') {
    const intervalConfig = kv.get('config:interval');
    const interval = intervalConfig ? JSON.parse(intervalConfig).value : DEFAULT_CHECK_INTERVAL;
    sendJSON(res, { ok: true, config: { checkInterval: interval } });
    return;
  }

  res.writeHead(404, { ...corsHeaders, 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`\n🚀 WB Price Tracker — локальный сервер запущен`);
  console.log(`📡 Адрес: http://localhost:${PORT}`);
  console.log(`\nМаршруты:`);
  console.log(`  POST /telegram     — webhook от Telegram Bot`);
  console.log(`  POST /webhook      — данные от расширения Chrome`);
  console.log(`  GET  /api/products — список товаров`);
  console.log(`  GET  /api/config   — конфигурация`);
  console.log(`  GET  /health       — статус сервера`);
  console.log(`\n💾 База данных: wb_data.json (создаётся автоматически)`);
  console.log(`\n⚠️  Для Telegram webhook нужен публичный URL.`);
  console.log(`   Установите ngrok: https://ngrok.com`);
  console.log(`   Запустите:  ngrok http ${PORT}`);
  console.log(`   Скопируйте https://xxxx.ngrok.io и выполните:`);
  console.log(`   https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=https://xxxx.ngrok.io/telegram\n`);
});