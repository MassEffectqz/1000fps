# 🧪 Testing Guide

Руководство по тестированию в проекте 1000FPS

---

## 📋 Оглавление

1. [Стратегия тестирования](#стратегия-тестирования)
2. [Unit тесты](#unit-тесты)
3. [Integration тесты](#integration-тесты)
4. [E2E тесты](#e2e-тесты)
5. [Mocking](#mocking)
6. [Запуск тестов](#запуск-тестов)
7. [Best Practices](#best-practices)

---

## 📊 Стратегия тестирования

### Пирамида тестирования

```
                    ┌─────────────┐
                   ╱│   E2E 10%   │╲
                  ╱ │  (Playwright) │╲
                 ╱───────────────────╲
                ╱│ Integration 20%    │╲
               ╱ │   (Supertest)      │╲
              ╱─────────────────────────╲
             ╱│      Unit 70%           │╲
            ╱ │      (Jest)             │╲
           ╱─────────────────────────────╲
```

### Покрытие кода (цели)

| Модуль             | Мин. покрытие | Приоритет |
| ------------------ | ------------- | --------- |
| Бизнес-логика      | 90%           | Высокий   |
| Сервисы            | 80%           | Высокий   |
| Контроллеры        | 70%           | Средний   |
| UI компоненты      | 60%           | Средний   |
| Утилиты            | 95%           | Высокий   |
| E2E критичные flow | 100%          | Критичный |

---

## 🧪 Unit тесты

### Настройка Jest

```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/**/*.enum.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
};
```

### Структура теста

```typescript
// ✅ Используйте describe для группировки
describe("ProductsService", () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    // Моки и настройка
    prisma = new MockPrismaService();
    service = new ProductsService(prisma);
  });

  afterEach(() => {
    // Очистка
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a product successfully", async () => {
      // Arrange
      const createDto: CreateProductDto = {
        name: "Test Product",
        price: 1000,
        sku: "TEST-001",
      };

      // Act
      const product = await service.create(createDto);

      // Assert
      expect(product).toMatchObject({
        ...createDto,
        id: expect.any(Number),
        createdAt: expect.any(Date),
      });
    });

    it("should throw exception for duplicate SKU", async () => {
      // Arrange
      const createDto: CreateProductDto = {
        name: "Test Product",
        price: 1000,
        sku: "DUPLICATE-SKU",
      };

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        DuplicateSkuException,
      );
    });
  });
});
```

### Тестирование сервисов

```typescript
// packages/api/src/modules/products/products.service.test.ts
import { Test, TestingModule } from "@nestjs/testing";
import { ProductsService } from "./products.service";
import { PrismaService } from "@/database/prisma.service";
import { ProductNotFoundException } from "./exceptions";

describe("ProductsService", () => {
  let service: ProductsService;
  let prisma: PrismaService;

  const mockPrisma = {
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("should return a product by id", async () => {
      // Arrange
      const mockProduct = {
        id: 1,
        name: "Test Product",
        price: 1000,
        sku: "TEST-001",
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      // Act
      const result = await service.findById(1);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw ProductNotFoundException when product not found", async () => {
      // Arrange
      mockPrisma.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(999)).rejects.toThrow(
        ProductNotFoundException,
      );
    });
  });

  describe("calculateDiscount", () => {
    it("should calculate discount correctly", () => {
      // Act
      const result = service.calculateDiscount(10000, 20);

      // Assert
      expect(result).toBe(8000);
    });

    it("should handle zero discount", () => {
      // Act
      const result = service.calculateDiscount(10000, 0);

      // Assert
      expect(result).toBe(10000);
    });

    it("should handle 100% discount", () => {
      // Act
      const result = service.calculateDiscount(10000, 100);

      // Assert
      expect(result).toBe(0);
    });
  });
});
```

### Тестирование утилит

```typescript
// packages/shared/utils/format.test.ts
import { formatPrice, formatPhone, validateEmail } from "./format";

describe("formatPrice", () => {
  it("should format price with rubles", () => {
    expect(formatPrice(1000)).toBe("1 000 ₽");
    expect(formatPrice(1000.5)).toBe("1 000,50 ₽");
    expect(formatPrice(0)).toBe("0 ₽");
  });

  it("should handle negative prices", () => {
    expect(formatPrice(-1000)).toBe("-1 000 ₽");
  });
});

describe("validateEmail", () => {
  it("should return true for valid emails", () => {
    expect(validateEmail("test@example.com")).toBe(true);
    expect(validateEmail("user.name+tag@domain.co.uk")).toBe(true);
  });

  it("should return false for invalid emails", () => {
    expect(validateEmail("invalid")).toBe(false);
    expect(validateEmail("invalid@")).toBe(false);
    expect(validateEmail("@example.com")).toBe(false);
  });
});
```

---

## 🔗 Integration тесты

### Настройка Supertest

```typescript
// packages/api/test/products.e2e.test.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "@/database/prisma.service";

describe("Products API (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // Очистка и сид данных
    await prisma.product.deleteMany();
    await prisma.product.createMany({
      data: [
        {
          id: 1,
          name: "Test Product 1",
          price: 1000,
          sku: "TEST-001",
          slug: "test-product-1",
          categoryId: 1,
        },
        {
          id: 2,
          name: "Test Product 2",
          price: 2000,
          sku: "TEST-002",
          slug: "test-product-2",
          categoryId: 1,
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /api/v1/products", () => {
    it("should return all products", () => {
      return request(app.getHttpServer())
        .get("/api/v1/products")
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.data[0].name).toBe("Test Product 1");
        });
    });

    it("should filter by category", () => {
      return request(app.getHttpServer())
        .get("/api/v1/products?category=1")
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
        });
    });

    it("should paginate results", () => {
      return request(app.getHttpServer())
        .get("/api/v1/products?limit=1&page=1")
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.pagination.totalPages).toBe(2);
        });
    });
  });

  describe("GET /api/v1/products/:slug", () => {
    it("should return a product by slug", () => {
      return request(app.getHttpServer())
        .get("/api/v1/products/test-product-1")
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe("Test Product 1");
          expect(res.body.price).toBe(1000);
        });
    });

    it("should return 404 for non-existent product", () => {
      return request(app.getHttpServer())
        .get("/api/v1/products/non-existent")
        .expect(404);
    });
  });

  describe("POST /api/v1/products", () => {
    it("should create a new product", () => {
      return request(app.getHttpServer())
        .post("/api/v1/products")
        .send({
          name: "New Product",
          price: 3000,
          sku: "TEST-003",
          slug: "new-product",
          categoryId: 1,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe("New Product");
          expect(res.body.id).toBeDefined();
        });
    });

    it("should validate required fields", () => {
      return request(app.getHttpServer())
        .post("/api/v1/products")
        .send({ name: "Incomplete Product" })
        .expect(400);
    });
  });
});
```

---

## 🌐 E2E тесты

### Настройка Playwright

```typescript
// apps/storefront/playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E тесты для checkout

```typescript
// apps/storefront/e2e/checkout.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Checkout Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Очистка localStorage перед каждым тестом
    await page.context().clearCookies();
  });

  test("complete checkout as guest", async ({ page }) => {
    // Главная страница
    await page.goto("/");

    // Поиск товара
    await page.fill('[data-testid="search-input"]', "RTX 4070");
    await page.press('[data-testid="search-input"]', "Enter");

    // Переход в карточку товара
    await page.click('[data-testid="product-card"]:first-child');
    await expect(page).toHaveURL(/\/product\/.*/);

    // Добавление в корзину
    await page.click('[data-testid="add-to-cart"]');
    await page.waitForSelector('[data-testid="cart-toast"]');

    // Проверка счетчика корзины
    const cartCount = await page
      .locator('[data-testid="cart-count"]')
      .textContent();
    expect(cartCount).toBe("1");

    // Переход в корзину
    await page.click('[data-testid="cart-button"]');
    await expect(page).toHaveURL("/cart");

    // Проверка товара в корзине
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-total"]')).toBeVisible();

    // Переход к оформлению
    await page.click('[data-testid="checkout-button"]');
    await expect(page).toHaveURL("/checkout");

    // Заполнение формы заказа
    await page.fill('[data-testid="email-input"]', "guest@example.com");
    await page.fill('[data-testid="phone-input"]', "+79991234567");
    await page.fill('[data-testid="name-input"]', "Иван Иванов");

    // Выбор адреса
    await page.click('[data-testid="address-option"]:first-child');

    // Выбор доставки
    await page.click('[data-testid="shipping-option-cdek"]');

    // Выбор оплаты
    await page.click('[data-testid="payment-method-card"]');

    // Согласие с условиями
    await page.check('[data-testid="terms-checkbox"]');

    // Оформление заказа
    await page.click('[data-testid="submit-order"]');

    // Проверка успешного оформления
    await page.waitForSelector('[data-testid="order-success"]');
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();

    // Проверка email
    const orderEmail = await page
      .locator('[data-testid="order-email"]')
      .textContent();
    expect(orderEmail).toBe("guest@example.com");
  });

  test("apply promo code", async ({ page }) => {
    await page.goto("/cart");

    // Добавление товара
    await page.goto("/product/test-product");
    await page.click('[data-testid="add-to-cart"]');
    await page.goto("/cart");

    // Применение промокода
    await page.fill('[data-testid="promo-input"]', "SALE500");
    await page.click('[data-testid="promo-apply"]');

    // Проверка скидки
    await expect(page.locator('[data-testid="discount-amount"]')).toHaveText(
      "-500 ₽",
    );

    const total = await page
      .locator('[data-testid="cart-total"]')
      .textContent();
    expect(total).toBe("9 490 ₽"); // Было 9 990 ₽
  });

  test("handle out of stock product", async ({ page }) => {
    await page.goto("/product/out-of-stock-product");

    // Кнопка должна быть неактивна
    const addToCartButton = page.locator('[data-testid="add-to-cart"]');
    await expect(addToCartButton).toBeDisabled();
    await expect(addToCartButton).toHaveText("Нет в наличии");

    // Предзаказ
    await page.click('[data-testid="preorder-button"]');
    await expect(page.locator('[data-testid="preorder-modal"]')).toBeVisible();
  });
});
```

### Тесты личного кабинета

```typescript
// apps/storefront/e2e/account.spec.ts
import { test, expect } from "@playwright/test";

test.describe("User Account", () => {
  test.use({
    storageState: "e2e/fixtures/authenticated.json",
  });

  test("view order history", async ({ page }) => {
    await page.goto("/profile/orders");

    // Проверка списка заказов
    await expect(page.locator('[data-testid="order-card"]')).toHaveCount(3);

    // Детали заказа
    await page.click('[data-testid="order-card"]:first-child');
    await expect(page.locator('[data-testid="order-details"]')).toBeVisible();

    // Трек-номер
    await expect(page.locator('[data-testid="tracking-number"]')).toBeVisible();
  });

  test("manage wishlist", async ({ page }) => {
    await page.goto("/profile/wishlist");

    const initialCount = await page
      .locator('[data-testid="wishlist-item"]')
      .count();

    // Добавление в вишлист
    await page.goto("/product/test-product");
    await page.click('[data-testid="add-to-wishlist"]');

    await page.goto("/profile/wishlist");
    await expect(page.locator('[data-testid="wishlist-item"]')).toHaveCount(
      initialCount + 1,
    );

    // Удаление из вишлиста
    await page.click('[data-testid="remove-from-wishlist"]:first-child');
    await expect(page.locator('[data-testid="wishlist-item"]')).toHaveCount(
      initialCount,
    );
  });

  test("update profile", async ({ page }) => {
    await page.goto("/profile/settings");

    // Изменение имени
    await page.fill('[data-testid="first-name"]', "НовоеИмя");
    await page.fill('[data-testid="last-name"]', "НоваяФамилия");

    await page.click('[data-testid="save-profile"]');

    // Проверка уведомления
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();

    // Проверка обновления
    await page.reload();
    await expect(page.locator('[data-testid="first-name"]')).toHaveValue(
      "НовоеИмя",
    );
  });
});
```

### Тесты конфигуратора

```typescript
// apps/storefront/e2e/configurator.spec.ts
import { test, expect } from "@playwright/test";

test.describe("PC Configurator", () => {
  test("build compatible config", async ({ page }) => {
    await page.goto("/configurator");

    // Выбор процессора
    await page.click('[data-testid="part-type-cpu"]');
    await page.click(
      '[data-testid="component-item"]:has-text("Ryzen 7 7800X3D")',
    );

    // Проверка совместимости
    await expect(page.locator('[data-testid="compat-status"]')).toHaveText(
      "Совместимо",
    );

    // Выбор материнской платы
    await page.click('[data-testid="part-type-motherboard"]');
    await page.click('[data-testid="component-item"]:has-text("AM5")');

    // Выбор видеокарты
    await page.click('[data-testid="part-type-gpu"]');
    await page.click('[data-testid="component-item"]:has-text("RTX 4070")');

    // Проверка итоговой стоимости
    const totalPrice = await page
      .locator('[data-testid="total-price"]')
      .textContent();
    expect(totalPrice).toMatch(/\d+ ₽/);

    // Проверка потребляемой мощности
    const power = await page
      .locator('[data-testid="power-consumption"]')
      .textContent();
    expect(parseInt(power)).toBeGreaterThan(0);

    // Сохранение конфигурации
    await page.click('[data-testid="save-config"]');
    await page.fill('[data-testid="config-name"]', "Моя сборка");
    await page.click('[data-testid="save-confirm"]');

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test("detect incompatible parts", async ({ page }) => {
    await page.goto("/configurator");

    // Выбор процессора Intel
    await page.click('[data-testid="part-type-cpu"]');
    await page.click(
      '[data-testid="component-item"]:has-text("Intel Core i7")',
    );

    // Выбор материнской платы AMD
    await page.click('[data-testid="part-type-motherboard"]');
    await page.click('[data-testid="component-item"]:has-text("AM5")');

    // Проверка ошибки совместимости
    await expect(page.locator('[data-testid="compat-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="compat-error"]')).toHaveText(
      /сокет|Socket/i,
    );

    // Кнопка сохранения должна быть неактивна
    await expect(page.locator('[data-testid="save-config"]')).toBeDisabled();
  });
});
```

---

## 🎭 Mocking

### Mock данных

```typescript
// test/fixtures/products.ts
export const mockProducts = [
  {
    id: 1,
    slug: "asus-tuf-rtx-4070-ti-super",
    sku: "TUF-RTX4070TIS-O16G",
    name: "ASUS TUF Gaming GeForce RTX 4070 Ti Super",
    price: 79990,
    oldPrice: 97500,
    stock: 47,
    available: true,
    rating: 4.8,
    reviewsCount: 284,
  },
  {
    id: 2,
    slug: "amd-ryzen-7-7800x3d",
    sku: "7800X3D-OEM",
    name: "AMD Ryzen 7 7800X3D AM5, OEM",
    price: 34990,
    stock: 89,
    available: true,
    rating: 4.9,
    reviewsCount: 456,
  },
];

export const mockUser = {
  id: 1,
  email: "test@example.com",
  firstName: "Иван",
  lastName: "Иванов",
  role: "CUSTOMER",
  bonusPoints: 1500,
};
```

### Mock API

```typescript
// test/mocks/api.ts
import { http, HttpResponse } from "msw";
import { mockProducts, mockUser } from "../fixtures";

export const handlers = [
  http.get("/api/v1/products", () => {
    return HttpResponse.json({
      data: mockProducts,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: mockProducts.length,
      },
    });
  }),

  http.get("/api/v1/products/:slug", ({ params }) => {
    const product = mockProducts.find((p) => p.slug === params.slug);
    if (product) {
      return HttpResponse.json(product);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post("/api/v1/auth/login", async ({ request }) => {
    const body = await request.json();
    if (body.email === "test@example.com" && body.password === "password") {
      return HttpResponse.json({
        accessToken: "mock-jwt-token",
        user: mockUser,
      });
    }
    return new HttpResponse(null, { status: 401 });
  }),
];
```

### Mock хуков

```typescript
// test/mocks/hooks.ts
import { jest } from "@jest/globals";

export const mockUseCart = () => ({
  items: [],
  addItem: jest.fn(),
  removeItem: jest.fn(),
  updateQuantity: jest.fn(),
  total: 0,
});

export const mockUseAuth = () => ({
  user: null,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
});

// Использование в тесте
jest.mock("@/hooks/useCart", () => ({
  useCart: () => mockUseCart(),
}));
```

---

## 🚀 Запуск тестов

### Команды

```bash
# Все тесты
pnpm test

# Unit тесты
pnpm test:unit

# Integration тесты
pnpm test:integration

# E2E тесты
pnpm test:e2e

# Тесты с покрытием
pnpm test:coverage

# Watch mode
pnpm test:watch

# Конкретный файл
pnpm test products.service.test.ts

# E2E с UI
pnpm test:e2e --ui

# E2E конкретный файл
pnpm test:e2e checkout.spec.ts
```

### CI интеграция

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - run: pnpm install

      - name: Run Unit Tests
        run: pnpm test:unit --coverage

      - name: Run E2E Tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## ✅ Best Practices

### ARRANGE-ACT-ASSERT

```typescript
// ✅ Хорошо
it("should calculate total correctly", () => {
  // Arrange
  const cart = new Cart();
  cart.addItem({ id: 1, price: 100 }, 2);
  cart.addItem({ id: 2, price: 50 }, 1);

  // Act
  const total = cart.calculateTotal();

  // Assert
  expect(total).toBe(250);
});
```

### Один тест — одна ответственность

```typescript
// ❌ Плохо
it("should create user and send email and create cart", () => {
  // Слишком много проверок
});

// ✅ Хорошо
it("should create user", () => {
  /* ... */
});
it("should send welcome email", () => {
  /* ... */
});
it("should create empty cart", () => {
  /* ... */
});
```

### Независимые тесты

```typescript
// ✅ Каждый тест должен быть независим
describe("Cart", () => {
  let cart: Cart;

  beforeEach(() => {
    cart = new Cart(); // Новый экземпляр для каждого теста
  });

  it("should start empty", () => {
    expect(cart.items).toHaveLength(0);
  });

  it("should add item", () => {
    cart.addItem(product, 1);
    expect(cart.items).toHaveLength(1);
  });
});
```

### Описательные названия

```typescript
// ❌ Плохо
it("should work", () => {
  /* ... */
});
it("test 1", () => {
  /* ... */
});

// ✅ Хорошо
it("should apply 20% discount to total", () => {
  /* ... */
});
it("should throw error when email is invalid", () => {
  /* ... */
});
```

---

_Версия: 1.0.0 | Последнее обновление: Март 2026_
