import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ description: 'URL slug' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Название' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Описание' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'URL логотипа' })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Официальный сайт' })
  @IsString()
  @IsOptional()
  website?: string;
}
