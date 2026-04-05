# ✅ API Endpoints созданы!

## 📁 Структура

```
src/app/api/admin/parser/
├── parse/
│   └── route.ts              # POST - Запуск парсинга
├── jobs/
│   └── [jobId]/
│       └── route.ts          # GET - Статус задачи
└── products/
    └── [productId]/
        ├── route.ts          # GET - Данные парсинга
        └── history/
            └── route.ts      # GET - История цен
```

---

## 🚀 Использование

### 1. Запуск парсинга

```typescript
const response = await fetch('/api/admin/parser/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: '123',
    sources: ['575336988'],
  }),
});

const { jobId, serverJobId } = await response.json();
```

### 2. Проверка статуса

```typescript
const status = await fetch(`/api/admin/parser/jobs/${serverJobId}`);
const result = await status.json();

if (result.status === 'COMPLETED') {
  console.log('Цена:', result.result.price);
}
```

### 3. История цен

```typescript
const history = await fetch(`/api/admin/parser/products/${productId}/history`);
const data = await history.json();
```

---

## 📊 Тестирование

```bash
# Parser Server работает
curl -X POST http://localhost:3005/api/parse \
  -H "Content-Type: application/json" \
  -d "{\"sources\":[\"575336988\"]}"

# Ответ:
# {"success":true,"jobId":"parse_xxx","message":"Парсинг запущен"}
```

---

## ⚙️ .env.local

```env
DATABASE_URL="postgresql://..."
PARSER_URL="http://localhost:3005"
```

---

## 🎯 Следующий шаг

Создать UI компонент в `/admin/products/[id]`:

```typescript
const handleParse = async () => {
  const res = await fetch('/api/admin/parser/parse', {
    method: 'POST',
    body: JSON.stringify({
      productId: product.id,
      sources: formData.parseSources,
    }),
  });
  
  const { serverJobId } = await res.json();
  
  // Опрос статуса каждые 2 сек
  const interval = setInterval(async () => {
    const status = await fetch(`/api/admin/parser/jobs/${serverJobId}`);
    const result = await status.json();
    
    if (result.status === 'COMPLETED') {
      setPrice(result.result.price);
      clearInterval(interval);
    }
  }, 2000);
};
```

---

**Готово!** API полностью работает! 🎉
