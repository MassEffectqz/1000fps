import { IsString, IsOptional, IsNumber, IsObject, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ImportProductDto {
  @ApiProperty({ description: 'Артикул товара' })
  @IsString()
  article: string;

  @ApiProperty({ description: 'Название' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Бренд' })
  @IsString()
  brand: string;

  @ApiProperty({ description: 'Цена' })
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ description: 'Старая цена' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  originalPrice?: number;

  @ApiProperty({ description: 'Категория' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ description: 'Описание' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Изображения' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ description: 'Характеристики (JSON)' })
  @IsObject()
  @IsOptional()
  specifications?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'URL товара' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: 'Источник', default: 'WB' })
  @IsString()
  @IsOptional()
  source?: string;
}
