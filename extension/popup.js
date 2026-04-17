'use strict';

// ==================== POPUP LOGIC ====================

document.addEventListener('DOMContentLoaded', () => {
  initPopup();
});

async function initPopup() {
  // Elements
  const autoParseToggle = document.getElementById('autoParseToggle');
  const autoCloseToggle = document.getElementById('autoCloseToggle');
  const parsedCount = document.getElementById('parsedCount');
  const successCount = document.getElementById('successCount');
  const errorCount = document.getElementById('errorCount');
  const changedCount = document.getElementById('changedCount');
  const lastCheckTime = document.getElementById('lastCheckTime');
  const statusIndicator = document.getElementById('statusIndicator');
  const refreshAllBtn = document.getElementById('refreshAllBtn');
  const openTrackerBtn = document.getElementById('openTrackerBtn');
  const settingsLink = document.getElementById('settingsLink');
  const exportBtn = document.getElementById('exportBtn');

  // Load settings from storage
  const settings = await chrome.storage.local.get([
    'autoParseEnabled',
    'autoCloseEnabled',
    'wbPrices'
  ]);

  // Set toggle states (default to true if not set)
  autoParseToggle.checked = settings.autoParseEnabled !== false;
  autoCloseToggle.checked = settings.autoCloseEnabled === true;

  // Update UI with store data
  updateStats(settings.wbPrices);
  updateStatus(autoParseToggle.checked);

  // Auto Parse Toggle
  autoParseToggle.addEventListener('change', async (e) => {
    await chrome.storage.local.set({ autoParseEnabled: e.target.checked });
    updateStatus(e.target.checked);
  });

  // Auto Close Toggle
  autoCloseToggle.addEventListener('change', async (e) => {
    await chrome.storage.local.set({ autoCloseEnabled: e.target.checked });
  });

  // Refresh All Button
  refreshAllBtn.addEventListener('click', async () => {
    refreshAllBtn.disabled = true;
    refreshAllBtn.innerHTML = '<span class="btn-icon spin">&#8635;</span> Обновление...';

    try {
      chrome.runtime.sendMessage({ type: 'PRICE_REFRESH_ALL' });
      // Show notification that background process started
      await showNotification('Проверка цен запущена', 'Результаты появятся после завершения');
    } catch (e) {
      console.error('Refresh error:', e);
    }

    setTimeout(() => {
      refreshAllBtn.disabled = false;
      refreshAllBtn.innerHTML = '<span class="btn-icon">&#8635;</span> Обновить все цены';
    }, 3000);
  });

  // Open Tracker Button
  openTrackerBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_TRACKER' });
    window.close();
  });

  // Settings Link
  settingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage?.() || chrome.tabs.create({
      url: chrome.runtime.getURL('tracker.html')
    });
    window.close();
  });

  // Export Button
  exportBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const response = await chrome.runtime.sendMessage({ type: 'EXPORT_JSON' });
      if (response.ok && response.data) {
        downloadJSON(response.data);
      }
    } catch (e) {
      console.error('Export error:', e);
    }
    window.close();
  });

  // Listen for price updates from background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'PRICES_UPDATED') {
      chrome.storage.local.get('wbPrices', (data) => {
        updateStats(data.wbPrices);
      });
    }
  });
}

function updateStats(store) {
  const parsedCount = document.getElementById('parsedCount');
  const successCount = document.getElementById('successCount');
  const errorCount = document.getElementById('errorCount');
  const changedCount = document.getElementById('changedCount');
  const lastCheckTime = document.getElementById('lastCheckTime');

  if (!store) {
    parsedCount.textContent = '0';
    successCount.textContent = '0';
    errorCount.textContent = '0';
    changedCount.textContent = '0';
    lastCheckTime.textContent = '-';
    return;
  }

  const products = store.products || {};
  const productCount = Object.keys(products).length;

  parsedCount.textContent = productCount;
  successCount.textContent = store.lastStats?.success || 0;
  errorCount.textContent = store.lastStats?.errors || 0;
  changedCount.textContent = store.lastStats?.priceChanged || 0;

  if (store.lastChecked) {
    lastCheckTime.textContent = formatTime(store.lastChecked);
  } else {
    lastCheckTime.textContent = '-';
  }
}

function updateStatus(enabled) {
  const indicator = document.getElementById('statusIndicator');
  const dot = indicator.querySelector('.status-dot');
  const text = indicator.querySelector('.status-text');

  if (enabled) {
    indicator.classList.add('active');
    indicator.classList.remove('inactive');
    dot.classList.add('active');
    text.textContent = 'Активен';
  } else {
    indicator.classList.add('inactive');
    indicator.classList.remove('active');
    dot.classList.remove('active');
    text.textContent = 'Отключён';
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);

  if (diffSec < 60) {
    return 'только что';
  } else if (diffMin < 60) {
    return `${diffMin} мин назад`;
  } else if (diffHours < 24) {
    return `${diffHours} ч назад`;
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

function downloadJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `1000fps-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function showNotification(title, message) {
  try {
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: title,
      message: message
    });
  } catch (e) {
    console.warn('Notification error:', e);
  }
}
