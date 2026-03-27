import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { UpdateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseStockDto } from './dto/update-warehouse-stock.dto';

@ApiTags('warehouses')
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все склады' })
  async findAll() {
    return this.warehousesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить склад по ID' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.warehousesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить склад' })
  @ApiParam({ name: 'id', type: Number })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWarehouseDto: UpdateWarehouseDto
  ) {
    return this.warehousesService.update(id, updateWarehouseDto);
  }

  @Get('products/:productId/stock')
  @ApiOperation({ summary: 'Получить остатки товара на всех складах' })
  @ApiParam({ name: 'productId', type: Number, description: 'ID товара' })
  async getAllProductStock(@Param('productId', ParseIntPipe) productId: number) {
    return this.warehousesService.getProductStock(productId);
  }

  @Get(':id/products/:productId/stock')
  @ApiOperation({ summary: 'Получить остатки товара на складе' })
  @ApiParam({ name: 'id', type: Number, description: 'ID склада' })
  @ApiParam({ name: 'productId', type: Number, description: 'ID товара' })
  async getProductStock(
    @Param('id', ParseIntPipe) id: number,
    @Param('productId', ParseIntPipe) productId: number
  ) {
    return this.warehousesService.getProductStock(productId);
  }

  @Put(':id/products/:productId/stock')
  @ApiOperation({ summary: 'Обновить остаток товара на складе' })
  @ApiParam({ name: 'id', type: Number, description: 'ID склада' })
  @ApiParam({ name: 'productId', type: Number, description: 'ID товара' })
  async updateStock(
    @Param('id', ParseIntPipe) warehouseId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateStockDto: UpdateWarehouseStockDto
  ) {
    return this.warehousesService.updateStock(warehouseId, productId, updateStockDto);
  }

  @Post(':id/products/:productId/reserve')
  @ApiOperation({ summary: 'Зарезервировать товар на складе' })
  @ApiParam({ name: 'id', type: Number, description: 'ID склада' })
  @ApiParam({ name: 'productId', type: Number, description: 'ID товара' })
  async reserveStock(
    @Param('id', ParseIntPipe) warehouseId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() data: { quantity: number }
  ) {
    return this.warehousesService.reserveStock(warehouseId, productId, data.quantity);
  }

  @Post(':id/products/:productId/unreserve')
  @ApiOperation({ summary: 'Снять резерв с товара' })
  @ApiParam({ name: 'id', type: Number, description: 'ID склада' })
  @ApiParam({ name: 'productId', type: Number, description: 'ID товара' })
  async unreserveStock(
    @Param('id', ParseIntPipe) warehouseId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() data: { quantity: number }
  ) {
    return this.warehousesService.unreserveStock(warehouseId, productId, data.quantity);
  }

  @Post(':id/products/:productId/deduct')
  @ApiOperation({ summary: 'Списать товар со склада' })
  @ApiParam({ name: 'id', type: Number, description: 'ID склада' })
  @ApiParam({ name: 'productId', type: Number, description: 'ID товара' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deductStock(
    @Param('id', ParseIntPipe) warehouseId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() data: { quantity: number }
  ) {
    await this.warehousesService.deductStock(warehouseId, productId, data.quantity);
    return { message: 'Товар списан' };
  }
}
