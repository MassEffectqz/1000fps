'use strict';

// ==================== TRACKER LOGIC ====================

let allProducts = {};
let currentSort = 'addedAt-desc';
let currentFilter = 'all';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  initTracker();
});

async function initTracker() {
  // Load initial data
  await loadProducts();

  // Event listeners
  document.getElementById('searchInput').addEventListener('input', debounce(onSearchInput, 300));
  document.getElementById('sortSelect').addEventListener('change', onSortChange);
  document.getElementById('statusFilter').addEventListener('change', onFilterChange);
  document.getElementById('refreshBtn').addEventListener('click', onRefreshAll);
  document.getElementById('exportBtn').addEventListener('click', onExport);
  document.getElementById('backToPopupBtn').addEventListener('click', () => window.close());
  document.getElementById('historyModalClose').addEventListener('click', closeHistoryModal);
  document.getElementById('historyModal').addEventListener('click', onModalOverlayClick);

  // Listen for updates from background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'PRICES_UPDATED') {
      loadProducts();
    }
  });

  // Periodic refresh
  setInterval(loadProducts, 30000);
}

async function loadProducts() {
  try {
    const data = await chrome.storage.local.get('wbPrices');
    allProducts = data.wbPrices?.products || {};
    renderProducts();
    updateStats();
  } catch (e) {
    console.error('Load products error:', e);
  }
}

