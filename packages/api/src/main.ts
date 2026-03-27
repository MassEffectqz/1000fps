import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './database/prisma.service';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);
    const _prismaService = app.get(PrismaService);

    // Global prefix
    app.setGlobalPrefix('api/v1');

    // Static files for uploads
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
    });

    // CORS
    const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:3000');
    app.enableCors({
      origin: corsOrigin.split(',').map((origin: string) => origin.trim()),
      credentials: true,
    });

    // Validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      })
    );

    // Swagger
    const config = new DocumentBuilder()
      .setTitle('1000FPS API')
      .setDescription('REST API для интернет-магазина компьютерной техники 1000FPS')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Аутентификация и регистрация')
      .addTag('products', 'Управление товарами')
      .addTag('categories', 'Категории товаров')
      .addTag('brands', 'Бренды')
      .addTag('orders', 'Заказы')
      .addTag('users', 'Пользователи')
      .addTag('cart', 'Корзина покупок')
      .addTag('wishlist', 'Список желаемого')
      .addTag('configurator', 'Конфигуратор ПК')
      .addTag('parser', 'Парсер цен')
      .addTag('search', 'Поиск товаров')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);

    const port = configService.get('PORT', 3001);
    await app.listen(port);

    logger.log(`
  ╔═══════════════════════════════════════════════════╗
  ║           1000FPS API Server Started              ║
  ╠═══════════════════════════════════════════════════╣
  ║  Environment: ${configService.get('NODE_ENV', 'development').padEnd(36)} ║
  ║  Port: ${port.toString().padEnd(42)} ║
  ║  Swagger: http://localhost:${port}/swagger ${' '.repeat(20)}║
  ║  API: http://localhost:${port}/api/v1 ${' '.repeat(24)}║
  ╚═══════════════════════════════════════════════════╝
  `);
  } catch (error) {
    Logger.error('Bootstrap', 'Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

bootstrap();
