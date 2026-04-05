import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createWarehouseSchema, warehouseQuerySchema } from '@/lib/validations/warehouse';
import { revalidatePath } from 'next/cache';

// GET /api/admin/warehouses - получить все склады с пагинацией и фильтрацией
// (защищено middleware — только ADMIN/MANAGER)
export async function GET(request: NextRequest) {
  try {
    // Парсинг query параметров
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validatedQuery = warehouseQuerySchema.safeParse(queryParams);
    
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: 'Некорректные параметры запроса', details: validatedQuery.error.issues },
        { status: 400 }
      );
    }

    const { page, limit, city, isActive, search } = validatedQuery.data;

    // Построение условия фильтрации
    const where: Record<string, unknown> = {};

    if (city !== undefined) {
      where.city = city;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (where as any).OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Получение общего количества
    const total = await prisma.warehouse.count({ where });

    // Получение складов с пагинацией
    const warehouses = await prisma.warehouse.findMany({
      where,
      include: {
        stock: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        _count: {
          select: { stock: true },
        },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      warehouses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouses' },
      { status: 500 }
    );
  }
}

// POST /api/admin/warehouses - создать склад
// (защищено middleware — только ADMIN/MANAGER)
export async function POST(request: NextRequest) {
  try {
    // Парсинг и валидация тела запроса
    const body = await request.json();
    const validatedData = createWarehouseSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: validatedData.error.issues },
        { status: 400 }
      );
    }

    // Создание склада
    const warehouse = await prisma.warehouse.create({
      data: validatedData.data,
      include: {
        stock: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        _count: {
          select: { stock: true },
        },
      },
    });

    // Рекейдинг кэша
    revalidatePath('/admin/warehouses');

    return NextResponse.json(warehouse, { status: 201 });
  } catch (error) {
    console.error('Error creating warehouse:', error);
    return NextResponse.json(
      { error: 'Failed to create warehouse' },
      { status: 500 }
    );
  }
}
