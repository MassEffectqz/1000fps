import { Module } from '@nestjs/common';
import { ParserController } from './parser.controller';
import { ParserService } from './parser.service';
import { PrismaService } from '../../database/prisma.service';
import { ProductsService } from '../products/products.service';
import { BrandsService } from '../brands/brands.service';
import { CategoriesService } from '../categories/categories.service';

@Module({
  controllers: [ParserController],
  providers: [ParserService, PrismaService, ProductsService, BrandsService, CategoriesService],
  exports: [ParserService],
})
export class ParserModule {}
