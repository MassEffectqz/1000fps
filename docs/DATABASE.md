# 🗄️ Database Schema (ERD)

Entity-Relationship Diagram для базы данных 1000FPS

---

## 📊 Диаграмма связей

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           1000FPS DATABASE SCHEMA                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Category   │───────│   Product    │───────│    Brand     │
└──────────────┘  1:N  └──────────────┘  N:1  └──────────────┘
       │                    │  │  │                    │
       │                    │  │  └────────────────────┤
       │                    │  │                       │
       │              ┌─────┘  └──────┐                │
       │              │               │                │
       ▼              ▼               ▼                ▼
┌──────────────┐ ┌──────────┐  ┌──────────┐  ┌──────────────┐
│ProductImage  │ │  Review  │  │  Order   │  │ Compatibility │
└──────────────┘ └──────────┘  │   Item   │  │    │Rule         │
                               └──────────┘   └──────────────────┘
                                      │
                                      │ N:1
                                      ▼
                               ┌──────────────┐
                               │    Order     │
                               └──────────────┘
                                      │
                                      │ 1:N
                                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Address   │───────│     User     │───────│    Config    │
└──────────────┘  N:1  └──────────────┘  1:N  └──────────────┘
                              │  │                    │
                              │  │                    │ N:M
                              │  │                    ▼
                              │  │             ┌──────────────┐
                              │  │             │  ConfigItem  │
                              │  │             └──────────────┘
                              │  │
                              │  └────────────────────────┐
                              │                           │
                              ▼                           ▼
                       ┌──────────────┐           ┌──────────────┐
                       │    Cart      │           │   Wishlist   │
                       └──────────────┘           └──────────────┘
                              │                           │
                              │ 1:N                       │ 1:N
                              ▼                           ▼
                       ┌──────────────┐           ┌──────────────┐
                       │   CartItem   │           │ WishlistItem │
                       └──────────────┘           └──────────────┘
                              │                           │
                              └──────────┬────────────────┘
                                         │
                                         │ N:1
                                         ▼
                                   ┌──────────────┐
                                   │   Product    │
                                   └──────────────┘

┌──────────────┐       ┌──────────────┐
│  Warehouse   │───────│WarehouseStock│
└──────────────┘  1:N  └──────────────┘
                              │
                              │ N:1
                              ▼
                       ┌──────────────┐
                       │   Product    │
                       └──────────────┘

┌──────────────┐       ┌──────────────┐
│  PartType    │───────│Compatibility │
└──────────────┘  1:N  │    Rule      │
                       └──────────────┘

