FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

COPY server.js ./

EXPOSE 3005

ENV NODE_ENV=production
ENV PARSER_PORT=3005

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 -qO- http://127.0.0.1:3005/api/health | grep -q '"status":"ok"' || exit 1

CMD ["node", "server.js"]
