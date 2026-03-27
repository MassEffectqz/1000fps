# 🧪 Testing Guide

Руководство по тестированию для проекта 1000FPS

---

## 📋 Оглавление

1. [Установка](#установка)
2. [Unit тесты](#unit-тесты)
3. [Integration тесты](#integration-тесты)
4. [E2E тесты](#e2e-тесты)
5. [Best Practices](#best-practices)

---

## 🚀 Установка

### Frontend (Storefront/Admin)

```bash
cd apps/storefront

# Установить Jest и Testing Library
pnpm add -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D @types/jest jest-environment-jsdom

# Установить Mock Next.js router
pnpm add -D next-router-mock
```

### Backend (API)

```bash
cd packages/api

# Jest уже установлен с NestJS
# Добавить supertest для API тестов
pnpm add -D @types/supertest supertest
```

### E2E тесты

```bash
# В корне проекта
pnpm add -D @playwright/test -w

# Инициализировать Playwright
npx playwright install
npx playwright install-deps
```

---

## 📁 Структура тестов

### Frontend

```
apps/storefront/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   └── Button.test.tsx      ← Тесты рядом с компонентом
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Header.test.tsx
│   ├── hooks/
│   │   ├── useCart.ts
│   │   └── useCart.test.ts
│   └── lib/
│       ├── api.ts
│       └── api.test.ts
├── tests/
│   ├── e2e/
│   │   ├── homepage.spec.ts
│   │   └── checkout.spec.ts
│   └── fixtures/
│       └── test-data.ts
├── jest.config.js
└── package.json
```

### Backend

```
packages/api/
├── src/
│   └── modules/
│       ├── products/
│       │   ├── products.service.ts
│       │   └── products.service.spec.ts  ← Тесты рядом с сервисом
│       └── orders/
│           ├── orders.service.ts
│           └── orders.service.spec.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
└── jest.config.js
```

---

## ✍️ Unit тесты

### Компоненты React

```typescript
// components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes', () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    expect(container.firstChild).toHaveClass('bg-orange-500');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});
```

### Хуки

```typescript
// hooks/useCart.test.ts
import { renderHook, act } from "@testing-library/react";
import { useCartStore } from "./useCart";

describe("useCart", () => {
  beforeEach(() => {
    // Очистка store перед каждым тестом
    useCartStore.setState({
      cart: null,
      isLoading: false,
      isOpen: false,
    });
  });

  it("adds item to cart", async () => {
    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      await result.current.addItem(1, 2);
    });

    expect(result.current.cart?.items).toHaveLength(1);
    expect(result.current.cart?.items[0].quantity).toBe(2);
  });

  it("updates item quantity", async () => {
    // Setup
    useCartStore.setState({
      cart: {
        id: 1,
        userId: 1,
        items: [{ id: 1, productId: 1, quantity: 1, price: 100 }],
        totalPrice: 100,
      },
    });

    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      await result.current.updateItem(1, 3);
    });

    expect(result.current.cart?.items[0].quantity).toBe(3);
  });
});
```

### API Client

```typescript
// lib/api.test.ts
import { authApi } from "./api";

global.fetch = jest.fn();

describe("Auth API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("login returns user data", async () => {
    const mockUser = { id: 1, email: "test@example.com" };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    const result = await authApi.login({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.user).toEqual(mockUser);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("login throws error on invalid credentials", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    await expect(
      authApi.login({ email: "test@example.com", password: "wrong" }),
    ).rejects.toThrow("Invalid credentials");
  });
});
```

---

## 🔗 Integration тесты

### Backend API

```typescript
// products.e2e-spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "../src/database/prisma.service";

describe("Products API (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Очистка БД перед каждым тестом
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
  });

  describe("/products (GET)", () => {
    it("returns empty array", () => {
      return request(app.getHttpServer())
        .get("/api/v1/products")
        .expect(200)
        .expect({ data: [], total: 0 });
    });

    it("returns products", async () => {
      // Setup
      await prisma.product.create({
        data: {
          sku: "TEST-001",
          name: "Test Product",
          slug: "test-product",
          price: 1000,
          stock: 10,
          available: true,
          categoryId: 1,
        },
      });

      return request(app.getHttpServer())
        .get("/api/v1/products")
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].name).toBe("Test Product");
        });
    });
  });

  describe("/products/:slug (GET)", () => {
    it("returns product by slug", async () => {
      const product = await prisma.product.create({
        data: {
          sku: "TEST-001",
          name: "Test Product",
          slug: "test-product",
          price: 1000,
          stock: 10,
          available: true,
          categoryId: 1,
        },
      });

      return request(app.getHttpServer())
        .get(`/api/v1/products/${product.slug}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe("Test Product");
        });
    });

    it("returns 404 for non-existent product", () => {
      return request(app.getHttpServer())
        .get("/api/v1/products/non-existent")
        .expect(404);
    });
  });
});
```

---

## 🌐 E2E тесты (Playwright)

### Базовая настройка

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
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
  ],
});
```

