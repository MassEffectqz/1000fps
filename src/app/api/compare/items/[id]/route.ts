import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/compare/items/[id] - удалить товар из сравнения по ID элемента
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Находим элемент сравнения и проверяем принадлежность
    const comparisonItem = await prisma.comparisonItem.findUnique({
      where: { id },
      include: {
        comparison: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!comparisonItem) {
      return NextResponse.json(
        { error: 'Comparison item not found' },
        { status: 404 }
      );
    }

    if (comparisonItem.comparison.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Удаляем элемент
    await prisma.comparisonItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Item removed from comparison',
    });
  } catch (error) {
    console.error('Error removing from comparison:', error);
    return NextResponse.json(
      { error: 'Failed to remove from comparison' },
      { status: 500 }
    );
  }
}
