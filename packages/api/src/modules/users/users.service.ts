import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить профиль пользователя
   */
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        bonusPoints: true,
        loyaltyLevel: true,
        createdAt: true,
        addresses: true,
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              take: 2,
              include: {
                product: {
                  include: { images: true },
                },
              },
            },
          },
        },
        configs: {
          take: 5,
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return { user };
  }

  /**
   * Обновить профиль пользователя
   */
  async updateProfile(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        bonusPoints: true,
        loyaltyLevel: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return { user };
  }

  /**
   * Получить адреса пользователя
   */
  async getAddresses(userId: number) {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return { addresses };
  }

  /**
   * Добавить адрес
   */
  async addAddress(userId: number, createAddressDto: CreateAddressDto) {
    // Если адрес по умолчанию, сбросим у других
    if (createAddressDto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.address.create({
      data: {
        ...createAddressDto,
        userId,
      },
    });

    return { address };
  }

  /**
   * Обновить адрес
   */
  async updateAddress(id: number, userId: number, updateAddressDto: UpdateAddressDto) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException('Адрес не найден');
    }

    if (address.userId !== userId) {
      throw new NotFoundException('Нет доступа к этому адресу');
    }

    // Если адрес по умолчанию, сбросим у других
    if (updateAddressDto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await this.prisma.address.update({
      where: { id },
      data: updateAddressDto,
    });

    return { address: updatedAddress };
  }

  /**
   * Удалить адрес
   */
  async deleteAddress(id: number, userId: number) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException('Адрес не найден');
    }

    if (address.userId !== userId) {
      throw new NotFoundException('Нет доступа к этому адресу');
    }

    await this.prisma.address.delete({
      where: { id },
    });

    return { message: 'Адрес удалён' };
  }

  /**
   * Получить бонусный счёт
   */
  async getBonuses(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        bonusPoints: true,
        loyaltyLevel: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return {
      bonusPoints: user.bonusPoints,
      loyaltyLevel: user.loyaltyLevel,
      nextLevel: this.getNextLevel(user.loyaltyLevel),
    };
  }

  /**
   * Следующий уровень лояльности
   */
  private getNextLevel(currentLevel: string): string {
    const levels = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
    const currentIndex = levels.indexOf(currentLevel);

    if (currentIndex < levels.length - 1) {
      return levels[currentIndex + 1];
    }

    return 'PLATINUM';
  }
}
