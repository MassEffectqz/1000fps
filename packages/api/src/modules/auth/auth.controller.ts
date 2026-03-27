import { Controller, Post, Body, Get, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Получить профиль пользователя' })
  @ApiBearerAuth()
  async me(@Request() req: Record<string, unknown>) {
    const userId = (req.user as { sub: number })?.sub;
    return this.authService.me(userId);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Выход' })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async logout() {
    return this.authService.logout();
  }
}
