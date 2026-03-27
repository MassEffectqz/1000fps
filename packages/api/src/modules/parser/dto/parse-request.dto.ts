import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ParseRequestDto {
  @ApiProperty({ description: 'Источник парсинга', enum: ['WB', 'OZON', 'OTHER'] })
  @IsString()
  source: string;

  @ApiPropertyOptional({ description: 'URL для парсинга' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: 'Артикул товара' })
  @IsString()
  @IsOptional()
  article?: string;
}
