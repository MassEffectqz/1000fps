"use strict";

let products = {};

// ---- Theme ----
function initTheme() {
  const saved = localStorage.getItem("wb-popup-theme");
  const theme = saved || "dark";
  document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("wb-popup-theme", next);
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", function () {
  initTheme();
  loadProducts();
  setupEvents();
  loadAutoParseSetting();
});

chrome.runtime.onMessage.addListener(function (msg) {
  if (msg.type === "PRICES_UPDATED") {
    loadProducts();
  }
});

function setupEvents() {
  document.getElementById("btn-add").addEventListener("click", handleAdd);
  document
    .getElementById("input-article")
    .addEventListener("keydown", function (e) {
      if (e.key === "Enter") handleAdd();
    });
  document
    .getElementById("btn-refresh-all")
    .addEventListener("click", refreshAll);
  document.getElementById("btn-sync").addEventListener("click", syncFromWorker);
  document
    .getElementById("btn-check-pending")
    .addEventListener("click", checkPending);
  document.getElementById("btn-export").addEventListener("click", exportJson);
  document.getElementById("btn-info").addEventListener("click", showInfo);
  document.getElementById("btn-theme").addEventListener("click", toggleTheme);
  document
    .getElementById("btn-open-tracker")
    .addEventListener("click", function () {
      chrome.runtime.sendMessage({ type: "OPEN_TRACKER" });
      window.close();
    });

  // Кнопка импорта с сервера
  const importBtn = document.createElement("button");
  importBtn.id = "btn-import";
  importBtn.className = "btn-icon";
  importBtn.title = "Загрузить с сервера";
  importBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/><path d="M12 8v8M8 12h8"/></svg>';
  document.getElementById("btn-info").before(importBtn);
  importBtn.addEventListener("click", importFromServer);

  // Переключатель автопарсинга
  const autoParseCheckbox = document.getElementById("auto-parse-enabled");
  autoParseCheckbox.addEventListener("change", function (e) {
    const enabled = e.target.checked;
    chrome.storage.local.set({ autoParseEnabled: enabled }, function () {
      showToast(enabled ? "Автопарсинг включён" : "Автопарсинг выключен");
    });
  });

  // Настройка backend URL
  const backendUrlInput = document.getElementById("backend-url-input");
  backendUrlInput.addEventListener("change", function () {
    const url = this.value.trim();
    if (url) {
      chrome.storage.local.set({ backendUrl: url }, function () {
        showToast("Backend URL сохранён");
      });
    }
  });

  // Настройка автозакрытия вкладок
  const autoCloseCheckbox = document.getElementById("auto-close-enabled");
  autoCloseCheckbox.addEventListener("change", function (e) {
    const enabled = e.target.checked;
    chrome.storage.local.set({ autoCloseEnabled: enabled }, function () {
      showToast(enabled ? "Автозакрытие включено" : "Автозакрытие выключено");
    });
  });
}

function loadAutoParseSetting() {
  chrome.storage.local.get(["autoParseEnabled"], function (result) {
    const checkbox = document.getElementById("auto-parse-enabled");
    // По умолчанию включено
    checkbox.checked = result.autoParseEnabled !== false;
  });

  // Загрузка backend URL
  chrome.storage.local.get(["backendUrl"], function (result) {
    const input = document.getElementById("backend-url-input");
    if (input) {
      input.value = result.backendUrl || "http://localhost:3002";
    }
  });

  // Загрузка настройки автозакрытия
  chrome.storage.local.get(["autoCloseEnabled"], function (result) {
    const checkbox = document.getElementById("auto-close-enabled");
    // По умолчанию выключено
    checkbox.checked = result.autoCloseEnabled === true;
  });
}

function checkPending() {
  const btn = document.getElementById("btn-check-pending");
  btn.classList.add("spinning");
  showToast("Проверка pending товаров...");

  chrome.runtime.sendMessage({ type: "SYNC_PENDING" }, function (res) {
    btn.classList.remove("spinning");
    if (res && res.ok) {
      if (res.checked > 0) {
        showToast(`Проверено ${res.checked} товаров`);
      } else {
        showToast("Нет pending товаров");
      }
      loadProducts();
    }
  });
}

function loadProducts() {
  chrome.runtime.sendMessage({ type: "PRICE_GET_ALL" }, function (res) {
    if (res && res.store) {
      products = res.store.products || {};
      updateStats(res.store);
      renderList();
    }
  });
}

