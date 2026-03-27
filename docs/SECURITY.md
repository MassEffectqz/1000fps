# 🔒 Security Policy

Политики и процедуры безопасности для 1000FPS

---

## 📋 Оглавление

1. [Общие принципы](#общие-принципы)
2. [Аутентификация и авторизация](#аутентификация-и-авторизация)
3. [Защита данных](#защита-данных)
4. [Безопасность кода](#безопасность-кода)
5. [Инфраструктура](#инфраструктура)
6. [Инциденты безопасности](#инциденты-безопасности)
7. [Комплаенс](#комплаенс)
8. [Обучение](#обучение)

---

## 🛡️ Общие принципы

### Security First

```
┌─────────────────────────────────────────────────────────┐
│                  SECURITY PYRAMID                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    ┌─────────┐                          │
│                   ╱ CULTURE   ╲                         │
│                  ╱─────────────╲                        │
│                 ╱   PROCESSES   ╲                       │
│                ╱─────────────────╲                      │
│               ╱     TOOLS         ╲                     │
│              ╱─────────────────────╲                    │
│             ╱       FOUNDATION      ╲                   │
│            ╱─────────────────────────╲                  │
│           ╱  AWARENESS & TRAINING     ╲                 │
│          ╱─────────────────────────────╲                │
│         ╱        GOVERNANCE             ╲               │
│        ╱─────────────────────────────────╲              │
│       ╱         COMPLIANCE                ╲             │
│      ╱─────────────────────────────────────╲            │
│     ╱           RISK MANAGEMENT             ╲           │
│    ╱─────────────────────────────────────────╲          │
│   ╱            SECURITY STRATEGY              ╲         │
│  ╱───────────────────────────────────────────────╲      │
│ ╚═══════════════════════════════════════════════════╝   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Принципы безопасности

1. **Defense in Depth** — Многоуровневая защита
2. **Least Privilege** — Минимальные привилегии
3. **Zero Trust** — Не доверяй, проверяй
4. **Secure by Default** — Безопасно по умолчанию
5. **Fail Securely** — Безопасный отказ
6. **Complete Mediation** — Полная проверка доступа
7. **Auditability** — Полная аудируемость

---

## 🔐 Аутентификация и авторизация

### Пароли

**Требования к паролям:**

```
✅ Минимум 12 символов
✅ Минимум 1 заглавная буква
✅ Минимум 1 строчная буква
✅ Минимум 1 цифра
✅ Минимум 1 специальный символ
❌ Нет распространённым паролям
❌ Нет личным данным
```

**Хранение:**

```typescript
// ✅ Хорошо — bcrypt с cost factor 12
const saltRounds = 12;
const hash = await bcrypt.hash(password, saltRounds);

// ❌ Плохо — MD5, SHA1, без соли
const hash = md5(password); // Никогда не использовать!
```

### JWT токены

**Конфигурация:**

```typescript
// ✅ Хорошо
{
  algorithm: 'RS256',
  expiresIn: '2h',
  refreshExpiresIn: '30d',
  issuer: '1000fps.ru',
  audience: '1000fps-app'
}

// ❌ Плохо
{
  algorithm: 'HS256',  // Симметричный ключ
  expiresIn: '7d',     // Слишком долго
  no expiration        // Никогда!
}
```

**Хранение токенов:**

```
✅ Access token: Memory / HttpOnly cookie
✅ Refresh token: HttpOnly cookie (secure, sameSite=strict)
❌ Access token: localStorage (XSS риск)
❌ Refresh token: localStorage
```

### RBAC (Role-Based Access Control)

**Роли:**

```typescript
enum Role {
  CUSTOMER = 'customer',      // Обычный пользователь
  MANAGER = 'manager',        // Менеджер
  ADMIN = 'admin',            // Администратор
  SUPER_ADMIN = 'super_admin' // Полный доступ
}

// Пример проверки прав
@Roles('admin', 'super_admin')
@Delete('users/:id')
async deleteUser(@Param('id') id: number) {
  // Только админы могут удалять пользователей
}
```

**Матрица доступа:**

| Ресурс         | Customer | Manager | Admin | Super Admin |
| -------------- | -------- | ------- | ----- | ----------- |
| Профиль (свой) | CRUD     | R       | R     | R           |
| Заказы (свои)  | CRUD     | R       | R     | R           |
| Товары         | R        | RU      | CRUD  | CRUD        |
| Заказы (все)   | -        | RU      | CRUD  | CRUD        |
| Пользователи   | -        | -       | RU    | CRUD        |
| Настройки      | -        | -       | RU    | CRUD        |
| Логи           | -        | -       | R     | CRUD        |
| Бэкапы         | -        | -       | -     | CRUD        |

---

## 🗄️ Защита данных

### Классификация данных

| Класс            | Примеры                | Защита             |
| ---------------- | ---------------------- | ------------------ |
| **Public**       | Описания товаров, цены | Базовая            |
| **Internal**     | Логи, метрики          | Аутентификация     |
| **Confidential** | Персональные данные    | Шифрование, аудит  |
| **Restricted**   | Пароли, ключи          | Строгое шифрование |

### Шифрование

**В покое (At Rest):**

```sql
-- PostgreSQL TDE (Transparent Data Encryption)
-- Включено по умолчанию в production

-- Шифрование чувствительных полей
UPDATE users SET
  phone = pgp_sym_encrypt('+79991234567', 'encryption_key')
WHERE id = 1;
```

**В движении (In Transit):**

```
✅ TLS 1.3 для всех соединений
✅ HTTPS только для всего трафика
✅ HSTS заголовок
✅ Certificate pinning для мобильных
```

**Nginx конфигурация:**

```nginx
server {
    listen 443 ssl http2;

    # TLS 1.3 только
    ssl_protocols TLSv1.3;
    ssl_ciphers 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256';

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'" always;
}
```

### Персональные данные (152-ФЗ)

**Требования:**

```
✅ Сбор только необходимых данных
✅ Явное согласие пользователя
✅ Право на удаление (Right to be forgotten)
✅ Право на доступ к данным
✅ Право на исправление
✅ Уведомление об утечках (72 часа)
✅ Хранение на территории РФ
```

**Реализация прав:**

```typescript
// Экспорт данных пользователя
@Get('users/me/export')
async exportData(@User() user: User) {
  const data = {
    profile: await this.usersService.findById(user.id),
    orders: await this.ordersService.findByUser(user.id),
    configs: await this.configsService.findByUser(user.id),
    bonusHistory: await this.bonusService.getHistory(user.id),
  };

  return data;
}

// Удаление данных (GDPR/152-ФЗ)
@Delete('users/me')
async deleteAccount(@User() user: User) {
  // Анонимизация вместо полного удаления
  await this.usersService.anonymize(user.id);

  // Удаление персональных данных
  await this.addressesService.deleteByUser(user.id);

  // Сохранение заказов (требование закона)
  await this.ordersService.anonymizeUser(user.id);
}
```

---

## 💻 Безопасность кода

### OWASP Top 10

#### 1. Injection

```typescript
// ❌ Плохо — SQL Injection риск
const users = await prisma.$queryRawUnsafe(
  `SELECT * FROM users WHERE email = '${email}'`,
);

// ✅ Хорошо — Parameterized queries
const users = await prisma.user.findMany({
  where: { email },
});
```

#### 2. Broken Authentication

```typescript
// ❌ Плохо — Нет rate limiting
@Post('auth/login')
async login(@Body() dto: LoginDto) {
  // Брутфорс возможен
}

// ✅ Хорошо — Rate limiting + 2FA
@Post('auth/login')
@Throttle({ strict: { limit: 5, ttl: 60 } })
async login(@Body() dto: LoginDto) {
  // Защита от брутфорса
}

@Post('auth/2fa/verify')
async verify2FA(@Body() dto: 2FADto) {
  // Двухфакторная аутентификация
}
```

#### 3. Sensitive Data Exposure

```typescript
// ❌ Плохо — Возврат всех данных
@Get('users/:id')
async getUser(@Param('id') id: number) {
  return this.usersService.findById(id); // Включая password hash!
}

// ✅ Хорошо — Сериализация
@Get('users/:id')
async getUser(@Param('id') id: number) {
  const user = await this.usersService.findById(id);
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    // password исключён
  };
}
```

#### 4. XML External Entities (XXE)

```typescript
// ❌ Плохо — Парсинг XML с внешними сущностями
const xml = parseXML(request.body, { allowExternal: true });

// ✅ Хорошо — Отключение внешних сущностей
const xml = parseXML(request.body, {
  allowExternal: false,
  disallowDoctype: true,
});
```

#### 5. Broken Access Control

```typescript
// ❌ Плохо — Нет проверки прав
@Delete('orders/:id')
async deleteOrder(@Param('id') id: number) {
  await this.ordersService.delete(id); // Любой может удалить любой заказ!
}

// ✅ Хорошо — Проверка прав
@Delete('orders/:id')
@Authorize()
async deleteOrder(@Param('id') id: number, @User() user: User) {
  const order = await this.ordersService.findById(id);

  if (order.userId !== user.id && user.role !== 'admin') {
    throw new ForbiddenException();
  }

  await this.ordersService.delete(id);
}
```

#### 6. Security Misconfiguration

```nginx
# ❌ Плохо — Дефолтная конфигурация
server {
    listen 80;
    server_name _;
    root /var/www/html;

    # Версия nginx видна
    server_tokens on;
}

# ✅ Хорошо — Безопасная конфигурация
server {
    listen 443 ssl http2;
    server_name 1000fps.ru;

    # Скрыть версию
    server_tokens off;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

#### 7. Cross-Site Scripting (XSS)

```typescript
// ❌ Плохо — Непроверенный ввод
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ Хорошо — Экранирование
<div>{sanitize(userComment)}</div>

// ✅ Хорошо — CSP
// Content-Security-Policy: default-src 'self'; script-src 'self'
```

#### 8. Insecure Deserialization

```typescript
// ❌ Плохо — Десериализация ненадёжных данных
const data = JSON.parse(untrustedInput);
eval(data.code); // RCE риск!

// ✅ Хорошо — Валидация схемы
const data = plainToClass(TrustedDto, JSON.parse(input));
validateOrReject(data);
```

#### 9. Using Components with Known Vulnerabilities

```bash
# ✅ Регулярная проверка уязвимостей
pnpm audit
npm audit

# ✅ Автоматизация в CI
# .github/workflows/security.yml
- name: Security Audit
  run: pnpm audit --audit-level=high
```

#### 10. Insufficient Logging & Monitoring

```typescript
// ❌ Плохо — Нет логирования
@Post('auth/login')
async login(@Body() dto: LoginDto) {
  // Тихий провал при ошибке
}

// ✅ Хорошо — Полное логирование
@Post('auth/login')
async login(@Body() dto: LoginDto, @Req() req: Request) {
  try {
    // ...
  } catch (error) {
    this.logger.warn({
      event: 'LOGIN_FAILED',
      email: dto.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}
```

---

## 🏗️ Инфраструктура

### Сетевая безопасность

```
┌─────────────────────────────────────────────────────────┐
│                    NETWORK ARCHITECTURE                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   INTERNET                                              │
│      │                                                  │
│      ▼                                                  │
│   ┌─────────────────┐                                   │
│   │   Cloudflare    │  ← DDoS protection, WAF          │
│   │      (CDN)      │                                   │
│   └────────┬────────┘                                   │
│            │                                            │
│            ▼                                            │
│   ┌─────────────────┐                                   │
│   │   DMZ Zone      │                                   │
│   │   ┌─────────┐   │                                   │
│   │   │  Nginx  │   │  ← Reverse proxy, SSL termination │
│   │   └────┬────┘   │                                   │
│   └────────┼────────┘                                   │
│            │                                            │
│            ▼                                            │
│   ┌─────────────────┐                                   │
│   │  Internal Zone  │                                   │
│   │  ┌───────────┐  │                                   │
│   │  │   API     │  │  ← Application servers           │
│   │  │ Storefront│  │                                   │
│   │  │   Admin   │  │                                   │
│   │  └─────┬─────┘  │                                   │
│   └────────┼────────┘                                   │
│            │                                            │
│            ▼                                            │
│   ┌─────────────────┐                                   │
│   │  Database Zone  │                                   │
│   │  ┌───────────┐  │                                   │
│   │  │ PostgreSQL│  │  ← Internal network only         │
│   │  │  Redis    │  │                                   │
│   │  └───────────┘  │                                   │
│   └─────────────────┘                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Firewall правила

```bash
# Разрешённые порты
# 80/tcp   — HTTP (redirect to HTTPS)
# 443/tcp  — HTTPS
# 22/tcp   — SSH (только с доверенных IP)

# Запрещённые порты (внутренние)
# 5432/tcp — PostgreSQL
# 6379/tcp — Redis
# 3000-3002/tcp — Приложения
```

### Hardening серверов

```bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
X11Forwarding no

# /etc/security/limits.conf
* hard core 0
* hard nproc 500
```

---

## 🚨 Инциденты безопасности

### Типы инцидентов

| Тип                | Примеры                             | Уровень |
| ------------------ | ----------------------------------- | ------- |
| **Утечка данных**  | Доступ к БД извне, экспорт данных   | P0      |
| **Взлом аккаунта** | Компрометация учётной записи        | P1      |
| **DDoS атака**     | Блокировка сервиса                  | P1/P2   |
| **Malware**        | Вредоносный код на сервере          | P0      |
| **Фишинг**         | Поддельные письма от имени компании | P2      |
| **Уязвимость**     | CVE в зависимостях                  | P2/P3   |

### Процесс реагирования

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  DETECT     │────▶│  CONTAIN    │────▶│  ERADICATE  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  REPORT     │     │  ANALYZE    │     │  RECOVER    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Уведомление об утечках

**Требования 152-ФЗ:**

```
T+0h    — Обнаружение утечки
T+24h   — Внутреннее расследование начато
T+72h   — Уведомление Роскомнадзора
T+72h   — Уведомление затронутых пользователей
T+10d   — Отчёт о принятых мерах
```

---

## 📋 Комплаенс

### 152-ФЗ (Персональные данные)

**Требования:**

```
✅ Регистрация в Роскомнадзоре
✅ Политика обработки ПДн
✅ Согласия пользователей
✅ Защита данных (технические меры)
✅ Локализация в РФ
✅ Уведомление об утечках
```

### PCI DSS (Платежные данные)

**Уровни:**

```
Level 1: > 6 млн транзакций/год (полный аудит)
Level 2: 1-6 млн транзакций/год (SAQ D)
Level 3: 20K-1M e-commerce (SAQ A)
Level 4: < 20K e-commerce (SAQ A)
```

**Наши меры:**

```
✅ Не храним данные карт
✅ Используем сертифицированные шлюзы
✅ TLS для всех соединений
✅ Регулярные сканирования ASV
```

### GDPR (для EU пользователей)

**Права пользователей:**

```
✅ Право на доступ
✅ Право на исправление
✅ Право на удаление
✅ Право на перенос данных
✅ Право на ограничение обработки
```

---

## 📚 Обучение

### Обязательное обучение

| Роль           | Частота  | Темы                               |
| -------------- | -------- | ---------------------------------- |
| Все сотрудники | Ежегодно | Security awareness, фишинг         |
| Разработчики   | Ежегодно | Secure coding, OWASP Top 10        |
| DevOps         | Ежегодно | Infrastructure security, hardening |
| Админы         | Ежегодно | Access control, monitoring         |

### Security Awareness

**Темы:**

- Распознавание фишинга
- Безопасные пароли
- Социальная инженерия
- Работа с ПДн
- Инциденты безопасности

**Тестирование:**

- Квизы после обучения
- Симуляция фишинга
- Практические задания

---

## 🔍 Аудит

### Внутренний аудит

**Ежеквартально:**

```
✅ Проверка доступов
✅ Анализ логов
✅ Сканирование уязвимостей
✅ Review изменений
```

### Внешний аудит

**Ежегодно:**

```
✅ Пенетрационное тестирование
✅ Аудит кода
✅ Проверка комплаенса
✅ Сертификаты (ISO 27001)
```

---

## 📞 Контакты

**Security команда:**

- Email: security@1000fps.ru
- Telegram: @1000fps_security
- Экстренно: +7-XXX-XXX-XX-XX

**Сообщить об уязвимости:**

- Email: vulnerability@1000fps.ru
- Форма: https://1000fps.ru/security/report

---

_Версия: 1.0.0 | Последнее обновление: Март 2026_
