import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { usersQuerySchema } from '@/lib/validations/user';

// GET /api/admin/users - получить список пользователей с пагинацией
// (защищено middleware — только ADMIN/MANAGER)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Валидация query параметров
    const queryResult = usersQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      role: searchParams.get('role'),
      level: searchParams.get('level'),
      search: searchParams.get('search'),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Некорректные параметры запроса', details: queryResult.error.issues },
        { status: 400 }
      );
    }

    const { page, limit, role, level, search } = queryResult.data;
    const skip = (page - 1) * limit;

    // Формируем условие WHERE
    const where: Record<string, unknown> = {};

    // Фильтр по роли
    if (role) {
      where.role = role;
    }

    // Фильтр по уровню
    if (level) {
      where.level = level;
    }

    // Поиск по email, name, phone
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Получаем пользователей и общее количество
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          // Включаем количество адресов
          _count: {
            select: {
              addresses: true,
              orders: true,
            },
          },
          // Включаем сами адреса (кратко)
          addresses: {
            select: {
              id: true,
              city: true,
              street: true,
              building: true,
              isDefault: true,
            },
            take: 5,
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Не удалось получить список пользователей' },
      { status: 500 }
    );
  }
}
