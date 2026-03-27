import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'URL slug' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Название' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Описание' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'ID родительской категории' })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  parentId?: number;

  @ApiPropertyOptional({ description: 'URL изображения' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Позиция', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  position?: number = 0;
}
