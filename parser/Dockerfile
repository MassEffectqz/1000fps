# WB Parser Server - Node.js
FROM node:20-alpine

WORKDIR /app

# Copy parser server
COPY parser-server.js .

# Environment variables
ENV PARSER_PORT=3005
ENV SITE_WEBHOOK_URL=http://host.docker.internal:3000/api/admin/parser/webhook

EXPOSE 3005

CMD ["node", "parser-server.js"]