'use strict';

let products = {};
let currentSort = 'added';
let selectedArticle = null;
let searchQuery = '';

// ---- Theme ----
function initTheme() {
  const saved = localStorage.getItem('wb-tracker-theme');
  const theme = saved || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('wb-tracker-theme', next);
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  loadAll();
  setupEvents();
});

chrome.runtime.onMessage.addListener(function(msg) {
  if (msg.type === 'PRICES_UPDATED') loadAll();
});

function setupEvents() {
  document.getElementById('btn-add').addEventListener('click', handleAdd);
  document.getElementById('input-article').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleAdd();
  });
  document.getElementById('btn-refresh-all').addEventListener('click', refreshAll);
  document.getElementById('btn-export').addEventListener('click', exportJson);
  document.getElementById('btn-theme').addEventListener('click', toggleTheme);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
  
  // Search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      searchQuery = e.target.value.trim().toLowerCase();
      renderGrid();
    });
  }
  
  document.querySelectorAll('.sort-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.sort-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentSort = btn.dataset.sort;
      renderGrid();
    });
  });
}

// ---- Data ----
function loadAll() {
  chrome.runtime.sendMessage({ type: 'PRICE_GET_ALL' }, function(res) {
    if (res && res.store) {
      products = res.store.products || {};
      updateStats(res.store);
      renderGrid();
    }
  });
}

function updateStats(store) {
  const list = Object.values(store.products || {});
  document.getElementById('stat-count').textContent = list.length;

  let up = 0, down = 0;
  list.forEach(function(p) {
    const h = p.history || [];
    if (h.length < 2) return;
    const diff = h[h.length-1].price - h[h.length-2].price;
    if (diff > 0) up++;
    else if (diff < 0) down++;
  });
  document.getElementById('stat-up').textContent = up;
  document.getElementById('stat-down').textContent = down;

  if (store.lastChecked) {
    document.getElementById('last-check').textContent = 'Обновлено: ' + formatTime(store.lastChecked);
  }
}

// ---- Add ----
function extractArticle(raw) {
  // Support full WB URLs: wildberries.ru/catalog/574472796/detail.aspx
  var urlMatch = raw.match(/catalog\/?(\d{5,})/);
  if (urlMatch) return urlMatch[1];
  // Just digits
  var digits = raw.replace(/\D/g, '');
  return digits;
}

function handleAdd() {
  const raw = document.getElementById('input-article').value.trim();
  const article = extractArticle(raw);
  const hint = document.getElementById('add-hint');
  const btn = document.getElementById('btn-add');

  if (!article || article.length < 5) {
    setHint('Введите артикул или вставьте ссылку на товар WB', 'error');
    return;
  }

  btn.textContent = 'Загрузка...';
  btn.classList.add('loading');
  setHint('Получаем информацию о товаре...', 'info');

  chrome.runtime.sendMessage({ type: 'PRICE_ADD', article: article }, function(res) {
    btn.textContent = 'Добавить';
    btn.classList.remove('loading');

    if (!res) {
      setHint('Нет ответа от расширения. Перезагрузите страницу.', 'error');
      return;
    }
    if (!res.ok) {
      const msg = res.error || 'Неизвестная ошибка';
      setHint(msg.includes('вкладк') ? 'Откройте вкладку wildberries.ru и попробуйте снова' : 'Ошибка: ' + msg, 'error');
      return;
    }
    document.getElementById('input-article').value = '';
    setHint('Добавлено: ' + res.product.name, 'success');
    products[article] = res.product;
    renderGrid();
    updateStats({ products: products });
    setTimeout(function() { setHint('', ''); }, 4000);
  });
}

function setHint(text, type) {
  const el = document.getElementById('add-hint');
  el.textContent = text;
  el.className = 'add-hint' + (type ? ' ' + type : '');
}

// ---- Refresh ----
function refreshAll() {
  const btn = document.getElementById('btn-refresh-all');
  btn.classList.add('spinning');
  btn.disabled = true;
  chrome.runtime.sendMessage({ type: 'PRICE_REFRESH_ALL' }, function() {
    btn.classList.remove('spinning');
    btn.disabled = false;
    loadAll();
    showToast('Все цены обновлены', 'success');
  });
}

