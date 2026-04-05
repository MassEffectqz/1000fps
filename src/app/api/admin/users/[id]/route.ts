import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateUserSchema } from '@/lib/validations/user';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// GET /api/admin/users/[id] - получить детали пользователя
// (защищено middleware — только ADMIN/MANAGER)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        level: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        // Адреса
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        // Заказы (с количеством)
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            total: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        // Отзывы
        reviews: {
          select: {
            id: true,
            rating: true,
            title: true,
            text: true,
            isApproved: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        // Конфигурации
        configs: {
          select: {
            id: true,
            name: true,
            isPreset: true,
            presetType: true,
            total: true,
            isPublic: true,
            shareCode: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        // Считаем количество заказов
        _count: {
          select: {
            orders: true,
            addresses: true,
            reviews: true,
            configs: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Не удалось получить данные пользователя' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - обновить пользователя
// (защищено middleware — только ADMIN/MANAGER)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    // Валидация входных данных
    const validatedData = updateUserSchema.parse(body);

    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Фильтруем undefined значения
    const updateData: Record<string, unknown> = {};
    
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }
    if (validatedData.phone !== undefined) {
      updateData.phone = validatedData.phone;
    }
    if (validatedData.role !== undefined) {
      updateData.role = validatedData.role;
    }
    if (validatedData.level !== undefined) {
      updateData.level = validatedData.level;
    }
    if (validatedData.emailVerified !== undefined) {
      updateData.emailVerified = validatedData.emailVerified;
    }
    if (validatedData.avatar !== undefined) {
      updateData.avatar = validatedData.avatar;
    }

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        level: true,
        emailVerified: true,
        updatedAt: true,
      },
    });

    // Реинвалидация кэша
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${id}`);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Не удалось обновить пользователя' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - удалить пользователя
// (защищено middleware — только ADMIN/MANAGER)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверка: нельзя удалить если есть заказы
    if (existingUser._count.orders > 0) {
      return NextResponse.json(
        { 
          error: 'Невозможно удалить пользователя с существующими заказами',
          ordersCount: existingUser._count.orders,
        },
        { status: 400 }
      );
    }

    // Удаляем пользователя (каскадно удалит все связанные записи)
    await prisma.user.delete({
      where: { id },
    });

    // Реинвалидация кэша
    revalidatePath('/admin/users');

    return NextResponse.json({ success: true, message: 'Пользователь удален' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить пользователя' },
      { status: 500 }
    );
  }
}
