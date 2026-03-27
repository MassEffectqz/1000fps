import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('user')
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Получить профиль пользователя' })
  async getProfile(@Request() req: Record<string, unknown>) {
    const userId = (req.user as Record<string, unknown>)?.sub;

    if (!userId) {
      return { message: 'Требуется авторизация' };
    }

    return this.usersService.getProfile(userId as number);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Обновить профиль пользователя' })
  async updateProfile(@Body() updateUserDto: UpdateUserDto, @Request() req: Record<string, unknown>) {
    const userId = (req.user as Record<string, unknown>)?.sub;

    if (!userId) {
      return { message: 'Требуется авторизация' };
    }

    return this.usersService.updateProfile(userId as number, updateUserDto);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Получить адреса пользователя' })
  async getAddresses(@Request() req: Record<string, unknown>) {
    const userId = (req.user as Record<string, unknown>)?.sub;

    if (!userId) {
      return { message: 'Требуется авторизация' };
    }

    return this.usersService.getAddresses(userId as number);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Добавить адрес' })
  async addAddress(@Body() createAddressDto: CreateAddressDto, @Request() req: Record<string, unknown>) {
    const userId = (req.user as Record<string, unknown>)?.sub;

    if (!userId) {
      return { message: 'Требуется авторизация' };
    }

    return this.usersService.addAddress(userId as number, createAddressDto);
  }

  @Put('addresses/:id')
  @ApiOperation({ summary: 'Обновить адрес' })
  async updateAddress(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
    @Request() req: Record<string, unknown>
  ) {
    const userId = (req.user as Record<string, unknown>)?.sub;

    if (!userId) {
      return { message: 'Требуется авторизация' };
    }

    return this.usersService.updateAddress(id, userId as number, updateAddressDto);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Удалить адрес' })
  async deleteAddress(@Param('id', ParseIntPipe) id: number, @Request() req: Record<string, unknown>) {
    const userId = (req.user as Record<string, unknown>)?.sub;

    if (!userId) {
      return { message: 'Требуется авторизация' };
    }

    return this.usersService.deleteAddress(id, userId as number);
  }

  @Get('bonuses')
  @ApiOperation({ summary: 'Получить бонусный счёт' })
  async getBonuses(@Request() req: Record<string, unknown>) {
    const userId = (req.user as Record<string, unknown>)?.sub;

    if (!userId) {
      return { message: 'Требуется авторизация' };
    }

    return this.usersService.getBonuses(userId as number);
  }
}
