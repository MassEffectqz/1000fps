import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  IsObject,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductSource, Prisma, ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ description: 'URL slug' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Артикул (SKU)' })
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Название' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Краткое описание' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Полное описание (HTML)' })
  @IsString()
  @IsOptional()
  fullDescription?: string;

  @ApiProperty({ description: 'ID категории' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  categoryId: number;

  @ApiPropertyOptional({ description: 'ID бренда' })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  brandId?: number;

  @ApiProperty({ description: 'Цена' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ description: 'Старая цена' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  oldPrice?: number;

  @ApiPropertyOptional({ description: 'Остаток на складе', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  stock?: number = 0;

  @ApiPropertyOptional({ description: 'Главное изображение' })
  @IsString()
  @IsOptional()
  mainImageUrl?: string;

  @ApiPropertyOptional({ description: 'Характеристики (JSON)' })
  @IsObject()
  @IsOptional()
  specifications?: Prisma.InputJsonValue;

  @ApiPropertyOptional({
    description: 'Источник товара',
    enum: ProductSource,
    default: ProductSource.MANUAL,
  })
  @IsString()
  @IsOptional()
  source?: ProductSource = ProductSource.MANUAL;

  @ApiPropertyOptional({ description: 'Внешний ID (для парсера)' })
  @IsString()
  @IsOptional()
  externalId?: string;

  @ApiPropertyOptional({ description: 'URL источника (для парсера)' })
  @IsString()
  @IsOptional()
  externalUrl?: string;

  @ApiPropertyOptional({
    description: 'Статус товара',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus = ProductStatus.ACTIVE;

  @ApiPropertyOptional({ description: 'URL изображений', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
