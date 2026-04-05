import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

// Загружаем .env файл для Prisma
dotenv.config({ path: '.env' });

export default defineConfig({
  engine: 'classic',
  datasource: {
    // Использует DATABASE_URL из .env
    // Если не задано, пытается подключиться к localhost:5432
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fps1000?schema=public',
  },
});
