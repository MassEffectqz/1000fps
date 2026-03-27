import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phone } = registerDto;

    // Проверка существующего пользователя
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('Email уже зарегистрирован');
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создание пользователя
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        bonusPoints: true,
        loyaltyLevel: true,
      },
    });

    // Создание корзины
    await this.prisma.cart.create({
      data: {
        userId: user.id,
        totalPrice: 0,
      },
    });

    // Создание вишлиста
    await this.prisma.wishlist.create({
      data: { userId: user.id },
    });

    const tokens = await this.getTokens(user.id, user.email);

    return { ...user, ...tokens };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Поиск пользователя
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Неверный email или пароль');
    }

    // Проверка пароля
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Неверный email или пароль');
    }

    const tokens = await this.getTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        bonusPoints: user.bonusPoints,
        loyaltyLevel: user.loyaltyLevel,
      },
      ...tokens,
    };
  }

  async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, email }, { expiresIn: '2h' }),
      this.jwtService.signAsync({ sub: userId, email }, { expiresIn: '30d' }),
    ]);

    return { accessToken, refreshToken };
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        bonusPoints: true,
        loyaltyLevel: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    return user;
  }

  async logout() {
    // В production здесь можно добавить логику blacklist для токена
    return { message: 'Успешный выход' };
  }
}