function refreshOne(article, btnEl) {
  if (btnEl) { btnEl.classList.add('spinning'); btnEl.disabled = true; }
  chrome.runtime.sendMessage({ type: 'PRICE_REFRESH_ONE', article: article }, function(res) {
    if (btnEl) { btnEl.classList.remove('spinning'); btnEl.disabled = false; }
    if (res && res.ok) {
      products[article] = res.product;
      renderGrid();
      if (selectedArticle === article) openModal(article);
      showToast('Обновлено', 'success');
    } else {
      showToast('Ошибка: ' + (res && res.error || 'неизвестная'), 'error');
    }
  });
}

function removeProduct(article) {
  chrome.runtime.sendMessage({ type: 'PRICE_REMOVE', article: article }, function() {
    delete products[article];
    renderGrid();
    updateStats({ products: products });
    showToast('Удалено', '');
  });
}

// ---- Render Grid ----
function getSortedProducts() {
  let list = Object.values(products);
  
  // Search filter
  if (searchQuery) {
    list = list.filter(function(p) {
      return (p.name || '').toLowerCase().includes(searchQuery) ||
        (p.article || '').includes(searchQuery) ||
        (p.brand || '').toLowerCase().includes(searchQuery);
    });
  }
  
  return list.sort(function(a, b) {
    if (currentSort === 'added') return (b.addedAt || 0) - (a.addedAt || 0);
    if (currentSort === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (currentSort === 'price-desc') return (b.price || 0) - (a.price || 0);
    if (currentSort === 'name') return (a.name || '').localeCompare(b.name || '');
    if (currentSort === 'change') {
      const da = getPriceDiff(a), db = getPriceDiff(b);
      return da - db;
    }
    return 0;
  });
}

function getPriceDiff(p) {
  const h = p.history || [];
  if (h.length < 2) return 0;
  return h[h.length-1].price - h[0].price;
}

function getLastDiff(p) {
  const h = p.history || [];
  if (h.length < 2) return 0;
  return h[h.length-1].price - h[h.length-2].price;
}

function renderGrid() {
  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('empty-state');
  const sorted = getSortedProducts();

  if (!sorted.length) {
    if (empty) empty.style.display = '';
    // Remove all cards but keep empty state
    Array.from(grid.children).forEach(function(c) {
      if (!c.classList.contains('empty-state')) c.remove();
    });
    return;
  }
  if (empty) empty.style.display = 'none';

  // Clear all existing cards (keep only empty-state)
  Array.from(grid.children).forEach(function(c) {
    if (!c.classList.contains('empty-state')) c.remove();
  });

  // Render sorted products
  sorted.forEach(function(p) {
    const card = buildCard(p);
    grid.appendChild(card);
    // Draw sparkline after DOM insertion
    const canvas = card.querySelector('.sparkline-canvas');
    if (canvas && p.history && p.history.length > 1) {
      drawSparkline(canvas, p.history.map(function(h) { return h.price; }));
    }
  });
}

function buildCard(p) {
  const diff = getLastDiff(p);
  const totalDiff = getPriceDiff(p);

  const card = document.createElement('div');
  card.className = 'card' + (diff > 0 ? ' price-up' : diff < 0 ? ' price-down' : '');
  card.dataset.article = p.article;

  // Image
  const imgHtml = p.imageUrl
    ? '<img class="card-img" src="' + p.imageUrl + '" alt="" data-article="' + p.article + '">'
    : '<div class="card-img-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div>';

  // Price
  const priceHtml = p.price
    ? '<span class="card-price">' + formatPrice(p.price) + ' ₽</span>' +
      (p.originalPrice && p.originalPrice > p.price
        ? '<span class="card-price-orig">' + formatPrice(p.originalPrice) + ' ₽</span>' +
          '<span class="card-price-discount">-' + Math.round((1 - p.price / p.originalPrice) * 100) + '%</span>'
        : '')
    : '<div class="card-no-price">Цена недоступна</div>';

  // Change badge
  let changeBadge = '';
  if (diff !== 0) {
    const sign = diff > 0 ? '+' : '';
    const cls = diff > 0 ? 'up' : 'down';
    changeBadge = '<span class="change-badge ' + cls + '">' + sign + diff + ' ₽</span>';
  } else if (p.history && p.history.length > 1) {
    changeBadge = '<span class="change-badge none">без изменений</span>';
  }

  // Total change
  let totalBadge = '';
  if (totalDiff !== 0 && p.history && p.history.length > 2) {
    const sign = totalDiff > 0 ? '+' : '';
    const cls = totalDiff > 0 ? 'up' : 'down';
    totalBadge = '<span class="change-badge ' + cls + '" style="font-size:10px;opacity:.7" title="Общее изменение">' + sign + totalDiff + ' ₽ всего</span>';
  }

  const rating = p.rating ? '<span class="star">★</span>' + p.rating.toFixed(1) : '';
  const feedbacks = p.feedbacks ? p.feedbacks.toLocaleString('ru') + ' отзывов' : '';

  card.innerHTML =
    '<div class="card-header">' +
      imgHtml +
      '<div class="card-meta">' +
        (p.brand ? '<div class="card-brand">' + esc(p.brand) + '</div>' : '') +
        '<div class="card-name">' + esc(p.name || 'Товар ' + p.article) + '</div>' +
        '<div class="card-article">арт. ' + esc(p.article) + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="card-body">' +
      '<div class="card-price-row">' + priceHtml + '</div>' +
      '<div class="card-change">' + changeBadge + totalBadge +
        (p.checkedAt ? '<span class="change-date">' + formatTime(p.checkedAt) + '</span>' : '') +
      '</div>' +
      (p.history && p.history.length > 1 ? '<div class="sparkline-wrap"><canvas class="sparkline-canvas" height="40"></canvas></div>' : '') +
      '<div class="card-footer">' +
        '<div>' +
          (rating ? '<div class="card-rating">' + rating + '</div>' : '') +
          (feedbacks ? '<div class="card-feedbacks">' + feedbacks + '</div>' : '') +
        '</div>' +
        '<div class="card-actions">' +
          '<button class="card-btn open" data-action="open" title="На WB">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>' +
            '</svg>' +
          '</button>' +
          '<button class="card-btn refresh" data-action="refresh" title="Обновить">' +
            '<svg class="ri" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M23 4v6h-6M20.49 15a9 9 0 11-2.12-9.36L23 10"/>' +
            '</svg>' +
          '</button>' +
          '<button class="card-btn del" data-action="delete" title="Удалить">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  // Events
  card.addEventListener('click', function(e) {
    const action = e.target.closest('[data-action]');
    if (!action) {
      openModal(p.article);
      return;
    }
    e.stopPropagation();
    const a = action.dataset.action;
    if (a === 'delete') removeProduct(p.article);
    else if (a === 'open') window.open(p.url, '_blank');
    else if (a === 'refresh') refreshOne(p.article, action);
  });

  return card;
}

// ---- Sparkline ----
function drawSparkline(canvas, prices) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.offsetWidth || canvas.parentElement.offsetWidth || 280;
  const h = 40;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const min = Math.min.apply(null, prices);
  const max = Math.max.apply(null, prices);
  const range = max - min || 1;
  const pad = 4;

  const toX = function(i) { return pad + (i / (prices.length - 1)) * (w - pad * 2); };
  const toY = function(v) { return pad + (1 - (v - min) / range) * (h - pad * 2); };

  // Fill
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(249,115,22,.25)');
  grad.addColorStop(1, 'rgba(249,115,22,0)');
  ctx.beginPath();
  prices.forEach(function(v, i) {
    if (i === 0) ctx.moveTo(toX(i), toY(v));
    else ctx.lineTo(toX(i), toY(v));
  });
  ctx.lineTo(toX(prices.length - 1), h);
  ctx.lineTo(toX(0), h);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  prices.forEach(function(v, i) {
    if (i === 0) ctx.moveTo(toX(i), toY(v));
    else ctx.lineTo(toX(i), toY(v));
  });
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Last dot
  const lastX = toX(prices.length - 1);
  const lastY = toY(prices[prices.length - 1]);
  ctx.beginPath();
  ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#f97316';
  ctx.fill();
}

