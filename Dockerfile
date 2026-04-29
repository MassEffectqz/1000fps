FROM node:20-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV HOME=/home/nextjs
ENV npm_config_cache=/tmp/npm-cache

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid 1001 --create-home --home-dir /home/nextjs nextjs \
  && mkdir -p /tmp/npm-cache \
  && chown -R nextjs:nodejs /home/nextjs /tmp/npm-cache /app

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]