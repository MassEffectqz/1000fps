import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import { configurationSchema } from '@/lib/validations/auth';
import crypto from 'crypto';

/**
 * GET /api/profile/configs
 * Получить список сборок пользователя
 */
export async function GET(request: NextRequest) {
  try {
    // Получаем токен из cookies
    const token = request.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Требуется аутентификация' },
        { status: 401 }
      );
    }

    // Проверяем сессию
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Невалидная сессия' },
        { status: 401 }
      );
    }

    // Получаем сборки пользователя
    const configs = await prisma.configuration.findMany({
      where: { userId: session.userId },
      include: {
        items: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      configs,
    });
  } catch (error) {
    console.error('Get configs error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении сборок' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile/configs
 * Сохранить новую сборку
 *
 * Body: { name?, isPreset?, presetType?, total, power, isPublic?, items: [{ categoryId, productId, quantity, price }] }
 */
export async function POST(request: NextRequest) {
  try {
    // Получаем токен из cookies
    const token = request.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Требуется аутентификация' },
        { status: 401 }
      );
    }

    // Проверяем сессию
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Невалидная сессия' },
        { status: 401 }
      );
    }

    // Получаем и валидируем тело запроса
    const body = await request.json();
    const validation = configurationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      name,
      isPreset,
      presetType,
      total,
      power,
      isPublic,
      items,
    } = validation.data;

    // Генерируем уникальный код для шаринга (если публичная)
    const shareCode = isPublic
      ? crypto.randomBytes(6).toString('hex').toUpperCase()
      : null;

    // Создаем сборку
    const config = await prisma.configuration.create({
      data: {
        userId: session.userId,
        name: name || `Сборка ${new Date().toLocaleDateString('ru-RU')}`,
        isPreset: isPreset || false,
        presetType,
        total,
        power,
        isPublic: isPublic || false,
        shareCode,
        items: {
          create: items.map((item) => ({
            categoryId: item.categoryId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        config,
        message: 'Сборка успешно сохранена',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create config error:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании сборки' },
      { status: 500 }
    );
  }
}
