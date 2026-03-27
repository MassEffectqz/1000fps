import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Список заказов пользователя' })
  async findAll(@Request() req: Record<string, unknown>) {
    const userId = (req.user as Record<string, unknown>)?.sub;

    if (!userId) {
      return { message: 'Требуется авторизация' };
    }

    return this.ordersService.findAll(userId as number);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Заказ по ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: Record<string, unknown>) {
    const userId = (req.user as Record<string, unknown>)?.sub;
    return this.ordersService.findOne(id, userId as number);
  }

  @Post()
  @ApiOperation({ summary: 'Создать заказ' })
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req: Record<string, unknown>) {
    const userId = (req.user as Record<string, unknown>)?.sub;

    // Если пользователь авторизован, используем его ID
    const effectiveUserId = userId || createOrderDto.userId;

    return this.ordersService.create({
      ...createOrderDto,
      userId: effectiveUserId as number,
    });
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Отменить заказ' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(@Param('id', ParseIntPipe) id: number, @Request() req: Record<string, unknown>) {
    const userId = (req.user as Record<string, unknown>)?.sub;
    return this.ordersService.cancel(id, userId as number);
  }
}
