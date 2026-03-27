import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({ description: 'Количество' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}
