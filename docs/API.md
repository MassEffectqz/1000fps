# 📡 API Documentation

REST API для интернет-магазина 1000FPS

**Base URL:** `https://api.1000fps.ru/api/v1`

---

## 🔐 Аутентификация

### POST /auth/register

Регистрация нового пользователя

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Иван",
  "lastName": "Иванов",
  "phone": "+79991234567"
}
```

**Response (201):**

```json
{
  "id": 1234,
  "email": "user@example.com",
  "firstName": "Иван",
  "lastName": "Иванов",
  "role": "CUSTOMER",
  "createdAt": "2026-03-23T10:00:00Z"
}
```

**Response (400):**

```json
{
  "statusCode": 400,
  "message": [
    "Email уже зарегистрирован",
    "Пароль должен содержать минимум 8 символов"
  ],
  "error": "Bad Request"
}
```

---

### POST /auth/login

Вход в аккаунт

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": 1234,
    "email": "user@example.com",
    "firstName": "Иван",
    "lastName": "Иванов",
    "role": "CUSTOMER",
    "bonusPoints": 0,
    "loyaltyLevel": "BRONZE"
  }
}
```

---

### POST /auth/refresh

Обновление access токена

**Headers:**

```
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

---

### POST /auth/logout

Выход из аккаунта

**Response (200):**

```json
{
  "message": "Выход выполнен успешно"
}
```

---

### GET /auth/me

Получение текущего пользователя

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**

```json
{
  "id": 1234,
  "email": "user@example.com",
  "firstName": "Иван",
  "lastName": "Иванов",
  "phone": "+79991234567",
  "avatarUrl": "https://storage.1000fps.ru/avatars/1234.jpg",
  "role": "CUSTOMER",
  "bonusPoints": 1500,
  "loyaltyLevel": "SILVER",
  "createdAt": "2026-01-15T08:30:00Z"
}
```

---

## 📦 Товары

### GET /products

Получение списка товаров с фильтрами

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| category | string | Slug категории |
| brand | string | Slug бренда |
| minPrice | number | Минимальная цена |
| maxPrice | number | Максимальная цена |
| sort | string | Сортировка: `popular`, `price_asc`, `price_desc`, `newest`, `rating` |
| page | number | Номер страницы (default: 1) |
| limit | number | Товаров на странице (default: 24, max: 100) |
| specs | object | Фильтр по характеристикам (JSON) |

**Example:**

```
GET /products?category=gpu&brand=nvidia&minPrice=40000&maxPrice=80000&sort=price_asc&page=1&limit=24
```

**Response (200):**

```json
{
  "data": [
    {
      "id": 5678,
      "slug": "asus-tuf-rtx-4070-ti-super-oc-16gb",
      "sku": "TUF-RTX4070TIS-O16G",
      "name": "ASUS TUF Gaming GeForce RTX 4070 Ti Super OC 16 ГБ",
      "brand": {
        "id": 12,
        "slug": "asus",
        "name": "ASUS"
      },
      "category": {
        "id": 3,
        "slug": "gpu",
        "name": "Видеокарты"
      },
      "price": 79990,
      "oldPrice": 97500,
      "discountPercent": 18,
      "stock": 47,
      "available": true,
      "mainImageUrl": "https://storage.1000fps.ru/products/rtx-4070-ti-super.jpg",
      "rating": 4.8,
      "reviewsCount": 284,
      "specifications": {
        "gpu": "NVIDIA GeForce RTX 4070 Ti Super",
        "memory": "16 ГБ GDDR6X",
        "busWidth": "256 бит",
        "boostClock": "2640 МГц"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 11,
    "totalItems": 247,
    "itemsPerPage": 24,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "availableBrands": [
      { "slug": "asus", "name": "ASUS", "count": 48 },
      { "slug": "msi", "name": "MSI", "count": 41 }
    ],
    "priceRange": {
      "min": 15990,
      "max": 299990
    }
  }
}
```

---

### GET /products/:slug

Получение детальной информации о товаре

**Response (200):**

```json
{
  "id": 5678,
  "slug": "asus-tuf-rtx-4070-ti-super-oc-16gb",
  "sku": "TUF-RTX4070TIS-O16G",
  "name": "ASUS TUF Gaming GeForce RTX 4070 Ti Super OC 16 ГБ",
  "description": "Мощная видеокарта для игр в 4K...",
  "fullDescription": "<h2>Описание</h2><p>Полное описание...</p>",
  "brand": {
    "id": 12,
    "slug": "asus",
    "name": "ASUS",
    "logoUrl": "https://storage.1000fps.ru/brands/asus.png",
    "website": "https://www.asus.com"
  },
  "category": {
    "id": 3,
    "slug": "gpu",
    "name": "Видеокарты",
    "parentId": 1,
    "fullPath": "Комплектующие/Видеокарты"
  },
  "price": 79990,
  "oldPrice": 97500,
  "discountPercent": 18,
  "stock": 47,
  "reserved": 5,
  "available": true,
  "images": [
    {
      "id": 1,
      "url": "https://storage.1000fps.ru/products/rtx-4070-1.jpg",
      "alt": "ASUS RTX 4070 Ti Super вид спереди",
      "position": 0
    },
    {
      "id": 2,
      "url": "https://storage.1000fps.ru/products/rtx-4070-2.jpg",
      "alt": "ASUS RTX 4070 Ti Super вид сзади",
      "position": 1
    }
  ],
  "specifications": {
    "Графический процессор": "NVIDIA GeForce RTX 4070 Ti Super",
    "Объём памяти": "16 ГБ",
    "Тип памяти": "GDDR6X",
    "Разрядность шины": "256 бит",
    "Базовая частота": "2310 МГц",
    "Частота разгона": "2640 МГц",
    "CUDA ядра": "8448",
    "Интерфейс": "PCI Express 4.0 x16",
    "Разъемы": "DisplayPort 1.4a x2, HDMI 2.1 x2",
    "Питание": "16-pin (12VHPWR)",
    "Рекомендуемый БП": "750 Вт",
    "Габариты": "326 x 142 x 59 мм",
    "Вес": "1.5 кг"
  },
  "rating": 4.8,
  "reviewsCount": 284,
  "relatedProducts": [
    {
      "id": 5679,
      "slug": "msi-rtx-4070-ti-super-gaming-x",
      "name": "MSI GeForce RTX 4070 Ti Super GAMING X 16G",
      "price": 82990,
      "mainImageUrl": "..."
    }
  ],
  "compatibleProducts": [
    {
      "id": 7890,
      "slug": "intel-core-i7-14700k",
      "name": "Intel Core i7-14700K",
      "category": "Процессоры",
      "price": 44990
    }
  ],
  "warehouses": [
    {
      "warehouseId": 1,
      "name": "Москва (основной)",
      "quantity": 35,
      "available": true
    },
    {
      "warehouseId": 2,
      "name": "Санкт-Петербург",
      "quantity": 12,
      "available": true
    }
  ],
  "createdAt": "2024-11-15T10:00:00Z",
  "updatedAt": "2026-03-23T08:15:00Z"
}
```

---

### GET /products/:slug/reviews

Получение отзывов о товаре

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| page | number | Номер страницы |
| limit | number | Отзывов на странице |
| sort | string | Сортировка: `newest`, `oldest`, `rating_high`, `rating_low`, `helpful` |
| rating | number | Фильтр по рейтингу (1-5) |

**Response (200):**

```json
{
  "data": [
    {
      "id": 1001,
      "user": {
        "id": 234,
        "firstName": "Алексей",
        "lastName": "К.",
        "avatarUrl": null
      },
      "rating": 5,
      "title": "Отличная видеокарта!",
      "text": "Тянет все игры в 4K на ультрах. Температуры в норме.",
      "pros": "Производительность, тихая работа, качество сборки",
      "cons": "Цена, большие габариты",
      "isVerified": true,
      "isApproved": true,
      "helpful": 42,
      "images": ["https://storage.1000fps.ru/reviews/1001-1.jpg"],
      "createdAt": "2026-03-15T14:30:00Z"
    }
  ],
  "summary": {
    "averageRating": 4.8,
    "totalReviews": 284,
    "ratingDistribution": {
      "5": 210,
      "4": 52,
      "3": 15,
      "2": 5,
      "1": 2
    }
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 29,
    "totalItems": 284
  }
}
```

---

### POST /products/:slug/reviews

Добавление отзыва

**Headers:**

```
Authorization: Bearer <token>
```

**Request:**

```json
{
  "rating": 5,
  "title": "Отличная видеокарта!",
  "text": "Тянет все игры в 4K на ультрах. Температуры в норме.",
  "pros": "Производительность, тихая работа",
  "cons": "Цена, большие габариты"
}
```

**Response (201):**

```json
{
  "id": 1002,
  "message": "Отзыв добавлен и ожидает модерации"
}
```

---

## 📂 Категории

### GET /categories

Получение дерева категорий

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "slug": "components",
      "name": "Комплектующие",
      "description": "Комплектующие для ПК",
      "imageUrl": "https://storage.1000fps.ru/categories/components.jpg",
      "position": 0,
      "children": [
        {
          "id": 3,
          "slug": "gpu",
          "name": "Видеокарты",
          "productsCount": 247,
          "children": []
        },
        {
          "id": 4,
          "slug": "cpu",
          "name": "Процессоры",
          "productsCount": 183,
          "children": []
        }
      ]
    },
    {
      "id": 2,
      "slug": "laptops",
      "name": "Ноутбуки",
      "productsCount": 334,
      "children": []
    }
  ]
}
```

---

## 🏷️ Бренды

### GET /brands

Получение списка брендов

**Response (200):**

```json
{
  "data": [
    {
      "id": 12,
      "slug": "asus",
      "name": "ASUS",
      "logoUrl": "https://storage.1000fps.ru/brands/asus.png",
      "productsCount": 156
    },
    {
      "id": 13,
      "slug": "msi",
      "name": "MSI",
      "logoUrl": "https://storage.1000fps.ru/brands/msi.png",
      "productsCount": 142
    }
  ]
}
```

---

## 🛒 Корзина

### GET /cart

Получение корзины

**Headers:**

```
Authorization: Bearer <token>
# или для гостей
Cookie: sessionId=abc123
```

**Response (200):**

```json
{
  "id": 789,
  "userId": 1234,
  "items": [
    {
      "id": 1,
      "product": {
        "id": 5678,
        "slug": "asus-tuf-rtx-4070-ti-super-oc-16gb",
        "name": "ASUS TUF Gaming GeForce RTX 4070 Ti Super OC 16 ГБ",
        "mainImageUrl": "..."
      },
      "quantity": 1,
      "price": 79990,
      "total": 79990,
      "available": true,
      "stock": 47
    },
    {
      "id": 2,
      "product": {
        "id": 6789,
        "slug": "amd-ryzen-7-7800x3d",
        "name": "AMD Ryzen 7 7800X3D AM5, OEM",
        "mainImageUrl": "..."
      },
      "quantity": 1,
      "price": 34990,
      "total": 34990,
      "available": true,
      "stock": 89
    }
  ],
  "subtotal": 114980,
  "promoCode": null,
  "discount": 0,
  "total": 114980,
  "itemsCount": 2
}
```

---

### POST /cart/items

Добавить товар в корзину

**Request:**

```json
{
  "productId": 5678,
  "quantity": 1
}
```

**Response (201):**

```json
{
  "id": 1,
  "productId": 5678,
  "quantity": 1,
  "price": 79990,
  "total": 79990,
  "cartTotal": 114980,
  "itemsCount": 2
}
```

---

### PATCH /cart/items/:id

Обновить количество товара

**Request:**

```json
{
  "quantity": 2
}
```

**Response (200):**

```json
{
  "id": 1,
  "productId": 5678,
  "quantity": 2,
  "price": 79990,
  "total": 159980,
  "cartTotal": 194970,
  "itemsCount": 3
}
```

---

### DELETE /cart/items/:id

Удалить товар из корзины

**Response (200):**

```json
{
  "message": "Товар удалён из корзины",
  "cartTotal": 34990,
  "itemsCount": 1
}
```

---

### POST /cart/promo

Применить промокод

**Request:**

```json
{
  "code": "SALE500"
}
```

**Response (200):**

```json
{
  "promoCode": "SALE500",
  "discount": 500,
  "discountType": "fixed",
  "subtotal": 114980,
  "total": 114480,
  "message": "Промокод успешно применён"
}
```

---

### DELETE /cart

Очистить корзину

**Response (200):**

```json
{
  "message": "Корзина очищена"
}
```

---

## ❤️ Вишлист

### GET /wishlist

Получение списка желаемого

**Response (200):**

```json
{
  "id": 456,
  "userId": 1234,
  "items": [
    {
      "id": 1,
      "product": {
        "id": 5678,
        "slug": "asus-tuf-rtx-4070-ti-super-oc-16gb",
        "name": "ASUS TUF Gaming GeForce RTX 4070 Ti Super OC 16 ГБ",
        "price": 79990,
        "oldPrice": 97500,
        "available": true,
        "stock": 47,
        "mainImageUrl": "..."
      },
      "addedAt": "2026-03-20T10:00:00Z"
    }
  ],
  "itemsCount": 7
}
```

---

### POST /wishlist/items

Добавить товар в вишлист

**Request:**

```json
{
  "productId": 5678
}
```

**Response (201):**

```json
{
  "id": 1,
  "productId": 5678,
  "message": "Товар добавлен в вишлист"
}
```

---

### DELETE /wishlist/items/:id

Удалить товар из вишлиста

**Response (200):**

```json
{
  "message": "Товар удалён из вишлиста"
}
```

---

## 🔧 Конфигуратор

### GET /configurator/parts/:type

Получение списка компонентов типа

**Path Parameters:**

- `type`: `cpu` | `gpu` | `motherboard` | `ram` | `storage` | `psu` | `case` | `cooling`

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| page | number | Номер страницы |
| limit | number | Компонентов на странице |
| sort | string | Сортировка |
| filters | object | Фильтры (JSON) |

**Example:**

```
GET /configurator/parts/cpu?sort=popular&limit=20
```

**Response (200):**

```json
{
  "data": [
    {
      "id": 6789,
      "slug": "amd-ryzen-7-7800x3d",
      "name": "AMD Ryzen 7 7800X3D AM5, OEM",
      "price": 34990,
      "mainImageUrl": "...",
      "specifications": {
        "socket": "AM5",
        "cores": 8,
        "threads": 16,
        "baseClock": "4.2 ГГц",
        "boostClock": "5.0 ГГц",
        "tdp": "120W"
      },
      "compatibility": {
        "isCompatible": true,
        "warnings": [],
        "errors": []
      },
      "stock": 89,
      "available": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 183
  }
}
```

---

### POST /configurator/compatibility

Проверка совместимости конфигурации

**Request:**

```json
{
  "parts": {
    "cpu": 6789,
    "gpu": 5678,
    "motherboard": 3456,
    "ram": 2345,
    "storage": 1234,
    "psu": 8901,
    "case": 7890,
    "cooling": 6543
  }
}
```

**Response (200):**

```json
{
  "isCompatible": true,
  "issues": [],
  "warnings": [
    {
      "partType": "psu",
      "message": "Рекомендуется БП мощностью от 850W для данной конфигурации",
      "severity": "warning"
    }
  ],
  "summary": {
    "totalPrice": 285970,
    "powerConsumption": 650,
    "recommendedPSU": 750
  }
}
```

**Response с ошибками (200):**

```json
{
  "isCompatible": false,
  "issues": [
    {
      "partType": "cpu",
      "partTypeId": 6789,
      "message": "Процессор использует сокет AM5, а материнская плата LGA1700",
      "severity": "error",
      "conflictingPart": {
        "partType": "motherboard",
        "partTypeId": 3456,
        "name": "Intel Z790 Motherboard"
      }
    }
  ],
  "warnings": [],
  "summary": null
}
```

---

### GET /configs

Получение моих сборок

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "data": [
    {
      "id": 101,
      "name": "Игровой ПК 2026",
      "isPublic": false,
      "isCompatible": true,
      "totalPrice": 285970,
      "powerConsumption": 650,
      "itemsCount": 8,
      "createdAt": "2026-03-20T10:00:00Z",
      "updatedAt": "2026-03-23T08:00:00Z"
    }
  ]
}
```

---

### POST /configs

Создать новую сборку

**Request:**

```json
{
  "name": "Игровой ПК 2026",
  "isPublic": false,
  "parts": {
    "cpu": 6789,
    "gpu": 5678,
    "motherboard": 3456,
    "ram": 2345,
    "storage": 1234,
    "psu": 8901,
    "case": 7890,
    "cooling": 6543
  }
}
```

**Response (201):**

```json
{
  "id": 101,
  "name": "Игровой ПК 2026",
  "isPublic": false,
  "isCompatible": true,
  "totalPrice": 285970,
  "powerConsumption": 650,
  "items": [...],
  "createdAt": "2026-03-23T10:00:00Z"
}
```

---

### GET /configs/:id

Получить сборку по ID

**Response (200):**

```json
{
  "id": 101,
  "name": "Игровой ПК 2026",
  "isPublic": false,
  "isCompatible": true,
  "totalPrice": 285970,
  "powerConsumption": 650,
  "items": [
    {
      "partType": "cpu",
      "product": {
        "id": 6789,
        "slug": "amd-ryzen-7-7800x3d",
        "name": "AMD Ryzen 7 7800X3D AM5, OEM",
        "price": 34990,
        "mainImageUrl": "..."
      }
    },
    {
      "partType": "gpu",
      "product": {
        "id": 5678,
        "slug": "asus-tuf-rtx-4070-ti-super-oc-16gb",
        "name": "ASUS TUF Gaming GeForce RTX 4070 Ti Super OC 16 ГБ",
        "price": 79990,
        "mainImageUrl": "..."
      }
    }
  ],
  "createdAt": "2026-03-20T10:00:00Z",
  "updatedAt": "2026-03-23T08:00:00Z"
}
```

---

### POST /configs/:id/add-to-cart

Добавить сборку в корзину

**Response (201):**

```json
{
  "message": "Все компоненты добавлены в корзину",
  "cartId": 789,
  "addedItems": 8,
  "totalPrice": 285970
}
```

---

## 📋 Заказы

### GET /orders

Получение моих заказов

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| status | string | Фильтр по статусу |
| page | number | Номер страницы |
| limit | number | Заказов на странице |

**Response (200):**

```json
{
  "data": [
    {
      "id": 5001,
      "orderNumber": "ORD-2026-001234",
      "status": "SHIPPED",
      "paymentStatus": "PAID",
      "total": 114980,
      "itemsCount": 2,
      "createdAt": "2026-03-15T10:00:00Z",
      "estimatedDelivery": "2026-03-25T18:00:00Z",
      "trackingNumber": "CDEK123456789RU"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 12
  }
}
```

---

### POST /orders

Создать заказ

**Headers:**

```
Authorization: Bearer <token>
```

**Request:**

```json
{
  "shippingAddress": {
    "name": "Дом",
    "city": "Москва",
    "street": "ул. Пушкина",
    "building": "10",
    "apartment": "25",
    "zipCode": "101000",
    "phone": "+79991234567",
    "comment": "Домофон не работает"
  },
  "shippingMethod": "CDEK",
  "paymentMethod": "CARD",
  "comment": "Позвонить за 30 минут до доставки",
  "useBonusPoints": false,
  "promoCode": "SALE500"
}
```

**Response (201):**

```json
{
  "id": 5002,
  "orderNumber": "ORD-2026-001235",
  "status": "PENDING",
  "paymentStatus": "UNPAID",
  "subtotal": 114980,
  "shippingCost": 500,
  "discount": 500,
  "total": 114980,
  "bonusPointsEarned": 1149,
  "paymentUrl": "https://pay.1000fps.ru/checkout/abc123",
  "createdAt": "2026-03-23T10:30:00Z"
}
```

---

### GET /orders/:id

Детали заказа

**Response (200):**

```json
{
  "id": 5001,
  "orderNumber": "ORD-2026-001234",
  "status": "SHIPPED",
  "paymentStatus": "PAID",
  "user": {
    "id": 1234,
    "email": "user@example.com",
    "phone": "+79991234567"
  },
  "items": [
    {
      "id": 1,
      "productId": 5678,
      "name": "ASUS TUF Gaming GeForce RTX 4070 Ti Super OC 16 ГБ",
      "sku": "TUF-RTX4070TIS-O16G",
      "price": 79990,
      "quantity": 1,
      "total": 79990
    },
    {
      "id": 2,
      "productId": 6789,
      "name": "AMD Ryzen 7 7800X3D AM5, OEM",
      "sku": "7800X3D-OEM",
      "price": 34990,
      "quantity": 1,
      "total": 34990
    }
  ],
  "shippingAddress": {
    "name": "Дом",
    "city": "Москва",
    "street": "ул. Пушкина",
    "building": "10",
    "apartment": "25",
    "zipCode": "101000",
    "phone": "+79991234567"
  },
  "shippingMethod": "CDEK",
  "shippingCost": 500,
  "estimatedDelivery": "2026-03-25T18:00:00Z",
  "trackingNumber": "CDEK123456789RU",
  "paymentMethod": "CARD",
  "paidAt": "2026-03-15T10:05:00Z",
  "subtotal": 114980,
  "discount": 500,
  "total": 114980,
  "bonusPointsEarned": 1149,
  "comment": "Позвонить за 30 минут до доставки",
  "statusHistory": [
    {
      "status": "PENDING",
      "timestamp": "2026-03-15T10:00:00Z",
      "comment": "Заказ создан"
    },
    {
      "status": "CONFIRMED",
      "timestamp": "2026-03-15T11:00:00Z",
      "comment": "Заказ подтверждён менеджером"
    },
    {
      "status": "PAID",
      "timestamp": "2026-03-15T10:05:00Z",
      "comment": "Оплата получена"
    },
    {
      "status": "SHIPPED",
      "timestamp": "2026-03-16T14:00:00Z",
      "comment": "Заказ передан в службу доставки"
    }
  ],
  "createdAt": "2026-03-15T10:00:00Z",
  "updatedAt": "2026-03-16T14:00:00Z"
}
```

---

### POST /orders/:id/cancel

Отменить заказ

**Request:**

```json
{
  "reason": "Передумал покупать"
}
```

**Response (200):**

```json
{
  "message": "Заказ отменён",
  "refundAmount": 114980,
  "refundStatus": "PROCESSING",
  "estimatedRefundTime": "3-5 рабочих дней"
}
```

---

## 👤 Профиль

### GET /user/profile

Получение профиля

**Response (200):**

```json
{
  "id": 1234,
  "email": "user@example.com",
  "firstName": "Иван",
  "lastName": "Иванов",
  "phone": "+79991234567",
  "avatarUrl": "https://storage.1000fps.ru/avatars/1234.jpg",
  "role": "CUSTOMER",
  "bonusPoints": 1500,
  "loyaltyLevel": "SILVER",
  "nextLevelPoints": 3500,
  "createdAt": "2026-01-15T08:30:00Z"
}
```

---

### PUT /user/profile

Обновление профиля

**Request:**

```json
{
  "firstName": "Иван",
  "lastName": "Иванов",
  "phone": "+79991234567"
}
```

**Response (200):**

```json
{
  "id": 1234,
  "email": "user@example.com",
  "firstName": "Иван",
  "lastName": "Иванов",
  "phone": "+79991234567",
  "message": "Профиль обновлён"
}
```

---

### GET /user/addresses

Получение адресов

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "isDefault": true,
      "name": "Дом",
      "city": "Москва",
      "street": "ул. Пушкина",
      "building": "10",
      "apartment": "25",
      "zipCode": "101000",
      "phone": "+79991234567",
      "latitude": 55.7558,
      "longitude": 37.6173,
      "createdAt": "2026-01-15T08:30:00Z"
    }
  ]
}
```

---

### POST /user/addresses

Добавить адрес

**Request:**

```json
{
  "name": "Работа",
  "city": "Москва",
  "street": "ул. Ленина",
  "building": "5",
  "apartment": "100",
  "zipCode": "101000",
  "phone": "+79991234567",
  "isDefault": false
}
```

**Response (201):**

```json
{
  "id": 2,
  "message": "Адрес добавлен"
}
```

---

### GET /user/bonuses

Получение бонусной информации

**Response (200):**

```json
{
  "currentPoints": 1500,
  "level": "SILVER",
  "nextLevel": "GOLD",
  "pointsToNextLevel": 3500,
  "levelBenefits": [
    "Повышенный кэшбэк 3%",
    "Приоритетная поддержка",
    "Бесплатная доставка от 3000 руб."
  ],
  "history": [
    {
      "id": 1,
      "type": "EARN",
      "points": 500,
      "title": "Покупка заказа ORD-2026-001234",
      "date": "2026-03-15T10:05:00Z"
    },
    {
      "id": 2,
      "type": "SPEND",
      "points": -200,
      "title": "Оплата заказа ORD-2026-001235",
      "date": "2026-03-20T14:00:00Z"
    }
  ]
}
```

---

## 🔍 Поиск

### GET /search

Поиск товаров

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| q | string | Поисковый запрос |
| category | string | Фильтр по категории |
| page | number | Номер страницы |
| limit | number | Результатов на странице |

**Example:**

```
GET /search?q=RTX%204070&category=gpu
```

**Response (200):**

```json
{
  "query": "RTX 4070",
  "data": [
    {
      "id": 5678,
      "slug": "asus-tuf-rtx-4070-ti-super-oc-16gb",
      "name": "ASUS TUF Gaming GeForce RTX 4070 Ti Super OC 16 ГБ",
      "price": 79990,
      "mainImageUrl": "...",
      "rating": 4.8,
      "available": true,
      "highlight": "ASUS TUF Gaming GeForce <mark>RTX 4070</mark> Ti Super OC 16 ГБ"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 48
  },
  "suggestions": ["RTX 4070 Ti", "RTX 4070 Super", "RTX 4080"],
  "categories": [{ "slug": "gpu", "name": "Видеокарты", "count": 48 }]
}
```

---

### GET /search/suggestions

Подсказки для поиска

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| q | string | Часть запроса |

**Example:**

```
GET /search/suggestions?q=RTX
```

**Response (200):**

```json
{
  "suggestions": [
    "RTX 4090",
    "RTX 4080",
    "RTX 4070 Ti",
    "RTX 4070",
    "RTX 4060 Ti"
  ]
}
```

---

## 📊 Статусы и коды ошибок

### Статусы заказа

| Статус     | Описание              |
| ---------- | --------------------- |
| PENDING    | Ожидает подтверждения |
| CONFIRMED  | Подтверждён           |
| PAYING     | Оплачивается          |
| PAID       | Оплачен               |
| ASSEMBLING | Комплектуется         |
| SHIPPED    | Отправлен             |
| DELIVERING | В доставке            |
| DELIVERED  | Доставлен             |
| CANCELLED  | Отменён               |
| REFUNDED   | Возврат               |

### Коды ошибок

| Код | Описание                         |
| --- | -------------------------------- |
| 400 | Bad Request - неверные данные    |
| 401 | Unauthorized - нет токена        |
| 403 | Forbidden - нет прав             |
| 404 | Not Found - не найдено           |
| 409 | Conflict - конфликт данных       |
| 422 | Unprocessable Entity - валидация |
| 429 | Too Many Requests - rate limit   |
| 500 | Internal Server Error            |

### Формат ошибок

```json
{
  "statusCode": 400,
  "message": ["Неверный формат email", "Пароль слишком короткий"],
  "error": "Bad Request",
  "timestamp": "2026-03-23T10:00:00Z",
  "path": "/api/v1/auth/register"
}
```

---

## 📞 Контакты

**Техническая поддержка API:** api-support@1000fps.ru

**Документация:** https://api.1000fps.ru/docs

**Swagger UI:** https://api.1000fps.ru/swagger

---

_Версия API: v1.0.0 | Последнее обновление: Март 2026_
