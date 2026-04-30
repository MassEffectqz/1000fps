// Content script для связи с админкой
// Слушает сообщения от страницы и передаёт в background

console.log('[1000fps-content] Loaded on', location.href);

// Слушаем сообщения от страницы
window.addEventListener('message', async (event) => {
  // Проверяем origin — принимаем только сообщения от нашего сайта
  if (event.origin !== window.location.origin) return;
  
  const msg = event.data;
  if (!msg || msg.type !== 'wb-parser-parse') return;
  
  console.log('[1000fps-content] Получен запрос парсинга:', msg);
  
  const { requestId, sources, productId } = msg;
  
  // Отправляем в background script
  try {
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'PRICE_PARSE',
        requestId,
        sources,
        productId,
      }, (res) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(res);
        }
      });
    });
    
    // Отправляем ответ обратно на страницу
    window.parent.postMessage({
      type: 'wb-parser-parse-response',
      requestId,
      response,
    }, event.origin);
    
    console.log('[1000fps-content] Ответ отправлен:', response);
  } catch (error) {
    console.error('[1000fps-content] Ошибка:', error);
    window.parent.postMessage({
      type: 'wb-parser-parse-response',
      requestId,
      response: { ok: false, error: error.message },
    }, event.origin);
  }
});

console.log('[1000fps-content] Ready');