┌──────────────┐       ┌──────────────┐
│  ViewEvent   │       │ SearchQuery  │
└──────────────┘       └──────────────┘
```

---

## 📋 Таблицы

### **users**

| Column        | Type         | Constraints        | Description        |
| ------------- | ------------ | ------------------ | ------------------ |
| id            | INTEGER      | PK, AUTOINC        | ID пользователя    |
| email         | VARCHAR(255) | UNIQUE, NOT NULL   | Email              |
| password      | VARCHAR(255) | NOT NULL           | Hash пароля        |
| first_name    | VARCHAR(100) |                    | Имя                |
| last_name     | VARCHAR(100) |                    | Фамилия            |
| phone         | VARCHAR(20)  |                    | Телефон            |
| avatar_url    | VARCHAR(500) |                    | URL аватара        |
| role          | ENUM         | DEFAULT 'CUSTOMER' | Роль               |
| bonus_points  | INTEGER      | DEFAULT 0          | Бонусные баллы     |
| loyalty_level | ENUM         | DEFAULT 'BRONZE'   | Уровень лояльности |
| created_at    | TIMESTAMP    | DEFAULT NOW()      | Дата создания      |
| updated_at    | TIMESTAMP    | DEFAULT NOW()      | Дата обновления    |

**Indexes:** `email`

---

### **addresses**

| Column     | Type          | Constraints   | Description           |
| ---------- | ------------- | ------------- | --------------------- |
| id         | INTEGER       | PK, AUTOINC   | ID адреса             |
| user_id    | INTEGER       | FK → users.id | Пользователь          |
| is_default | BOOLEAN       | DEFAULT FALSE | Адрес по умолчанию    |
| name       | VARCHAR(100)  |               | Название (Дом/Работа) |
| city       | VARCHAR(100)  | NOT NULL      | Город                 |
| street     | VARCHAR(200)  | NOT NULL      | Улица                 |
| building   | VARCHAR(20)   | NOT NULL      | Дом                   |
| apartment  | VARCHAR(20)   |               | Квартира/офис         |
| zip_code   | VARCHAR(20)   |               | Почтовый индекс       |
| phone      | VARCHAR(20)   |               | Телефон для доставки  |
| comment    | TEXT          |               | Комментарий           |
| latitude   | DECIMAL(10,8) |               | Широта                |
| longitude  | DECIMAL(11,8) |               | Долгота               |
| created_at | TIMESTAMP     | DEFAULT NOW() | Дата создания         |
| updated_at | TIMESTAMP     | DEFAULT NOW() | Дата обновления       |

**Indexes:** `user_id`

---

### **categories**

| Column      | Type         | Constraints        | Description            |
| ----------- | ------------ | ------------------ | ---------------------- |
| id          | INTEGER      | PK, AUTOINC        | ID категории           |
| slug        | VARCHAR(100) | UNIQUE, NOT NULL   | URL slug               |
| name        | VARCHAR(200) | NOT NULL           | Название               |
| description | TEXT         |                    | Описание               |
| parent_id   | INTEGER      | FK → categories.id | Родительская категория |
| image_url   | VARCHAR(500) |                    | URL изображения        |
| position    | INTEGER      | DEFAULT 0          | Позиция сортировки     |
| created_at  | TIMESTAMP    | DEFAULT NOW()      | Дата создания          |
| updated_at  | TIMESTAMP    | DEFAULT NOW()      | Дата обновления        |

**Indexes:** `slug`, `parent_id`

---

### **brands**

| Column      | Type         | Constraints      | Description      |
| ----------- | ------------ | ---------------- | ---------------- |
| id          | INTEGER      | PK, AUTOINC      | ID бренда        |
| slug        | VARCHAR(100) | UNIQUE, NOT NULL | URL slug         |
| name        | VARCHAR(200) | NOT NULL         | Название         |
| description | TEXT         |                  | Описание         |
| logo_url    | VARCHAR(500) |                  | URL логотипа     |
| website     | VARCHAR(500) |                  | Официальный сайт |
| created_at  | TIMESTAMP    | DEFAULT NOW()    | Дата создания    |
| updated_at  | TIMESTAMP    | DEFAULT NOW()    | Дата обновления  |

**Indexes:** `slug`

---

### **products**

| Column           | Type          | Constraints        | Description            |
| ---------------- | ------------- | ------------------ | ---------------------- |
| id               | INTEGER       | PK, AUTOINC        | ID товара              |
| slug             | VARCHAR(200)  | UNIQUE, NOT NULL   | URL slug               |
| sku              | VARCHAR(50)   | UNIQUE, NOT NULL   | Артикул                |
| name             | VARCHAR(500)  | NOT NULL           | Название               |
| description      | TEXT          |                    | Краткое описание       |
| full_description | TEXT          |                    | Полное описание (HTML) |
| category_id      | INTEGER       | FK → categories.id | Категория              |
| brand_id         | INTEGER       | FK → brands.id     | Бренд                  |
| price            | DECIMAL(10,2) | NOT NULL           | Цена                   |
| old_price        | DECIMAL(10,2) |                    | Старая цена            |
| discount_percent | INTEGER       |                    | Процент скидки         |
| stock            | INTEGER       | DEFAULT 0          | Остаток на складе      |
| reserved         | INTEGER       | DEFAULT 0          | Зарезервировано        |
| available        | BOOLEAN       | DEFAULT TRUE       | Доступен               |
| images           | JSON          |                    | Изображения (кэш)      |
| main_image_url   | VARCHAR(500)  |                    | Главное изображение    |
| specifications   | JSON          |                    | Характеристики         |
| meta_title       | VARCHAR(200)  |                    | SEO title              |
| meta_description | TEXT          |                    | SEO description        |
| rating           | FLOAT         | DEFAULT 0          | Рейтинг                |
| reviews_count    | INTEGER       | DEFAULT 0          | Количество отзывов     |
| created_at       | TIMESTAMP     | DEFAULT NOW()      | Дата создания          |
| updated_at       | TIMESTAMP     | DEFAULT NOW()      | Дата обновления        |

**Indexes:** `slug`, `sku`, `category_id`, `brand_id`, `price`, `available`

---

### **product_images**

| Column     | Type         | Constraints      | Description     |
| ---------- | ------------ | ---------------- | --------------- |
| id         | INTEGER      | PK, AUTOINC      | ID изображения  |
| product_id | INTEGER      | FK → products.id | Товар           |
| url        | VARCHAR(500) | NOT NULL         | URL изображения |
| alt        | VARCHAR(200) |                  | ALT текст       |
| position   | INTEGER      | DEFAULT 0        | Позиция         |
| created_at | TIMESTAMP    | DEFAULT NOW()    | Дата создания   |

**Indexes:** `product_id`

---

### **reviews**

| Column      | Type         | Constraints      | Description          |
| ----------- | ------------ | ---------------- | -------------------- |
| id          | INTEGER      | PK, AUTOINC      | ID отзыва            |
| product_id  | INTEGER      | FK → products.id | Товар                |
| user_id     | INTEGER      | FK → users.id    | Пользователь         |
| rating      | INTEGER      | NOT NULL         | Рейтинг (1-5)        |
| title       | VARCHAR(200) |                  | Заголовок            |
| text        | TEXT         |                  | Текст отзыва         |
| pros        | TEXT         |                  | Достоинства          |
| cons        | TEXT         |                  | Недостатки           |
| is_verified | BOOLEAN      | DEFAULT FALSE    | Проверенная покупка  |
| is_approved | BOOLEAN      | DEFAULT FALSE    | Одобрено модератором |
| helpful     | INTEGER      | DEFAULT 0        | Полезных голосов     |
| created_at  | TIMESTAMP    | DEFAULT NOW()    | Дата создания        |
| updated_at  | TIMESTAMP    | DEFAULT NOW()    | Дата обновления      |

**Indexes:** `product_id`, `user_id`

---

### **part_types**

| Column      | Type         | Constraints   | Description                        |
| ----------- | ------------ | ------------- | ---------------------------------- |
| id          | VARCHAR(50)  | PK            | ID типа (cpu, gpu, motherboard...) |
| name        | VARCHAR(100) | NOT NULL      | Название                           |
| icon        | VARCHAR(100) |               | Иконка                             |
| is_required | BOOLEAN      | DEFAULT FALSE | Обязательный компонент             |
| position    | INTEGER      | DEFAULT 0     | Позиция                            |
| created_at  | TIMESTAMP    | DEFAULT NOW() | Дата создания                      |
| updated_at  | TIMESTAMP    | DEFAULT NOW() | Дата обновления                    |

---

### **compatibility_rules**

| Column            | Type        | Constraints        | Description    |
| ----------------- | ----------- | ------------------ | -------------- |
| id                | INTEGER     | PK, AUTOINC        | ID правила     |
| part_type_id      | VARCHAR(50) | FK → part_types.id | Тип компонента |
| product_id        | INTEGER     | FK → products.id   | Товар          |
| compatible_with   | JSON        | NOT NULL           | Совместим с    |
| incompatible_with | JSON        |                    | Не совместим с |
| created_at        | TIMESTAMP   | DEFAULT NOW()      | Дата создания  |

**Indexes:** `part_type_id`, `product_id`

---

### **configs**

| Column            | Type          | Constraints          | Description            |
| ----------------- | ------------- | -------------------- | ---------------------- |
| id                | INTEGER       | PK, AUTOINC          | ID конфигурации        |
| user_id           | INTEGER       | FK → users.id        | Пользователь           |
| name              | VARCHAR(200)  | DEFAULT 'Моя сборка' | Название               |
| is_public         | BOOLEAN       | DEFAULT FALSE        | Публичная              |
| total_price       | DECIMAL(10,2) |                      | Итоговая стоимость     |
| is_compatible     | BOOLEAN       | DEFAULT TRUE         | Совместима             |
| compat_issues     | JSON          |                      | Проблемы совместимости |
| power_consumption | INTEGER       |                      | Потребление (Вт)       |
| created_at        | TIMESTAMP     | DEFAULT NOW()        | Дата создания          |
| updated_at        | TIMESTAMP     | DEFAULT NOW()        | Дата обновления        |

**Indexes:** `user_id`

---

### **config_items**

| Column     | Type          | Constraints      | Description               |
| ---------- | ------------- | ---------------- | ------------------------- |
| id         | INTEGER       | PK, AUTOINC      | ID элемента               |
| config_id  | INTEGER       | FK → configs.id  | Конфигурация              |
| part_type  | VARCHAR(50)   | NOT NULL         | Тип компонента            |
| product_id | INTEGER       | FK → products.id | Товар                     |
| price      | DECIMAL(10,2) | NOT NULL         | Цена на момент добавления |

**Unique:** `(config_id, part_type)`  
**Indexes:** `config_id`, `product_id`

---

### **carts**

| Column      | Type          | Constraints           | Description        |
| ----------- | ------------- | --------------------- | ------------------ |
| id          | INTEGER       | PK, AUTOINC           | ID корзины         |
| user_id     | INTEGER       | FK → users.id, UNIQUE | Пользователь       |
| session_id  | VARCHAR(100)  | UNIQUE                | Session для гостей |
| promo_code  | VARCHAR(50)   |                       | Промокод           |
| discount    | DECIMAL(10,2) | DEFAULT 0             | Скидка             |
| total_price | DECIMAL(10,2) |                       | Итого              |
| created_at  | TIMESTAMP     | DEFAULT NOW()         | Дата создания      |
| updated_at  | TIMESTAMP     | DEFAULT NOW()         | Дата обновления    |

**Indexes:** `user_id`, `session_id`

---

### **cart_items**

| Column     | Type          | Constraints      | Description |
| ---------- | ------------- | ---------------- | ----------- |
| id         | INTEGER       | PK, AUTOINC      | ID элемента |
| cart_id    | INTEGER       | FK → carts.id    | Корзина     |
| product_id | INTEGER       | FK → products.id | Товар       |
| quantity   | INTEGER       | DEFAULT 1        | Количество  |
| price      | DECIMAL(10,2) | NOT NULL         | Цена        |

**Unique:** `(cart_id, product_id)`  
**Indexes:** `cart_id`

---

### **wishlists**

| Column     | Type      | Constraints           | Description     |
| ---------- | --------- | --------------------- | --------------- |
| id         | INTEGER   | PK, AUTOINC           | ID вишлиста     |
| user_id    | INTEGER   | FK → users.id, UNIQUE | Пользователь    |
| created_at | TIMESTAMP | DEFAULT NOW()         | Дата создания   |
| updated_at | TIMESTAMP | DEFAULT NOW()         | Дата обновления |

---

### **wishlist_items**

| Column      | Type      | Constraints       | Description     |
| ----------- | --------- | ----------------- | --------------- |
| id          | INTEGER   | PK, AUTOINC       | ID элемента     |
| wishlist_id | INTEGER   | FK → wishlists.id | Вишлист         |
| product_id  | INTEGER   | FK → products.id  | Товар           |
| created_at  | TIMESTAMP | DEFAULT NOW()     | Дата добавления |

**Unique:** `(wishlist_id, product_id)`  
**Indexes:** `wishlist_id`

---

### **orders**

| Column              | Type          | Constraints       | Description          |
| ------------------- | ------------- | ----------------- | -------------------- |
| id                  | INTEGER       | PK, AUTOINC       | ID заказа            |
| order_number        | VARCHAR(50)   | UNIQUE, NOT NULL  | Номер заказа         |
| user_id             | INTEGER       | FK → users.id     | Пользователь         |
| status              | ENUM          | DEFAULT 'PENDING' | Статус               |
| payment_status      | ENUM          | DEFAULT 'UNPAID'  | Статус оплаты        |
| shipping_address    | JSON          | NOT NULL          | Адрес доставки       |
| shipping_method     | VARCHAR(50)   | NOT NULL          | Способ доставки      |
| shipping_cost       | DECIMAL(10,2) | DEFAULT 0         | Стоимость доставки   |
| estimated_delivery  | TIMESTAMP     |                   | Планируемая доставка |
| tracking_number     | VARCHAR(100)  |                   | Трек-номер           |
| payment_method      | VARCHAR(50)   |                   | Способ оплаты        |
| paid_at             | TIMESTAMP     |                   | Дата оплаты          |
| subtotal            | DECIMAL(10,2) | NOT NULL          | Подытог              |
| discount            | DECIMAL(10,2) | DEFAULT 0         | Скидка               |
| total               | DECIMAL(10,2) | NOT NULL          | Итого                |
| bonus_points_earned | INTEGER       | DEFAULT 0         | Заработано баллов    |
| bonus_points_spent  | INTEGER       | DEFAULT 0         | Списано баллов       |
| comment             | TEXT          |                   | Комментарий          |
| created_at          | TIMESTAMP     | DEFAULT NOW()     | Дата создания        |
| updated_at          | TIMESTAMP     | DEFAULT NOW()     | Дата обновления      |

**Indexes:** `order_number`, `user_id`, `status`, `created_at`

---

### **order_items**

| Column     | Type          | Constraints      | Description         |
| ---------- | ------------- | ---------------- | ------------------- |
| id         | INTEGER       | PK, AUTOINC      | ID элемента         |
| order_id   | INTEGER       | FK → orders.id   | Заказ               |
| product_id | INTEGER       | FK → products.id | Товар               |
| name       | VARCHAR(500)  | NOT NULL         | Название (snapshot) |
| sku        | VARCHAR(50)   | NOT NULL         | Артикул (snapshot)  |
| price      | DECIMAL(10,2) | NOT NULL         | Цена                |
| quantity   | INTEGER       | NOT NULL         | Количество          |
| total      | DECIMAL(10,2) | NOT NULL         | Итого               |

**Indexes:** `order_id`, `product_id`

---

### **warehouses**

| Column     | Type         | Constraints      | Description     |
| ---------- | ------------ | ---------------- | --------------- |
| id         | INTEGER      | PK, AUTOINC      | ID склада       |
| name       | VARCHAR(200) | NOT NULL         | Название        |
| code       | VARCHAR(50)  | UNIQUE, NOT NULL | Код             |
| address    | VARCHAR(500) | NOT NULL         | Адрес           |
| city       | VARCHAR(100) | NOT NULL         | Город           |
| phone      | VARCHAR(20)  |                  | Телефон         |
| is_active  | BOOLEAN      | DEFAULT TRUE     | Активен         |
| created_at | TIMESTAMP    | DEFAULT NOW()    | Дата создания   |
| updated_at | TIMESTAMP    | DEFAULT NOW()    | Дата обновления |

---

### **warehouse_stocks**

| Column       | Type    | Constraints        | Description     |
| ------------ | ------- | ------------------ | --------------- |
| id           | INTEGER | PK, AUTOINC        | ID записи       |
| warehouse_id | INTEGER | FK → warehouses.id | Склад           |
| product_id   | INTEGER | FK → products.id   | Товар           |
| quantity     | INTEGER | DEFAULT 0          | Количество      |
| reserved     | INTEGER | DEFAULT 0          | Зарезервировано |

**Unique:** `(warehouse_id, product_id)`  
**Indexes:** `warehouse_id`, `product_id`

---

### **view_events**

| Column     | Type         | Constraints      | Description    |
| ---------- | ------------ | ---------------- | -------------- |
| id         | INTEGER      | PK, AUTOINC      | ID события     |
| product_id | INTEGER      | FK → products.id | Товар          |
| session_id | VARCHAR(100) | NOT NULL         | Session ID     |
| user_id    | INTEGER      | FK → users.id    | Пользователь   |
| viewed_at  | TIMESTAMP    | DEFAULT NOW()    | Дата просмотра |

**Indexes:** `product_id`, `session_id`, `viewed_at`

---

### **search_queries**

| Column        | Type         | Constraints   | Description         |
| ------------- | ------------ | ------------- | ------------------- |
| id            | INTEGER      | PK, AUTOINC   | ID запроса          |
| query         | VARCHAR(500) | NOT NULL      | Поисковый запрос    |
| results_count | INTEGER      | DEFAULT 0     | Найдено результатов |
| session_id    | VARCHAR(100) |               | Session ID          |
| user_id       | INTEGER      | FK → users.id | Пользователь        |
| searched_at   | TIMESTAMP    | DEFAULT NOW() | Дата поиска         |

**Indexes:** `query`, `searched_at`

---

## 🔗 Foreign Keys

```sql
-- Addresses
ALTER TABLE addresses ADD CONSTRAINT fk_addresses_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Categories (self-referencing)
ALTER TABLE categories ADD CONSTRAINT fk_categories_parent
  FOREIGN KEY (parent_id) REFERENCES categories(id);

