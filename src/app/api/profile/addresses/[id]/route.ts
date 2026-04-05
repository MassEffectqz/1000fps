import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import { addressSchema } from '@/lib/validations/auth';

/**
 * PUT /api/profile/addresses/[id]
 * Обновить адрес пользователя
 *
 * Body: { name?, city?, street?, building?, apartment?, postalCode?, phone?, isDefault? }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Получаем ID адреса
    const { id } = await params;

    // Проверяем, принадлежит ли адрес пользователю
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Адрес не найден' },
        { status: 404 }
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
        where: { userId: session.userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    // Обновляем адрес
    const address = await prisma.address.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(city !== undefined && { city }),
        ...(street !== undefined && { street }),
        ...(building !== undefined && { building }),
        ...(apartment !== undefined && { apartment }),
        ...(postalCode !== undefined && { postalCode }),
        ...(phone !== undefined && { phone }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return NextResponse.json({
      success: true,
      address,
      message: 'Адрес успешно обновлен',
    });
  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении адреса' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/addresses/[id]
 * Удалить адрес пользователя
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Получаем ID адреса
    const { id } = await params;

    // Проверяем, принадлежит ли адрес пользователю
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Адрес не найден' },
        { status: 404 }
      );
    }

    // Не позволяем удалить последний адрес
    const addressCount = await prisma.address.count({
      where: { userId: session.userId },
    });

    if (addressCount <= 1) {
      return NextResponse.json(
        { error: 'Нельзя удалить последний адрес' },
        { status: 400 }
      );
    }

    // Удаляем адрес
    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Адрес успешно удален',
    });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении адреса' },
      { status: 500 }
    );
  }
}
