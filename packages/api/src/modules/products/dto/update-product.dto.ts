import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsString, IsArray, IsEnum } from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    description: 'Статус товара',
    enum: ProductStatus,
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({ description: 'URL изображений', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
