import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiPropertyOptional({ description: 'Название (Дом/Работа)' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Город' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Улица' })
  @IsString()
  street: string;

  @ApiProperty({ description: 'Дом' })
  @IsString()
  building: string;

  @ApiPropertyOptional({ description: 'Квартира/офис' })
  @IsString()
  @IsOptional()
  apartment?: string;

  @ApiPropertyOptional({ description: 'Почтовый индекс' })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Телефон для доставки' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Комментарий' })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional({ description: 'Адрес по умолчанию' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Широта' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Долгота' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;
}
