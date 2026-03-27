import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConfigDto {
  @ApiPropertyOptional({ description: 'Название сборки', example: 'Обновлённая сборка' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Компоненты сборки (partType: productId)',
    example: { cpu: 2, gpu: 8 },
  })
  @IsObject()
  @IsOptional()
  parts?: Record<string, number>;
}
