import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfiguratorService } from './configurator.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { CheckCompatibilityDto } from './dto/check-compatibility.dto';
import { AuthGuard } from '@nestjs/passport';
import { ConfigOwnerGuard } from './guards/config-owner.guard';

@ApiTags('configurator')
@ApiBearerAuth()
@Controller('configurator')
export class ConfiguratorController {
  constructor(private readonly configuratorService: ConfiguratorService) {}

  @Get('parts/:type')
  @ApiOperation({ summary: 'Получить компоненты по типу' })
  async getPartsByType(@Param('type') type: string) {
    return this.configuratorService.getPartsByType(type);
  }

  @Post('compatibility')
  @ApiOperation({ summary: 'Проверить совместимость' })
  @UseGuards(AuthGuard('jwt'))
  async checkCompatibility(@Body() data: CheckCompatibilityDto) {
    return this.configuratorService.checkCompatibility(data.parts);
  }

  @Get('configs')
  @ApiOperation({ summary: 'Мои сборки' })
  @UseGuards(AuthGuard('jwt'))
  async getConfigs(@Request() req: Record<string, unknown>) {
    return this.configuratorService.getConfigs((req.user as Record<string, unknown>).sub as number);
  }

  @Get('configs/:id')
  @ApiOperation({ summary: 'Получить сборку по ID' })
  @UseGuards(AuthGuard('jwt'), ConfigOwnerGuard)
  async getConfig(@Param('id', ParseIntPipe) id: number, @Request() req: Record<string, unknown>) {
    return this.configuratorService.getConfig(id, (req.user as Record<string, unknown>).sub as number);
  }

  @Post('configs')
  @ApiOperation({ summary: 'Создать сборку' })
  @UseGuards(AuthGuard('jwt'))
  async createConfig(@Body() data: CreateConfigDto, @Request() req: Record<string, unknown>) {
    return this.configuratorService.createConfig((req.user as Record<string, unknown>).sub as number, data);
  }

  @Put('configs/:id')
  @ApiOperation({ summary: 'Обновить сборку' })
  @UseGuards(AuthGuard('jwt'), ConfigOwnerGuard)
  async updateConfig(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateConfigDto,
    @Request() req: Record<string, unknown>
  ) {
    return this.configuratorService.updateConfig(id, (req.user as Record<string, unknown>).sub as number, data);
  }

  @Delete('configs/:id')
  @ApiOperation({ summary: 'Удалить сборку' })
  @UseGuards(AuthGuard('jwt'), ConfigOwnerGuard)
  async deleteConfig(@Param('id', ParseIntPipe) id: number, @Request() req: Record<string, unknown>) {
    return this.configuratorService.deleteConfig(id, (req.user as Record<string, unknown>).sub as number);
  }

  @Post('configs/:id/add-to-cart')
  @ApiOperation({ summary: 'Добавить сборку в корзину' })
  @UseGuards(AuthGuard('jwt'), ConfigOwnerGuard)
  async addToCart(@Param('id', ParseIntPipe) id: number, @Request() req: Record<string, unknown>) {
    return this.configuratorService.addToCart(id, (req.user as Record<string, unknown>).sub as number);
  }
}
