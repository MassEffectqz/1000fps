import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConfiguratorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить компоненты по типу
   */
  async getPartsByType(type: string) {
    try {
      const partType = await this.prisma.partType.findUnique({
        where: { id: type },
      });

      if (!partType) {
        throw new NotFoundException('Тип компонента не найден');
      }

      const products = await this.prisma.product.findMany({
        where: {
          compatRules: {
            some: {
              partTypeId: type,
            },
          },
          available: true,
        },
        include: {
          brand: true,
          category: true,
          images: true,
        },
      });

      return { data: products, partType };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(`Ошибка БД: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Проверить совместимость
   */
  async checkCompatibility(parts: Record<string, number>) {
    const issues: Array<{ partType: string; message: string; severity: string }> = [];
    const warnings: Array<{ partType: string; message: string; severity: string }> = [];

    try {
      // Проверка совместимости CPU и Motherboard
      if (parts.cpu && parts.motherboard) {
        const [cpu, motherboard] = await Promise.all([
          this.prisma.product.findUnique({
            where: { id: parts.cpu },
            include: { compatRules: true },
          }),
          this.prisma.product.findUnique({
            where: { id: parts.motherboard },
            include: { compatRules: true },
          }),
        ]);

        if (cpu && motherboard) {
          const cpuSocket = (cpu.specifications as Record<string, unknown>)?.socket as string | undefined;
          const moboSocket = (motherboard.specifications as Record<string, unknown>)?.socket as string | undefined;

          if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
            issues.push({
              partType: 'cpu',
              message: `Несовместимый сокет: CPU ${cpuSocket}, Motherboard ${moboSocket}`,
              severity: 'error',
            });
          }
        }
      }

      // Проверка PSU мощности
      if (parts.psu && (parts.cpu || parts.gpu)) {
        const [psu, requiredWattage] = await Promise.all([
          this.prisma.product.findUnique({
            where: { id: parts.psu },
          }),
          this.calculateRequiredWattage(parts),
        ]);

        const psuWattage = Number((psu?.specifications as Record<string, unknown>)?.wattage) || 0;

        if (psuWattage < requiredWattage) {
          warnings.push({
            partType: 'psu',
            message: `Рекомендуется БП мощностью от ${requiredWattage}W`,
            severity: 'warning',
          });
        }
      }

      return {
        isCompatible: issues.length === 0,
        issues,
        warnings,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(`Ошибка при проверке совместимости: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Получить сборки пользователя
   */
  async getConfigs(userId: number) {
    try {
      const configs = await this.prisma.config.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { brand: true, category: true, images: true },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return { configs };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(`Ошибка при получении сборок: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Получить сборку по ID
   */
  async getConfig(id: number, userId: number) {
    try {
      const config = await this.prisma.config.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                include: { brand: true, category: true, images: true },
              },
            },
          },
        },
      });

      if (!config) {
        throw new NotFoundException('Сборка не найдена');
      }

      if (config.userId !== userId) {
        throw new ConflictException('Нет доступа к этой сборке');
      }

      return config;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(`Ошибка при получении сборки: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Создать сборку
   */
  async createConfig(userId: number, data: { name?: string; parts: Record<string, number> }) {
    try {
      const { name, parts } = data;

      // Проверка наличия продуктов
      const productIds = Object.values(parts);
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new NotFoundException('Один или несколько продуктов не найдены');
      }

      // Подсчёт стоимости
      let totalPrice = 0;
      const configItems: Array<{ partType: string; productId: number; price: number }> = [];

      for (const [partType, productId] of Object.entries(parts)) {
        const product = products.find((p) => p.id === productId);
        if (product) {
          totalPrice += Number(product.price);
          configItems.push({
            partType,
            productId,
            price: Number(product.price),
          });
        }
      }

      const config = await this.prisma.config.create({
        data: {
          userId,
          name: name || 'Моя сборка',
          totalPrice,
          items: {
            create: configItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: { brand: true, category: true, images: true },
              },
            },
          },
        },
      });

      return config;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(`Ошибка при создании сборки: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Обновить сборку
   */
  async updateConfig(
    id: number,
    userId: number,
    data: { name?: string; parts?: Record<string, number> }
  ) {
    try {
      const config = await this.prisma.config.findUnique({
        where: { id },
      });

      if (!config) {
        throw new NotFoundException('Сборка не найдена');
      }

      if (config.userId !== userId) {
        throw new ConflictException('Нет доступа к этой сборке');
      }

      // Обновление названия
      if (data.name) {
        await this.prisma.config.update({
          where: { id },
          data: { name: data.name },
        });
      }

      // Обновление компонентов
      if (data.parts) {
        await this.prisma.$transaction(async (tx) => {
          // Удалить старые компоненты
          await tx.configItem.deleteMany({
            where: { configId: id },
          });

          // Проверка наличия продуктов
          const productIds = Object.values(data.parts ?? {});
          const products = await tx.product.findMany({
            where: { id: { in: productIds } },
          });

          if (products.length !== productIds.length) {
            throw new NotFoundException('Один или несколько продуктов не найдены');
          }

          // Создать новые
          let totalPrice = 0;
          for (const [partType, productId] of Object.entries(data.parts ?? {})) {
            const product = products.find((p) => p.id === productId);
            if (product) {
              totalPrice += Number(product.price);
              await tx.configItem.create({
                data: {
                  configId: id,
                  partType,
                  productId,
                  price: Number(product.price),
                },
              });
            }
          }

          // Обновить общую стоимость
          await tx.config.update({
            where: { id },
            data: { totalPrice },
          });
        });
      }

      // Получить обновлённую сборку
      return this.prisma.config.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                include: { brand: true, category: true, images: true },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(`Ошибка при обновлении сборки: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Удалить сборку
   */
  async deleteConfig(id: number, userId: number) {
    try {
      const config = await this.prisma.config.findUnique({
        where: { id },
      });

      if (!config) {
        throw new NotFoundException('Сборка не найдена');
      }

      if (config.userId !== userId) {
        throw new ConflictException('Нет доступа к этой сборке');
      }

      await this.prisma.config.delete({
        where: { id },
      });

      return { message: 'Сборка удалена' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(`Ошибка при удалении сборки: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Добавить сборку в корзину
   */
  async addToCart(configId: number, userId: number) {
    try {
      const config = await this.prisma.config.findUnique({
        where: { id: configId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!config) {
        throw new NotFoundException('Сборка не найдена');
      }

      if (config.userId !== userId) {
        throw new ConflictException('Нет доступа к этой сборке');
      }

      // Найти или создать корзину
      let cart = await this.prisma.cart.findFirst({
        where: { userId },
      });

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: { userId, totalPrice: 0 },
        });
      }

      // Добавить все компоненты в корзину
      for (const item of config.items) {
        const existingItem = await this.prisma.cartItem.findUnique({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId: item.productId,
            },
          },
        });

        if (existingItem) {
          await this.prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: { increment: 1 } },
          });
        } else {
          await this.prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: item.productId,
              quantity: 1,
              price: item.price,
            },
          });
        }
      }

      // Пересчитать общую стоимость
      const cartItems = await this.prisma.cartItem.findMany({
        where: { cartId: cart.id },
        include: { product: true },
      });

      const totalPrice = cartItems.reduce((sum, item) => {
        return sum + Number(item.price) * item.quantity;
      }, 0);

      await this.prisma.cart.update({
        where: { id: cart.id },
        data: { totalPrice },
      });

      return { message: 'Сборка добавлена в корзину', cart };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(`Ошибка при добавлении в корзину: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Расчёт требуемой мощности БП
   */
  private async calculateRequiredWattage(parts: Record<string, number>): Promise<number> {
    let total = 100; // Базовое потребление

    if (parts.cpu) {
      const cpu = await this.prisma.product.findUnique({ where: { id: parts.cpu } });
      total += Number((cpu?.specifications as Record<string, unknown>)?.tdp as number) || 65;
    }

    if (parts.gpu) {
      const gpu = await this.prisma.product.findUnique({ where: { id: parts.gpu } });
      total += Number((gpu?.specifications as Record<string, unknown>)?.tdp as number) || 150;
    }

    return total + 50; // Запас 50W
  }
}
