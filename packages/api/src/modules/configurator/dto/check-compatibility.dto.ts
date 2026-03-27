import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckCompatibilityDto {
  @ApiProperty({
    description: 'Компоненты для проверки совместимости',
    example: { cpu: 1, gpu: 5, motherboard: 3 },
  })
  @IsObject()
  parts: Record<string, number>;
}
