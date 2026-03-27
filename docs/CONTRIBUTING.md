# 🤝 Contributing Guide

Руководство по внесению изменений в проект 1000FPS

---

## 📋 Оглавление

1. [Начало работы](#начало-работы)
2. [Ветвление](#ветвление)
3. [Коммиты](#коммиты)
4. [Pull Requests](#pull-requests)
5. [Code Review](#code-review)
6. [Релизы](#релизы)

---

## 🚀 Начало работы

### 1. Форк репозитория

```bash
# Форкните репозиторий через GitHub UI
# Затем клонируйте свой форк
git clone https://github.com/YOUR_USERNAME/1000fps.git
cd 1000fps
```

### 2. Настройка upstream

```bash
# Добавьте оригинальный репозиторий как upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/1000fps.git

# Проверьте remote
git remote -v
# origin    https://github.com/YOUR_USERNAME/1000fps.git (fetch)
# origin    https://github.com/YOUR_USERNAME/1000fps.git (push)
# upstream  https://github.com/ORIGINAL_OWNER/1000fps.git (fetch)
# upstream  https://github.com/ORIGINAL_OWNER/1000fps.git (push)
```

### 3. Синхронизация с upstream

```bash
# Получите последние изменения
git fetch upstream

# Переключитесь на main
git checkout main

# Влейте изменения из upstream
git merge upstream/main

# Отправьте в свой форк
git push origin main
```

---

## 🌿 Ветвление

### Стратегия ветвления

Мы используем **GitHub Flow** с элементами **Git Flow**:

```
main (production)
  │
  ├─── develop (staging)
  │      │
  │      ├─── feature/user-auth
  │      ├─── feature/cart-module
  │      ├─── bugfix/login-error
  │      └─── hotfix/security-patch
  │
  └─── release/v1.0.0
```

### Типы веток

| Префикс     | Описание                  | Пример                  |
| ----------- | ------------------------- | ----------------------- |
| `feature/`  | Новая функциональность    | `feature/user-auth`     |
| `bugfix/`   | Исправление бага          | `bugfix/login-error`    |
| `hotfix/`   | Критическое исправление   | `hotfix/security-patch` |
| `release/`  | Подготовка релиза         | `release/v1.0.0`        |
| `docs/`     | Документация              | `docs/api-update`       |
| `refactor/` | Рефакторинг               | `refactor/auth-module`  |
| `test/`     | Тесты                     | `test/cart-e2e`         |
| `chore/`    | Вспомогательные изменения | `chore/update-deps`     |

### Создание ветки

```bash
# Создайте и переключитесь на новую ветку
git checkout -b feature/your-feature-name

# Или
git switch -c feature/your-feature-name
```

### Именование веток

**✅ Хорошо:**

```
feature/user-registration
bugfix/cart-total-calculation
hotfix/critical-security-fix
docs/api-documentation
refactor/auth-service
```

**❌ Плохо:**

```
new-feature
fix
test
my-branch
feature/123
```

---

## ✍️ Коммиты

### Соглашения коммитов

Мы используем [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Типы коммитов

| Тип        | Описание                                   |
| ---------- | ------------------------------------------ |
| `feat`     | Новая функциональность                     |
| `fix`      | Исправление бага                           |
| `docs`     | Изменения в документации                   |
| `style`    | Форматирование, пробелы (не влияет на код) |
| `refactor` | Рефакторинг кода                           |
| `test`     | Добавление/изменение тестов                |
| `chore`    | Изменения в сборке, зависимостях           |
| `perf`     | Улучшение производительности               |
| `ci`       | Изменения в CI/CD                          |
| `build`    | Изменения в системе сборки                 |

### Примеры коммитов

**✅ Хорошо:**

```bash
feat(auth): add JWT refresh token support

- Implement refresh token rotation
- Add token blacklist for revoked tokens
- Update auth tests

Closes #123
```

```bash
fix(cart): calculate total with discount correctly

The discount was applied twice when using promo codes.
Now it's applied only once.

Fixes #456
```

```bash
docs(api): update products endpoint documentation

- Add new query parameters
- Update response examples
- Document error codes
```

**❌ Плохо:**

```bash
fix
fixed bug
update
changes
asdfasdf
```

### Команды для коммитов

```bash
# Добавление изменений
git add .

# Интерактивное добавление
git add -p

# Коммит
git commit -m "feat(auth): add login functionality"

# Коммит с редактором
git commit

# Коммит с исправлением предыдущего
git commit --amend

# Коммит без проверки хуков (экстренные случаи)
git commit --no-verify -m "hotfix: emergency fix"
```

### Commitlint

У нас настроена проверка коммитов через commitlint:

```bash
# Установка (если нет глобально)
pnpm add -D @commitlint/cli @commitlint/config-conventional

# Проверка последнего коммита
pnpm commitlint --from HEAD~1

# Проверка диапазона
pnpm commitlint --from HEAD~5 --to HEAD
```

---

## 🔀 Pull Requests

### Создание PR

1. **Запушьте ветку:**

```bash
git push origin feature/your-feature
```

2. **Создайте PR на GitHub:**
   - Перейдите в репозиторий
   - Нажмите "New Pull Request"
   - Выберите base: `develop`, compare: вашу ветку
   - Заполните описание

### Шаблон PR

```markdown
## Описание

Краткое описание изменений

## Тип изменений

- [ ] ✨ Новая функциональность
- [ ] 🐛 Исправление бага
- [ ] 📝 Документация
- [ ] ♻️ Рефакторинг
- [ ] 🧪 Тесты
- [ ] ⚙️ Конфигурация/сборка

## Связанные задачи

Closes #123

## Чек-лист

- [ ] Код отформатирован (pnpm format)
- [ ] Пройден линтинг (pnpm lint)
- [ ] Тесты проходят (pnpm test)
- [ ] Добавлены тесты
- [ ] Обновлена документация
- [ ] Проверено локально

## Скриншоты (если применимо)

<!-- Скриншоты UI изменений -->

## Замечания

<!-- Особые замечания для ревьюеров -->
```

### Размер PR

**Рекомендуемый размер:**

- Строки кода: < 400
- Файлов: < 15
- Время на review: < 30 минут

**Большие PR следует разбивать:**

```
❌ feature/big-refactor (2000 строк)
✅ refactor/part-1-db (400 строк)
✅ refactor/part-2-api (350 строк)
✅ refactor/part-3-ui (380 строк)
```

---

## 👀 Code Review

### Для авторов

1. **Перед отправкой на review:**
   - Проверьте CI статус (все ли тесты прошли)
   - Пройдитесь по своим изменениям сами
   - Убедитесь, что нет debug console.log'ов

2. **Ответы на комментарии:**
   - Отвечайте в течение 24 часов
   - Будьте вежливы и конструктивны
   - Если не согласны — аргументируйте

3. **Внесение изменений:**
   ```bash
   # Внесите правки
   git add .
   git commit -m "fix review comments"
   git push
   ```

### Для ревьюеров

**Чек-лист ревью:**

- [ ] Код решает поставленную задачу
- [ ] Нет очевидных багов
- [ ] Код читаемый и понятный
- [ ] Есть тесты на новую функциональность
- [ ] Документация обновлена
- [ ] Нет проблем с безопасностью
- [ ] Производительность не ухудшилась

**Комментирование:**

```
✅ Хорошо:
"Можно вынести эту логику в отдельную функцию для переиспользования"
"Здесь возможна race condition, лучше использовать транзакцию"
"Отличное решение с кэшированием!"

❌ Плохо:
"не нравится"
"переделай"
"зачем это?"
```

**Время на review:**

- Малые PR (< 100 строк): 4 часа
- Средние PR (100-400 строк): 24 часа
- Большие PR (> 400 строк): 48 часов

---

## 📦 Релизы

### Версионирование

Мы используем [Semantic Versioning](https://semver.org/lang/ru/):

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └─ Совместимые исправления (bug fixes)
  │     └─────── Новая функциональность (backward compatible)
  └───────────── Критические изменения (breaking changes)
```

**Примеры:**

```
1.0.0 → 1.0.1  # Bug fix
1.0.0 → 1.1.0  # New feature
1.0.0 → 2.0.0  # Breaking change
```

### Процесс релиза

```bash
# 1. Создайте release ветку
git checkout -b release/v1.2.0 develop

# 2. Обновите версию в package.json
# 3. Обновите CHANGELOG.md
# 4. Протестируйте

# 5. Влейте в main
git checkout main
git merge release/v1.2.0

# 6. Создайте тег
git tag -a v1.2.0 -m "Release v1.2.0"

# 7. Влейте изменения обратно в develop
git checkout develop
git merge release/v1.2.0

# 8. Запушьте
git push origin main develop --tags
```

### CHANGELOG

Формат CHANGELOG.md:

```markdown
## [1.2.0] - 2026-03-23

### ✨ Added

- Добавлена система бонусов (#123)
- Новый endpoint для вишлиста (#145)

### 🐛 Fixed

- Исправлен расчёт скидки в корзине (#156)
- Утечка памяти в конфигураторе (#167)

### ⚡ Changed

- Обновлена версия Next.js до 14.1.0
- Улучшена производительность поиска на 30%

### 🗑️ Deprecated

- Устарел endpoint /api/v1/cart/legacy

### 🔒 Security

- Обновлены зависимости с уязвимостями
```

---

## 🧪 Тестирование перед отправкой

```bash
# Запустите все проверки перед коммитом
pnpm lint          # Линтинг
pnpm type-check    # Проверка типов
pnpm test          # Unit тесты
pnpm test:e2e      # E2E тесты
pnpm build         # Сборка
```

---

## 📞 Помощь

**Вопросы по contribution:** dev-support@1000fps.ru

**Обсуждения:** GitHub Discussions

---

_Версия: 1.0.0 | Последнее обновление: Март 2026_
