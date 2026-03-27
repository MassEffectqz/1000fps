import { Module } from '@nestjs/common';
import { ConfiguratorController } from './configurator.controller';
import { ConfiguratorService } from './configurator.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [ConfiguratorController],
  providers: [ConfiguratorService, PrismaService],
  exports: [ConfiguratorService],
})
export class ConfiguratorModule {}