### Тесты

```typescript
// tests/e2e/homepage.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads correctly", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/1000FPS/);
    await expect(page.getByText("1000fps")).toBeVisible();
  });

  test("displays hero section", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Хит продаж")).toBeVisible();
    await expect(page.getByText("RTX 4090")).toBeVisible();
  });

  test("navigation works", async ({ page }) => {
    await page.goto("/");

    await page.getByText("Каталог").click();
    await expect(page).toHaveURL("/catalog");
  });
});
```

```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Checkout Flow", () => {
  test("complete purchase", async ({ page }) => {
    await page.goto("/product/rtx-4090");

    // Add to cart
    await page.getByRole("button", { name: "В корзину" }).click();

    // Open cart
    await page.getByRole("button", { name: "Корзина" }).click();
    await expect(page.getByText("RTX 4090")).toBeVisible();

    // Checkout
    await page.getByRole("button", { name: "Оформить заказ" }).click();
    await expect(page).toHaveURL("/checkout");

    // Fill form
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Телефон").fill("+7 999 123-45-67");
    await page.getByLabel("Адрес доставки").fill("Москва, ул. Test, д. 1");

    // Submit
    await page.getByRole("button", { name: "Заказать" }).click();

    // Success
    await expect(page.getByText("Заказ оформлен")).toBeVisible({
      timeout: 5000,
    });
  });
});
```

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user registration", async ({ page }) => {
    await page.goto("/auth/register");

    await page.getByLabel("Email").fill("newuser@example.com");
    await page.getByLabel("Пароль").fill("SecurePass123!");
    await page.getByLabel("Подтверждение пароля").fill("SecurePass123!");

    await page.getByRole("button", { name: "Зарегистрироваться" }).click();

    await expect(page).toHaveURL("/profile");
    await expect(page.getByText("newuser@example.com")).toBeVisible();
  });

  test("user login", async ({ page }) => {
    await page.goto("/auth/login");

    await page.getByLabel("Email").fill("existing@example.com");
    await page.getByLabel("Пароль").fill("Password123!");

    await page.getByRole("button", { name: "Войти" }).click();

    await expect(page).toHaveURL("/profile");
  });

  test("user logout", async ({ page }) => {
    // Login first
    await page.goto("/auth/login");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Пароль").fill("Password123!");
    await page.getByRole("button", { name: "Войти" }).click();

    // Logout
    await page.goto("/profile");
    await page.getByRole("button", { name: "Выйти" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByText("Профиль")).not.toBeVisible();
  });
});
```

---

## 📊 Best Practices

### 1. Паттерны тестирования

```typescript
// ✅ Arrange-Act-Assert
test("adds item to cart", () => {
  // Arrange
  const cart = createMockCart();

  // Act
  cart.addItem(product);

  // Assert
  expect(cart.items).toHaveLength(1);
});

// ✅ Test one thing per test
test("calculates total correctly", () => {
  // Only test total calculation
});

test("applies discount correctly", () => {
  // Only test discount application
});
```

### 2. Mocking

```typescript
// ✅ Mock API calls
jest.mock("@/lib/api", () => ({
  authApi: {
    login: jest.fn().mockResolvedValue({ user: mockUser }),
  },
}));

// ✅ Mock custom hooks
jest.mock("@/hooks/useCart", () => ({
  useCartStore: () => ({
    addItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));
```

### 3. Test Data

```typescript
// ✅ Create test data factories
function createMockProduct(overrides = {}) {
  return {
    id: 1,
    slug: "test-product",
    name: "Test Product",
    price: 1000,
    stock: 10,
    available: true,
    ...overrides,
  };
}

function createMockUser(overrides = {}) {
  return {
    id: 1,
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    ...overrides,
  };
}

// Использование
const product = createMockProduct({ price: 2000 });
const user = createMockUser({ email: "custom@example.com" });
```

### 4. Coverage

```json
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

## 📝 Команды

```bash
# Frontend
cd apps/storefront
pnpm test                    # Запустить тесты
pnpm test:watch             # Watch mode
pnpm test:coverage          # С отчётом о покрытии

# Backend
cd packages/api
pnpm test                   # Unit тесты
pnpm test:e2e              # E2E тесты
pnpm test:cov              # С покрытием

# E2E (Playwright)
pnpm test:e2e              # Запустить E2E тесты
pnpm test:e2e:ui           # С UI
pnpm test:e2e:report       # Открыть отчёт
```

---

## 🎯 Чек-лист

- [ ] Настроить Jest для frontend
- [ ] Написать тесты для UI компонентов
- [ ] Написать тесты для hooks
- [ ] Написать тесты для API client
- [ ] Настроить Playwright
- [ ] Написать E2E тесты для основных сценариев
- [ ] Настроить CI/CD для тестов
- [ ] Достигнуть 80% покрытия кода

---

_Версия: 1.0.0 | Март 2026_
