# ============================================================
# Dockerfile для Next.js приложения 1000fps
# Multi-stage build: builder + runner
# ============================================================

# ------------------------------------------------------------
# Stage 1: Builder
# ------------------------------------------------------------
FROM node:20-alpine AS builder

# Установка зависимостей для сборки
RUN apk add --no-cache libc6-compat

# Рабочая директория
WORKDIR /app

# Копирование package файлов
COPY package.json package-lock.json ./

# Установка всех зависимостей (включая dev для сборки)
RUN npm ci

# Копирование исходников
COPY . .

# Копирование prisma схемы и генерация клиента
COPY prisma/schema.prisma ./prisma/
RUN npx prisma generate

# Сборка Next.js приложения
ENV NEXT_TELEMETRY_DISABLED=1
ENV ESLINT_DISABLE=1
RUN npm run build -- --no-lint

# ------------------------------------------------------------
# Stage 2: Runner
# ------------------------------------------------------------
FROM node:20-alpine AS runner

# Установка зависимостей для runtime
RUN apk add --no-cache libc6-compat openssl

# Создание non-root пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Рабочая директория
WORKDIR /app

# Копирование package файлов
COPY package.json package-lock.json ./

# Установка только production зависимостей
RUN npm ci --only=production && \
    npm cache clean --force

# Копирование prisma схемы и генерация клиента
COPY prisma/schema.prisma ./prisma/
RUN npx prisma generate

# Копирование собранного приложения из builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Копирование миграций Prisma для применения при старте
COPY prisma/migrations ./prisma/migrations

# Установка прав на файлы
RUN chown -R nextjs:nodejs /app

# Переключение на non-root пользователя
USER nextjs

# Порт приложения
EXPOSE 3000

# Переменные окружения
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Запуск приложения
CMD ["node", "server.js"]