function renderProducts() {
  const tbody = document.getElementById('productsTableBody');
  const emptyState = document.getElementById('emptyState');
  const table = document.getElementById('productsTable');

  let products = Object.values(allProducts);

  // Apply search filter
  if (currentSearch) {
    const search = currentSearch.toLowerCase();
    products = products.filter(p =>
      p.article?.toLowerCase().includes(search) ||
      p.name?.toLowerCase().includes(search)
    );
  }

  // Apply status filter
  if (currentFilter === 'in-stock') {
    products = products.filter(p => !p.outOfStock && p.stockQuantity > 0);
  } else if (currentFilter === 'out-of-stock') {
    products = products.filter(p => p.outOfStock || p.stockQuantity === 0);
  } else if (currentFilter === 'price-changed') {
    products = products.filter(p => {
      const history = p.history || [];
      return history.length > 1;
    });
  }

  // Apply sorting
  products.sort((a, b) => {
    const [field, direction] = currentSort.split('-');
    const multiplier = direction === 'asc' ? 1 : -1;

    switch (field) {
      case 'addedAt':
        return multiplier * (new Date(a.addedAt || 0) - new Date(b.addedAt || 0));
      case 'price':
        return multiplier * ((a.price || 0) - (b.price || 0));
      case 'name':
        return multiplier * ((a.name || '').localeCompare(b.name || '', 'ru'));
      case 'change':
        const changeA = getPriceChange(a);
        const changeB = getPriceChange(b);
        return multiplier * (changeA - changeB);
      default:
        return 0;
    }
  });

  // Update product count
  document.getElementById('productCount').textContent = `${products.length} товаров`;

  // Show/hide empty state
  if (products.length === 0) {
    table.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }

  table.style.display = 'table';
  emptyState.style.display = 'none';

  // Render rows
  tbody.innerHTML = products.map(product => {
    const history = product.history || [];
    const lastPrice = history.length > 1 ? history[history.length - 2].price : null;
    const priceChange = lastPrice !== null ? product.price - lastPrice : 0;
    const priceChangePercent = lastPrice ? ((priceChange / lastPrice) * 100).toFixed(1) : 0;

    const deliveryText = product.deliveryMin && product.deliveryMax
      ? `${product.deliveryMin}–${product.deliveryMax} дн.`
      : '-';

    const stockText = product.outOfStock
      ? '<span class="stock-badge out">Нет</span>'
      : `<span class="stock-badge in">${product.stockQuantity || 0}</span>`;

    const changeClass = priceChange > 0 ? 'price-up' : priceChange < 0 ? 'price-down' : 'price-same';
    const changeText = priceChange !== 0
      ? `<span class="${changeClass}">${priceChange > 0 ? '+' : ''}${priceChange}₽ (${priceChangePercent}%)</span>`
      : '<span class="price-same">-</span>';

    const addedDate = product.addedAt
      ? new Date(product.addedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
      : '-';

    return `
      <tr class="product-row ${product.outOfStock ? 'out-of-stock' : ''}">
        <td class="col-article">
          <span class="article-badge">${product.article}</span>
        </td>
        <td class="col-name">
          <a href="${product.url || '#'}" target="_blank" class="product-link" title="${escapeHtml(product.name || '')}">
            ${escapeHtml(truncate(product.name || 'Товар', 50))}
          </a>
        </td>
        <td class="col-price">
          <span class="current-price">${product.price ? `${product.price}₽` : '-'}</span>
        </td>
        <td class="col-old-price">
          ${product.originalPrice ? `<span class="old-price">${product.originalPrice}₽</span>` : '-'}
        </td>
        <td class="col-change">${changeText}</td>
        <td class="col-stock">${stockText}</td>
        <td class="col-delivery">${deliveryText}</td>
        <td class="col-date">${addedDate}</td>
        <td class="col-actions">
          <button class="action-icon" onclick="showHistory('${product.article}')" title="История цен">&#128200;</button>
          <button class="action-icon" onclick="refreshProduct('${product.article}')" title="Обновить">&#8635;</button>
          <button class="action-icon delete" onclick="removeProduct('${product.article}')" title="Удалить">&#10005;</button>
        </td>
      </tr>
    `;
  }).join('');
}

function updateStats() {
  const products = Object.values(allProducts);

  document.getElementById('totalProducts').textContent = products.length;
  document.getElementById('inStockCount').textContent = products.filter(p => !p.outOfStock).length;
  document.getElementById('outOfStockCount').textContent = products.filter(p => p.outOfStock).length;

  const changedCount = products.filter(p => (p.history || []).length > 1).length;
  document.getElementById('priceChangedCount').textContent = changedCount;

  const data = JSON.parse(localStorage.getItem('lastUpdate') || '0');
  document.getElementById('lastUpdate').textContent = formatTime(Date.now());
}

function getPriceChange(product) {
  const history = product.history || [];
  if (history.length < 2) return 0;
  return history[history.length - 1].price - history[history.length - 2].price;
}

// Make functions available globally for inline onclick
window.showHistory = function(article) {
  const product = allProducts[article];
  if (!product) return;

  const modal = document.getElementById('historyModal');
  const info = document.getElementById('historyProductInfo');
  const list = document.getElementById('priceHistoryList');

  info.innerHTML = `
    <div class="info-row">
      <span class="info-label">Артикул:</span>
      <span class="info-value">${product.article}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Название:</span>
      <span class="info-value">${escapeHtml(product.name || '-')}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Текущая цена:</span>
      <span class="info-value price-highlight">${product.price ? `${product.price}₽` : '-'}</span>
    </div>
  `;

  const history = product.history || [];
  if (history.length === 0) {
    list.innerHTML = '<p class="no-history">История цен отсутствует</p>';
  } else {
    list.innerHTML = `
      <table class="history-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Цена</th>
            <th>Изменение</th>
          </tr>
        </thead>
        <tbody>
          ${history.slice().reverse().map((entry, idx, arr) => {
            const prevEntry = arr[idx + 1];
            const change = prevEntry ? entry.price - prevEntry.price : 0;
            const changeClass = change > 0 ? 'price-up' : change < 0 ? 'price-down' : '';
            const changeText = change !== 0 ? `${change > 0 ? '+' : ''}${change}₽` : '-';
            return `
              <tr>
                <td>${new Date(entry.ts).toLocaleString('ru-RU')}</td>
                <td class="${changeClass}">${entry.price}₽</td>
                <td class="${changeClass}">${changeText}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  // Draw price chart
  drawPriceChart(history);

  modal.style.display = 'flex';
};

window.refreshProduct = async function(article) {
  try {
    chrome.runtime.sendMessage({ type: 'PRICE_REFRESH_ONE', article });
    showToast('Обновление запущено');
  } catch (e) {
    console.error('Refresh error:', e);
  }
};

window.removeProduct = async function(article) {
  if (!confirm(`Удалить товар ${article} из отслеживания?`)) return;

  try {
    chrome.runtime.sendMessage({ type: 'PRICE_REMOVE', article });
    delete allProducts[article];
    renderProducts();
    updateStats();
    showToast('Товар удалён');
  } catch (e) {
    console.error('Remove error:', e);
  }
};

function drawPriceChart(history) {
  const canvas = document.getElementById('priceCanvas');
  const ctx = canvas.getContext('2d');

  if (history.length < 2) {
    canvas.style.display = 'none';
    return;
  }

  canvas.style.display = 'block';
  const container = document.getElementById('priceHistoryChart');
  canvas.width = container.clientWidth - 40;
  canvas.height = 200;

  const prices = history.map(h => h.price);
  const minPrice = Math.min(...prices) * 0.95;
  const maxPrice = Math.max(...prices) * 1.05;
  const priceRange = maxPrice - minPrice || 1;

  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartWidth = canvas.width - padding.left - padding.right;
  const chartHeight = canvas.height - padding.top - padding.bottom;

  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw grid
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(canvas.width - padding.right, y);
    ctx.stroke();

    // Price labels
    const price = maxPrice - (priceRange / 4) * i;
    ctx.fillStyle = '#888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(price)}₽`, padding.left - 8, y + 4);
  }

  // Draw line
  ctx.strokeStyle = '#ff6600';
  ctx.lineWidth = 2;
  ctx.beginPath();

  history.forEach((entry, idx) => {
    const x = padding.left + (chartWidth / (history.length - 1)) * idx;
    const y = padding.top + chartHeight - ((entry.price - minPrice) / priceRange) * chartHeight;

    if (idx === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // Draw points
  history.forEach((entry, idx) => {
    const x = padding.left + (chartWidth / (history.length - 1)) * idx;
    const y = padding.top + chartHeight - ((entry.price - minPrice) / priceRange) * chartHeight;

    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Date labels
  ctx.fillStyle = '#666';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  const step = Math.ceil(history.length / 6);
  history.forEach((entry, idx) => {
    if (idx % step === 0 || idx === history.length - 1) {
      const x = padding.left + (chartWidth / (history.length - 1)) * idx;
      const date = new Date(entry.ts);
      ctx.fillText(`${date.getDate()}.${date.getMonth() + 1}`, x, canvas.height - 8);
    }
  });
}

function closeHistoryModal() {
  document.getElementById('historyModal').style.display = 'none';
}

function onModalOverlayClick(e) {
  if (e.target === document.getElementById('historyModal')) {
    closeHistoryModal();
  }
}

function onSearchInput(e) {
  currentSearch = e.target.value;
  renderProducts();
}

function onSortChange(e) {
  currentSort = e.target.value;
  renderProducts();
}

function onFilterChange(e) {
  currentFilter = e.target.value;
  renderProducts();
}

async function onRefreshAll() {
  const btn = document.getElementById('refreshBtn');
  btn.disabled = true;
  btn.innerHTML = '&#8635; Обновление...';

  try {
    chrome.runtime.sendMessage({ type: 'PRICE_REFRESH_ALL' });
    showToast('Проверка всех цен запущена');
  } catch (e) {
    console.error('Refresh all error:', e);
  }

  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = '&#8635; Обновить';
  }, 5000);
}

async function onExport() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'EXPORT_JSON' });
    if (response.ok && response.data) {
      downloadJSON(response.data);
      showToast('Данные экспортированы');
    }
  } catch (e) {
    console.error('Export error:', e);
  }
}

function downloadJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `1000fps-tracker-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==================== UTILITIES ====================

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function truncate(str, maxLen) {
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
}