function updateStats(store) {
  const count = Object.keys(store.products || {}).length;
  document.getElementById("stat-count").textContent = count;

  if (store.lastChecked) {
    const d = new Date(store.lastChecked);
    document.getElementById("last-check").textContent = d.toLocaleTimeString(
      "ru",
      { hour: "2-digit", minute: "2-digit" },
    );
  }

  // Показываем статистику изменений если есть
  if (store.lastStats) {
    const { priceChanged, errors } = store.lastStats;
    const toast = document.getElementById("toast");
    if (priceChanged > 0 && toast && !toast.classList.contains("show")) {
      showToast(`💰 Изменилось цен: ${priceChanged}`, "info");
    }
  }
}

function extractArticle(raw) {
  const urlMatch = raw.match(/catalog\/?(\d{5,})/);
  if (urlMatch) return urlMatch[1];
  return raw.replace(/\D/g, "");
}

function handleAdd() {
  const raw = document.getElementById("input-article").value.trim();
  const article = extractArticle(raw);
  const btn = document.getElementById("btn-add");

  if (!article || article.length < 5) {
    setHint("Введите артикул или вставьте ссылку", "error");
    return;
  }

  btn.disabled = true;
  setHint("Загрузка информации...", "info");

  chrome.runtime.sendMessage(
    { type: "PRICE_ADD", article: article },
    function (res) {
      btn.disabled = false;

      if (!res) {
        setHint("Нет ответа. Откройте wildberries.ru", "error");
        return;
      }

      if (!res.ok) {
        const msg = res.error || "Ошибка";
        setHint(
          msg.includes("вкладк") ? "Откройте wildberries.ru" : "Ошибка: " + msg,
          "error",
        );
        return;
      }

      document.getElementById("input-article").value = "";
      setHint("Добавлено: " + res.product.name, "success");
      products[article] = res.product;
      renderList();
      updateStats({ products: products });

      setTimeout(function () {
        setHint("", "");
      }, 3000);
    },
  );
}

function setHint(text, type) {
  const el = document.getElementById("add-hint");
  el.textContent = text;
  el.className = "add-hint " + (type || "");
}

function showToast(msg, type) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.className = "toast show" + (type ? " " + type : "");
  setTimeout(function () {
    el.classList.remove("show");
  }, 2500);
}

function refreshAll() {
  const btn = document.getElementById("btn-refresh-all");
  btn.classList.add("spinning");
  btn.disabled = true;

  chrome.runtime.sendMessage({ type: "PRICE_REFRESH_ALL" }, function (res) {
    btn.classList.remove("spinning");
    btn.disabled = false;

    if (res && res.ok) {
      loadProducts();
      showToast("Все цены обновлены", "success");
    } else {
      const errorMsg = res && res.error ? res.error : "Ошибка обновления";
      showToast(errorMsg, "error");
    }
  });
}

function refreshOne(article) {
  chrome.runtime.sendMessage(
    { type: "PRICE_REFRESH_ONE", article: article },
    function (res) {
      if (res && res.ok) {
        products[article] = res.product;
        renderList();
        showToast("Обновлено", "success");
      } else {
        showToast("Ошибка: " + ((res && res.error) || "неизвестная"), "error");
      }
    },
  );
}

function removeProduct(article) {
  chrome.runtime.sendMessage(
    { type: "PRICE_REMOVE", article: article },
    function () {
      delete products[article];
      renderList();
      updateStats({ products: products });
    },
  );
}

function renderList() {
  const container = document.getElementById("products-list");
  const list = Object.values(products);

  if (!list.length) {
    container.innerHTML =
      '<div class="empty-state">' +
      '<svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
      '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>' +
      "</svg>" +
      '<div class="empty-title">Нет товаров</div>' +
      '<div class="empty-sub">Добавьте первый товар</div>' +
      "</div>";
    return;
  }

  container.innerHTML = "";

  list.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));

  list.forEach(function (p) {
    const item = document.createElement("div");
    item.className = "product-item";

    const lastPrice =
      p.history && p.history.length > 1
        ? p.history[p.history.length - 2].price
        : null;
    const priceClass =
      lastPrice !== null
        ? p.price > lastPrice
          ? "up"
          : p.price < lastPrice
            ? "down"
            : ""
        : "";

    const imgHtml = p.imageUrl
      ? '<img class="product-img" src="' + p.imageUrl + '" alt="">'
      : '<div class="product-img-placeholder">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
        '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>' +
        "</svg>" +
        "</div>";

    item.innerHTML =
      imgHtml +
      '<div class="product-info">' +
      '<div class="product-name">' +
      esc(p.name || "Товар " + p.article) +
      "</div>" +
      '<div class="product-article">арт. ' +
      esc(p.article) +
      "</div>" +
      "</div>" +
      '<div class="product-price ' +
      priceClass +
      '">' +
      formatPrice(p.price) +
      " ₽</div>" +
      '<div class="product-actions">' +
      '<button class="btn-icon" data-action="refresh" title="Обновить">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M23 4v6h-6M20.49 15a9 9 0 11-2.12-9.36L23 10"/>' +
      "</svg>" +
      "</button>" +
      '<button class="btn-icon del" data-action="delete" title="Удалить">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>' +
      "</svg>" +
      "</button>" +
      "</div>";

    item.addEventListener("click", function (e) {
      if (e.target.closest("[data-action]")) return;
      window.open(p.url, "_blank");
    });

    item
      .querySelector('[data-action="refresh"]')
      .addEventListener("click", function (e) {
        e.stopPropagation();
        refreshOne(p.article);
      });

    item
      .querySelector('[data-action="delete"]')
      .addEventListener("click", function (e) {
        e.stopPropagation();
        removeProduct(p.article);
      });

    container.appendChild(item);
  });
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatPrice(n) {
  return Number(n).toLocaleString("ru-RU");
}

