import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ParserService } from './parser.service';
import { ImportProductDto } from './dto/import-product.dto';
import { ParseRequestDto } from './dto/parse-request.dto';

@ApiTags('parser')
@Controller('parser')
export class ParserController {
  constructor(private readonly parserService: ParserService) {}

  @Post('parse')
  @ApiOperation({ summary: 'Запустить парсинг' })
  @ApiBody({ type: ParseRequestDto })
  async parse(@Body() parseRequestDto: ParseRequestDto) {
    return this.parserService.parse(parseRequestDto);
  }

  @Post('import')
  @ApiOperation({ summary: 'Импортировать товар из парсера' })
  @ApiBody({ type: ImportProductDto })
  async import(@Body() importProductDto: ImportProductDto) {
    return this.parserService.importProduct(importProductDto);
  }

  @Get('status')
  @ApiOperation({ summary: 'Статус парсера' })
  async getStatus() {
    return this.parserService.getStatus();
  }

  @Get('logs')
  @ApiOperation({ summary: 'Логи парсера' })
  async getLogs(@Query('source') source?: string, @Query('limit') limit?: number) {
    return this.parserService.getLogs(source, limit);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook для парсера (из wb-server)' })
  async webhook(@Body() data: Record<string, unknown>) {
    return this.parserService.handleWebhook(data);
  }
}
