import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConfigDto {
  @ApiPropertyOptional({ description: 'Название сборки', example: 'Игровой ПК 2026' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Компоненты сборки (partType: productId)',
    example: { cpu: 1, gpu: 5, motherboard: 3, ram: 7 },
  })
  @IsObject()
  parts: Record<string, number>;
}