// ---- Modal ----
function openModal(article) {
  const p = products[article];
  if (!p) return;
  selectedArticle = article;

  const history = p.history || [];
  const diff = getLastDiff(p);
  const totalDiff = getPriceDiff(p);
  const discount = p.originalPrice && p.originalPrice > p.price
    ? Math.round((1 - p.price / p.originalPrice) * 100)
    : 0;

  const imgHtml = p.imageUrl
    ? '<img class="modal-img" src="' + p.imageUrl + '" alt="">'
    : '<div class="modal-img-placeholder">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
          '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>' +
        '</svg>' +
      '</div>';

  const priceColor = diff < 0 ? 'text-down' : diff > 0 ? 'text-up' : '';
  const changeIcon = diff < 0 ? 'down' : diff > 0 ? 'up' : '';

  // Stats
  const statsHtml = [
    p.rating ? '<div class="stat-box"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><span>' + p.rating.toFixed(1) + '</span></div>' : '',
    p.feedbacks ? '<div class="stat-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg><span>' + p.feedbacks.toLocaleString('ru') + '</span></div>' : '',
    history.length > 1 ? '<div class="stat-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg><span>мин. ' + formatPrice(Math.min.apply(null, history.map(function(h){return h.price;}))) + '</span></div>' : '',
    history.length > 1 ? '<div class="stat-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 18l-9.5-9.5-5 5L1 6"/><path d="M17 18h6v-6"/></svg><span>макс. ' + formatPrice(Math.max.apply(null, history.map(function(h){return h.price;}))) + '</span></div>' : ''
  ].filter(Boolean).join('');

  // History table (last 20 reversed)
  const histRows = [...history].reverse().slice(0, 20).map(function(h, i, arr) {
    const prevPrice = i < arr.length - 1 ? arr[i + 1].price : null;
    const d = prevPrice !== null ? h.price - prevPrice : 0;
    const diffClass = d !== 0 ? (d > 0 ? 'up' : 'down') : '';
    const diffStr = d !== 0 ? '<span class="history-diff ' + diffClass + '">' + (d > 0 ? '+' : '') + d + ' ₽</span>' : '<span class="history-diff">—</span>';
    return '<div class="history-row">' +
      '<span class="history-cell history-date">' + formatDateTime(h.ts) + '</span>' +
      '<span class="history-cell history-price">' + formatPrice(h.price) + ' ₽</span>' +
      diffStr +
      '</div>';
  }).join('');

  const content = document.getElementById('modal-content');
  content.innerHTML =
    '<div class="modal-header">' +
      '<div class="modal-image-wrap">' +
        imgHtml +
        (discount > 0 ? '<span class="discount-badge">-' + discount + '%</span>' : '') +
      '</div>' +
      '<div class="modal-info">' +
        (p.brand ? '<div class="modal-brand">' + esc(p.brand) + '</div>' : '') +
        '<div class="modal-name">' + esc(p.name || 'Товар ' + p.article) + '</div>' +
        '<div class="modal-article">арт. ' + esc(p.article) + '</div>' +
        (p.url ? '<a class="modal-open-link" href="' + p.url + '" target="_blank" rel="noopener noreferrer">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>' +
          '</svg>' +
          '<span>На Wildberries</span>' +
        '</a>' : '') +
      '</div>' +
    '</div>' +

    '<div class="modal-price-section">' +
      '<div class="modal-price-wrap">' +
        '<span class="modal-price ' + priceColor + '">' + formatPrice(p.price) + ' ₽</span>' +
        (p.originalPrice && p.originalPrice > p.price ? '<span class="modal-price-orig">' + formatPrice(p.originalPrice) + ' ₽</span>' : '') +
      '</div>' +
      (diff !== 0 ? '<div class="price-change ' + changeIcon + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          (diff > 0 ? '<path d="M12 19V5M5 12l7-7 7 7"/>' : '<path d="M12 5v14M19 12l-7 7-7-7"/>') +
        '</svg>' +
        '<span>' + (diff > 0 ? '+' : '') + diff + ' ₽ с прошлой проверки</span>' +
      '</div>' : '<div class="price-change stable"><span>Цена не изменилась</span></div>') +
    '</div>' +

    '<div class="modal-stats-grid">' + statsHtml + '</div>' +

    (history.length > 1
      ? '<div class="modal-section">' +
          '<div class="modal-section-title">График цены</div>' +
          '<div class="price-history-chart"><canvas id="modal-chart" height="140"></canvas></div>' +
        '</div>'
      : '') +

    (history.length > 0
      ? '<div class="modal-section">' +
          '<div class="modal-section-title">История изменений <span class="history-count">(' + history.length + ')</span></div>' +
          '<div class="history-table">' +
            '<div class="history-row header">' +
              '<span class="history-cell history-date">Дата</span>' +
              '<span class="history-cell history-price">Цена</span>' +
              '<span class="history-cell history-diff">Изм.</span>' +
            '</div>' +
            histRows +
          '</div>' +
        '</div>'
      : '') +

    '<div class="modal-footer">' +
      '<button class="modal-btn btn-delete" data-action="delete" title="Удалить товар">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>' +
        '</svg>' +
      '</button>' +
      '<button class="modal-btn btn-refresh" data-action="refresh" title="Обновить цену">' +
        '<svg class="ri" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '<path d="M23 4v6h-6M20.49 15a9 9 0 11-2.12-9.36L23 10"/>' +
        '</svg>' +
      '</button>' +
    '</div>' +

    '<div class="modal-actions">' +
      '<a href="' + (p.url || '#') + '" target="_blank" rel="noopener noreferrer" class="modal-btn btn-secondary btn-full">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>' +
        '</svg>' +
        '<span>Открыть на WB</span>' +
      '</a>' +
    '</div>';

  // Events for modal buttons
  content.querySelector('[data-action="delete"]')?.addEventListener('click', function() {
    closeModal();
    removeProduct(p.article);
  });
  content.querySelector('[data-action="refresh"]')?.addEventListener('click', function() {
    refreshOne(p.article, this);
  });

  document.getElementById('modal').style.display = 'flex';

  // Draw full chart
  if (history.length > 1) {
    requestAnimationFrame(function() {
      const canvas = document.getElementById('modal-chart');
      if (canvas) drawFullChart(canvas, history);
    });
  }
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  selectedArticle = null;
}

