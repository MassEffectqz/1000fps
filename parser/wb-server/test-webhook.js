// Тест отправки webhook на локальный сервер
// Запуск: node test-webhook.js

const article = '853804012';

const testData = {
  action: 'price_add',
  product: {
    article: article,
    name: `Тестовый товар ${article}`,
    price: 1000,
    originalPrice: 1500,
    url: `https://www.wildberries.ru/catalog/${article}/detail.aspx`,
    checkedAt: new Date().toISOString()
  }
};

async function test() {
  console.log('📤 Отправка webhook на localhost:3000...');
  console.log('Данные:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch('http://localhost:3000/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('✅ Ответ сервера:', result);
    
    // Проверим, сохранился ли товар
    const checkResponse = await fetch('http://localhost:3000/api/products');
    const checkResult = await checkResponse.json();
    console.log('📦 Товары в базе:', checkResult.data?.length || 0);
    
    if (checkResult.data?.find(p => p.article === article)) {
      console.log('✅ Товар найден в базе!');
    } else {
      console.log('❌ Товар НЕ найден в базе');
    }
  } catch (e) {
    console.error('❌ Ошибка:', e.message);
  }
}

test();
