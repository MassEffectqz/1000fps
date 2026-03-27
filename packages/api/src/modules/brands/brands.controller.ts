import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список брендов' })
  async findAll() {
    return this.brandsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Получить бренд по slug' })
  @ApiParam({ name: 'slug', type: String })
  async findOne(@Param('slug') slug: string) {
    return this.brandsService.findOne(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Создать бренд' })
  async create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }
}