// ---- Full chart ----
function drawFullChart(canvas, history) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.parentElement.offsetWidth - 32;
  const h = 140;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const prices = history.map(function(h) { return h.price; });
  const min = Math.min.apply(null, prices);
  const max = Math.max.apply(null, prices);
  const range = max - min || 1;
  const padX = 8, padY = 12;

  const toX = function(i) { return padX + (i / (prices.length - 1)) * (w - padX * 2); };
  const toY = function(v) { return padY + (1 - (v - min) / range) * (h - padY * 2); };

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    const y = padY + (i / 3) * (h - padY * 2);
    ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(w - padX, y); ctx.stroke();
  }

  // Fill
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(249,115,22,.25)');
  grad.addColorStop(1, 'rgba(249,115,22,0)');
  ctx.beginPath();
  prices.forEach(function(v, i) {
    if (i === 0) ctx.moveTo(toX(i), toY(v));
    else ctx.lineTo(toX(i), toY(v));
  });
  ctx.lineTo(toX(prices.length - 1), h); ctx.lineTo(toX(0), h);
  ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

  // Line
  ctx.beginPath();
  prices.forEach(function(v, i) {
    if (i === 0) ctx.moveTo(toX(i), toY(v));
    else ctx.lineTo(toX(i), toY(v));
  });
  ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();

  // Price labels
  ctx.fillStyle = 'rgba(161,161,170,.6)'; ctx.font = '10px JetBrains Mono,monospace'; ctx.textAlign = 'right';
  ctx.fillText(formatPrice(max) + ' ₽', w - padX, padY + 8);
  ctx.fillText(formatPrice(min) + ' ₽', w - padX, h - padY + 4);

  // Dots at price changes
  prices.forEach(function(v, i) {
    if (i === 0 || i === prices.length - 1 || prices[i] !== prices[i-1]) {
      ctx.beginPath();
      ctx.arc(toX(i), toY(v), 3, 0, Math.PI * 2);
      ctx.fillStyle = prices[i] < (prices[i-1] || prices[i]) ? '#22c55e' : prices[i] > (prices[i-1] || prices[i]) ? '#ef4444' : '#f97316';
      ctx.fill();
    }
  });
}

// ---- Utils ----
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatPrice(n) {
  return Number(n).toLocaleString('ru-RU');
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }) + ' ' +
    d.toLocaleDateString('ru', { day: '2-digit', month: '2-digit' });
}

function formatDateTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('ru', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' +
    d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}

function showToast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (type ? ' ' + type : '');
  setTimeout(function() { el.classList.remove('show'); }, 2500);
}

function exportJson() {
  chrome.runtime.sendMessage({ type: 'EXPORT_JSON' }, function(res) {
    if (!res || !res.ok) {
      showToast('Ошибка экспорта', 'error');
      return;
    }

    const json = JSON.stringify(res.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wb-prices-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Экспортировано ' + res.data.total_count + ' товаров', 'success');
  });
}

