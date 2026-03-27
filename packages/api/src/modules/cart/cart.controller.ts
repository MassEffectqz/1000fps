import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

interface AuthRequest {
  user?: { sub: number };
  headers: Record<string, string | undefined>;
}

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Получить корзину' })
  async getCart(@Req() req: AuthRequest) {
    // Для гостевой корзины можно использовать sessionId из cookies
    const userId = req.user?.sub;
    const sessionId = req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return { cart: null, message: 'Требуется авторизация или sessionId' };
    }

    return this.cartService.getOrCreateCart(userId, sessionId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Добавить товар в корзину' })
  async addItem(@Body() addToCartDto: AddToCartDto, @Req() req: AuthRequest) {
    const userId = req.user?.sub;
    let sessionId = req.headers['x-session-id'];

    // Если нет авторизации и нет sessionId, создаём новый
    if (!userId && !sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Если пользователь авторизован, используем его ID
    const effectiveUserId = userId;

    return this.cartService.addItem({
      ...addToCartDto,
      userId: effectiveUserId,
      sessionId,
    });
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Обновить количество товара в корзине' })
  async updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCartItemDto: UpdateCartItemDto
  ) {
    return this.cartService.updateItem(id, updateCartItemDto.quantity);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Удалить товар из корзины' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(@Param('id', ParseIntPipe) id: number) {
    await this.cartService.removeItem(id);
    return { message: 'Товар удалён из корзины' };
  }

  @Delete()
  @ApiOperation({ summary: 'Очистить корзину' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@Req() req: AuthRequest) {
    const userId = req.user?.sub;
    const sessionId = req.headers['x-session-id'];

    await this.cartService.clearCart(userId, sessionId);
    return { message: 'Корзина очищена' };
  }

  @Post('promo')
  @ApiOperation({ summary: 'Применить промокод' })
  async applyPromo(@Body() data: { code: string }, @Req() req: AuthRequest) {
    const userId = req.user?.sub;
    const sessionId = req.headers['x-session-id'];

    return this.cartService.applyPromo(userId, sessionId, data.code);
  }
}
