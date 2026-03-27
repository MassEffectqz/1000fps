import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWarehouseStockDto {
  @ApiProperty({ description: 'Количество товара на складе' })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({ description: 'Зарезервировано', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  reserved?: number = 0;
}