-- Products
ALTER TABLE products ADD CONSTRAINT fk_products_category
  FOREIGN KEY (category_id) REFERENCES categories(id);
ALTER TABLE products ADD CONSTRAINT fk_products_brand
  FOREIGN KEY (brand_id) REFERENCES brands(id);

-- Product Images
ALTER TABLE product_images ADD CONSTRAINT fk_product_images_product
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Reviews
ALTER TABLE reviews ADD CONSTRAINT fk_reviews_product
  FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE reviews ADD CONSTRAINT fk_reviews_user
  FOREIGN KEY (user_id) REFERENCES users(id);

-- Compatibility Rules
ALTER TABLE compatibility_rules ADD CONSTRAINT fk_compat_part_type
  FOREIGN KEY (part_type_id) REFERENCES part_types(id);
ALTER TABLE compatibility_rules ADD CONSTRAINT fk_compat_product
  FOREIGN KEY (product_id) REFERENCES products(id);

-- Configs
ALTER TABLE configs ADD CONSTRAINT fk_configs_user
  FOREIGN KEY (user_id) REFERENCES users(id);

-- Config Items
ALTER TABLE config_items ADD CONSTRAINT fk_config_items_config
  FOREIGN KEY (config_id) REFERENCES configs(id) ON DELETE CASCADE;
