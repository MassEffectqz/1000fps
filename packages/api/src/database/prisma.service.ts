import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    // Middleware для логирования медленных запросов
    this.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();

      const duration = after - before;

      // Логирование запросов дольше 100мс
      if (duration > 100) {
        this.logger.warn(`Медленный запрос: ${params.model}.${params.action} - ${duration}ms`);
      }

      return result;
    });

    await this.$connect();
    this.logger.log('Prisma подключена к базе данных');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma отключена от базы данных');
  }
}
