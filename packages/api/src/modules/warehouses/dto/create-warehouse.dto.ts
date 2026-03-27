import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseDto {
  @ApiProperty({ description: 'Название склада' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Код склада (уникальный)' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Адрес склада' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Город' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ description: 'Телефон' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Активен ли склад', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class UpdateWarehouseDto {
  @ApiPropertyOptional({ description: 'Название склада' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Адрес склада' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Город' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Телефон' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Активен ли склад' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
