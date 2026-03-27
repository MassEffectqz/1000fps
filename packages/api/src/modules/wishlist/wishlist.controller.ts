import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';

@ApiTags('wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Получить вишлист' })
  async getWishlist(@Request() req: Record<string, unknown>) {
    const userId = (req.user as Record<string, unknown>)?.sub;

    if (!userId) {
      return { message: 'Требуется авторизация' };
    }

    return this.wishlistService.getWishlist(userId as number);
  }

  @Post('items')
  @ApiOperation({ summary: 'Добавить в вишлист' })
  async addItem(@Body() data: { productId: number }, @Request() req: Record<string, unknown>) {
    const userId = (req.user as Record<string, unknown>)?.sub;

    if (!userId) {
      return { message: 'Требуется авторизация' };
    }

    return this.wishlistService.addItem(userId as number, data.productId);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Удалить из вишлиста' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(@Param('id', ParseIntPipe) id: number) {
    await this.wishlistService.removeItem(id);
    return { message: 'Удалено из вишлиста' };
  }
}
