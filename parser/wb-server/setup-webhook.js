// Настройка Telegram webhook для ngrok
// Запуск: node setup-webhook.js

const TELEGRAM_BOT_TOKEN = '8346542644:AAG3QY4uNVL7h21dlulFsZZLcdIegWfFQb8';

// ngrok URL (обновляйте при каждом перезапуске ngrok)
// Проверить актуальный URL: http://127.0.0.1:4040/api/tunnels
const NGROK_URL = 'https://nonbearded-zetta-gemmiferous.ngrok-free.dev';

async function setupWebhook() {
  const webhookUrl = `${NGROK_URL}/telegram`;
  
  console.log('🔧 Настройка Telegram webhook...');
  console.log(`   URL: ${webhookUrl}`);
  
  try {
    // Удаляем старый webhook
    const deleteResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`);
    const deleteResult = await deleteResponse.json();
    console.log('📤 Старый webhook удалён:', deleteResult.ok);
    
    // Устанавливаем новый
    const setResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query']
      })
    });
    
    const setResult = await setResponse.json();
    
    if (setResult.ok) {
      console.log('✅ Webhook установлен успешно!');
      console.log(`   Бот будет получать сообщения на: ${webhookUrl}`);
      
      // Проверяем webhook
      const infoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
      const info = await infoResponse.json();
      if (info.result) {
        console.log('\n📊 Информация о webhook:');
        console.log(`   URL: ${info.result.url}`);
        console.log(`   Статус: ${info.result.last_error_date ? 'Активен' : 'Ожидает сообщений'}`);
        if (info.result.last_error_message) {
          console.log(`   Последняя ошибка: ${info.result.last_error_message}`);
        }
      }
    } else {
      console.error('❌ Ошибка:', setResult.description);
    }
  } catch (e) {
    console.error('❌ Ошибка настройки:', e.message);
  }
}

setupWebhook();