ALTER TABLE config_items ADD CONSTRAINT fk_config_items_product
  FOREIGN KEY (product_id) REFERENCES products(id);

-- Carts
ALTER TABLE carts ADD CONSTRAINT fk_carts_user
  FOREIGN KEY (user_id) REFERENCES users(id);

-- Cart Items
ALTER TABLE cart_items ADD CONSTRAINT fk_cart_items_cart
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE;
ALTER TABLE cart_items ADD CONSTRAINT fk_cart_items_product
  FOREIGN KEY (product_id) REFERENCES products(id);

-- Wishlists
ALTER TABLE wishlists ADD CONSTRAINT fk_wishlists_user
  FOREIGN KEY (user_id) REFERENCES users(id);

-- Wishlist Items
ALTER TABLE wishlist_items ADD CONSTRAINT fk_wishlist_items_wishlist
  FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE;
ALTER TABLE wishlist_items ADD CONSTRAINT fk_wishlist_items_product
  FOREIGN KEY (product_id) REFERENCES products(id);

-- Orders
ALTER TABLE orders ADD CONSTRAINT fk_orders_user
  FOREIGN KEY (user_id) REFERENCES users(id);

-- Order Items
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product
  FOREIGN KEY (product_id) REFERENCES products(id);

-- Warehouse Stocks
ALTER TABLE warehouse_stocks ADD CONSTRAINT fk_warehouse_stocks_warehouse
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id);
ALTER TABLE warehouse_stocks ADD CONSTRAINT fk_warehouse_stocks_product
  FOREIGN KEY (product_id) REFERENCES products(id);

