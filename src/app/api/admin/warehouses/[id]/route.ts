import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { warehouseParamsSchema, updateWarehouseSchema } from '@/lib/validations/warehouse';
import { revalidatePath } from 'next/cache';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/warehouses/[id] - получить склад по ID
// (защищено middleware — только ADMIN/MANAGER)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Валидация параметров
    const validatedParams = warehouseParamsSchema.safeParse({ id });
    if (!validatedParams.success) {
      return NextResponse.json(
        { error: 'Некорректный ID склада', details: validatedParams.error.issues },
        { status: 400 }
      );
    }

    // Поиск склада
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
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

    if (!warehouse) {
      return NextResponse.json(
        { error: 'Склад не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(warehouse);
  } catch (error) {
    console.error('Error fetching warehouse by ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouse' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/warehouses/[id] - обновить склад
// (защищено middleware — только ADMIN/MANAGER)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Валидация параметров
    const validatedParams = warehouseParamsSchema.safeParse({ id });
    if (!validatedParams.success) {
      return NextResponse.json(
        { error: 'Некорректный ID склада', details: validatedParams.error.issues },
        { status: 400 }
      );
    }

    // Проверка существования склада
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { id },
    });

    if (!existingWarehouse) {
      return NextResponse.json(
        { error: 'Склад не найден' },
        { status: 404 }
      );
    }

    // Парсинг и валидация тела запроса
    const body = await request.json();
    const validatedData = updateWarehouseSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: validatedData.error.issues },
        { status: 400 }
      );
    }

    // Обновление склада
    const updatedWarehouse = await prisma.warehouse.update({
      where: { id },
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

    return NextResponse.json(updatedWarehouse);
  } catch (error) {
    console.error('Error updating warehouse:', error);
    return NextResponse.json(
      { error: 'Failed to update warehouse' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/warehouses/[id] - удалить склад
// (защищено middleware — только ADMIN/MANAGER)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Валидация параметров
    const validatedParams = warehouseParamsSchema.safeParse({ id });
    if (!validatedParams.success) {
      return NextResponse.json(
        { error: 'Некорректный ID склада', details: validatedParams.error.issues },
        { status: 400 }
      );
    }

    // Проверка существования склада
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        _count: {
          select: { stock: true },
        },
      },
    });

    if (!existingWarehouse) {
      return NextResponse.json(
        { error: 'Склад не найден' },
        { status: 404 }
      );
    }

    // Проверка на наличие товаров на складе (безопасная проверка)
    const stockCount = existingWarehouse._count?.stock ?? 0;
    if (stockCount > 0) {
      return NextResponse.json(
        {
          error: 'Невозможно удалить склад с товарами',
          details: {
            stockCount,
            message: 'Сначала удалите все товары со склада'
          }
        },
        { status: 400 }
      );
    }

    // Удаление склада
    await prisma.warehouse.delete({
      where: { id },
    });

    // Рекейдинг кэша
    revalidatePath('/admin/warehouses');

    return NextResponse.json({
      success: true,
      message: 'Склад успешно удалён',
    });
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    return NextResponse.json(
      { error: 'Failed to delete warehouse' },
      { status: 500 }
    );
  }
}
