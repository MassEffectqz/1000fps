import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Поиск товаров' })
  @ApiQuery({ name: 'q', description: 'Поисковый запрос' })
  @ApiQuery({ name: 'limit', description: 'Лимит результатов', required: false })
  async search(@Query('q') query: string, @Query('limit') limit?: number) {
    return this.searchService.search(query, limit ? Number(limit) : 20);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Подсказки для поиска' })
  @ApiQuery({ name: 'q', description: 'Поисковый запрос' })
  async suggestions(@Query('q') query: string) {
    return this.searchService.getSuggestions(query);
  }
}
