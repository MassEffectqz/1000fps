import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class ConfigOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.sub;
    const configId = request.params.id;

    if (!configId) {
      return true; // Для создания новой сборки проверка не нужна
    }

    const config = await this.prisma.config.findUnique({
      where: { id: +configId },
    });

    if (!config) {
      throw new NotFoundException('Сборка не найдена');
    }

    if (config.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этой сборке');
    }

    return true;
  }
}
