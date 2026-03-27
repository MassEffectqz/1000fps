import {
  IsInt,
  Min,
  IsObject,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty({ description: 'ID товара' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  productId: number;

  @ApiProperty({ description: 'Количество' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'ID пользователя' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  userId: number;

  @ApiProperty({ description: 'Товары', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ description: 'Адрес доставки (JSON)' })
  @IsObject()
  shippingAddress: Record<string, unknown>;

  @ApiProperty({ description: 'Способ доставки' })
  @IsString()
  shippingMethod: string;

  @ApiPropertyOptional({ description: 'ID склада для самовывоза' })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  warehouseId?: number;

  @ApiPropertyOptional({ description: 'Способ оплаты' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Комментарий' })
  @IsString()
  @IsOptional()
  comment?: string;
}