-- View Events
ALTER TABLE view_events ADD CONSTRAINT fk_view_events_product
  FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE view_events ADD CONSTRAINT fk_view_events_user
  FOREIGN KEY (user_id) REFERENCES users(id);

-- Search Queries
ALTER TABLE search_queries ADD CONSTRAINT fk_search_queries_user
  FOREIGN KEY (user_id) REFERENCES users(id);
```

---

## 📈 Индексы для производительности

### **Составные индексы**

```sql
-- Для фильтра товаров
CREATE INDEX idx_products_category_brand_price
  ON products(category_id, brand_id, price);

CREATE INDEX idx_products_available_price
  ON products(available, price);

CREATE INDEX idx_products_rating_reviews
  ON products(rating DESC, reviews_count DESC);

-- Для заказов
CREATE INDEX idx_orders_user_created
  ON orders(user_id, created_at DESC);

CREATE INDEX idx_orders_status_created
  ON orders(status, created_at DESC);

-- Для поиска
CREATE INDEX idx_products_name_search
  ON products USING gin(to_tsvector('russian', name));

CREATE INDEX idx_search_queries_query
  ON search_queries USING gin(to_tsvector('russian', query));
```

---

## 🔄 Триггеры

```sql
-- Обновление рейтинга товара после добавления отзыва
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET
    rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews
              WHERE product_id = NEW.product_id AND is_approved = true),
    reviews_count = (SELECT COUNT(*) FROM reviews
                     WHERE product_id = NEW.product_id AND is_approved = true)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Автоматическое создание корзины для нового пользователя
CREATE OR REPLACE FUNCTION create_user_cart()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO carts (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_user_cart
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_cart();

-- Автоматическое создание вишлиста для нового пользователя
CREATE OR REPLACE FUNCTION create_user_wishlist()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wishlists (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_user_wishlist
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_wishlist();
```

---

_Версия схемы: 1.0.0 | Последнее обновление: Март 2026_
