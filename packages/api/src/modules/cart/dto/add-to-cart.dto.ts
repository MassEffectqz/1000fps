import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiPropertyOptional({ description: 'ID пользователя (необязательно, берётся из сессии)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  userId?: number;

  @ApiProperty({ description: 'ID товара' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  productId: number;

  @ApiPropertyOptional({ description: 'Количество', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  quantity?: number = 1;
}