function exportJson() {
  chrome.runtime.sendMessage({ type: "EXPORT_JSON" }, function (res) {
    if (!res || !res.ok) {
      setHint("Ошибка экспорта", "error");
      return;
    }

    const json = JSON.stringify(res.data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wb-prices-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setHint("Экспортировано " + res.data.total_count + " товаров", "success");
    setTimeout(function () {
      setHint("", "");
    }, 3000);
  });
}

function showInfo() {
  chrome.runtime.sendMessage({ type: "GET_CACHE_INFO" }, function (info) {
    if (!info) {
      setHint("Нет информации", "error");
      return;
    }

    const msg =
      "1000fps WB Парсер\n\n" +
      "Endpoint'ов: " +
      info.endpoints +
      "\n" +
      "Рабочий API: #" +
      (info.cache.workingEndpoint + 1) +
      "\n" +
      "Dest: " +
      (info.cache.dest || "не определён") +
      "\n" +
      "Кэш dest: " +
      (info.cache.destTs
        ? new Date(info.cache.destTs).toLocaleTimeString()
        : "нет") +
      "\n" +
      (info.cache.lastError ? "\nОшибка: " + info.cache.lastError : "");

    alert(msg);
  });
}

function syncFromWorker() {
  const btn = document.getElementById("btn-sync");
  btn.disabled = true;

  chrome.runtime.sendMessage({ type: "SYNC_FROM_WORKER" }, function (res) {
    btn.disabled = false;

    if (res && res.ok) {
      setHint("Синхронизировано: " + res.count + " товаров", "success");
      loadProducts();
    } else {
      setHint("Ошибка синхронизации", "error");
    }

    setTimeout(function () {
      setHint("", "");
    }, 3000);
  });
}

// Импорт товаров с сервера
async function importFromServer() {
  setHint("Загрузка с сервера...", "info");

  try {
    const resp = await fetch("http://localhost:3002/api/products");
    if (!resp.ok) throw new Error("Ошибка сервера");
    const data = await resp.json();

    const serverProducts = data.products || [];
    if (!serverProducts.length) {
      setHint("На сервере нет товаров", "error");
      setTimeout(() => setHint("", ""), 3000);
      return;
    }

    // Получаем текущие товары из правильного хранилища (wbPrices)
    const storeData = await chrome.storage.local.get("wbPrices");
    const store = storeData.wbPrices || { products: {} };
    const existing = store.products || {};

    // Добавляем новые товары с сервера
    let added = 0;
    for (const p of serverProducts) {
      const article = p.wb_article || p.article;
      if (article && !existing[article]) {
        existing[article] = {
          article: article,
          name: p.name || p.title || "Товар " + article,
          price: p.price || 0,
          oldPrice: p.old_price || p.price || 0,
          addedAt: new Date().toISOString(),
        };
        added++;
      }
    }

    // Сохраняем в правильном формате (wbPrices)
    store.products = existing;
    await chrome.storage.local.set({ wbPrices: store });

    // Уведомляем background об изменении
    chrome.runtime.sendMessage({ type: "PRODUCTS_IMPORTED", count: added });

    setHint("Импортировано: " + added + " товаров", "success");

    // Обновляем UI
    products = existing;
    renderList();
    updateStats({ products: existing, lastChecked: Date.now() });
  } catch (e) {
    console.error(e);
    setHint("Ошибка импорта: " + e.message, "error");
  }

  setTimeout(() => setHint("", ""), 3000);
}
