import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить дерево категорий' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Получить категорию по slug' })
  @ApiParam({ name: 'slug', type: String })
  async findOne(@Param('slug') slug: string) {
    return this.categoriesService.findOne(slug);
  }

  @Get('by-id/:id')
  @ApiOperation({ summary: 'Получить категорию по ID' })
  @ApiParam({ name: 'id', type: Number })
  async findById(@Param('id') id: number) {
    return this.categoriesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать категорию' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить категорию' })
  @ApiParam({ name: 'id', type: Number })
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить категорию' })
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id') id: number) {
    return this.categoriesService.remove(id);
  }
}
