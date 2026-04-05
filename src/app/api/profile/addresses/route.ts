import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import { addressSchema } from '@/lib/validations/auth';

/**
 * GET /api/profile/addresses
 * Получить список адресов пользователя
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

    // Получаем адреса пользователя
    const addresses = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении адресов' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile/addresses
 * Добавить новый адрес
 *
 * Body: { name?, city, street, building, apartment?, postalCode?, phone?, isDefault? }
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
    const validation = addressSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      name,
      city,
      street,
      building,
      apartment,
      postalCode,
      phone,
      isDefault,
    } = validation.data;

    // Если адрес устанавливается как default, сбрасываем остальные
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Создаем адрес
    const address = await prisma.address.create({
      data: {
        userId: session.userId,
        name,
        city,
        street,
        building,
        apartment,
        postalCode,
        phone,
        isDefault,
      },
    });

    return NextResponse.json(
      {
        success: true,
        address,
        message: 'Адрес успешно добавлен',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании адреса' },
      { status: 500 }
    );
  }
}
