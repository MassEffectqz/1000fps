import { IsString, IsOptional, IsNumber, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterProductsDto {
  @ApiPropertyOptional({ description: 'Slug категории' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Slug бренда' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ description: 'Минимальная цена' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Максимальная цена' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Номер страницы', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Лимит товаров', default: 24 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 24;

  @ApiPropertyOptional({
    description: 'Сортировка',
    enum: ['popular', 'price_asc', 'price_desc', 'newest', 'rating'],
    default: 'popular',
  })
  @IsString()
  @IsOptional()
  sort?: string = 'popular';
}
