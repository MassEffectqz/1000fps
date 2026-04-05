import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const isDocker = process.env.NODE_ENV === 'production' || process.env.DOCKER;
const PARSER_URL = process.env.PARSER_URL || (isDocker ? 'http://parser:3005' : 'http://localhost:3005');

// CORS заголовки
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS handler для CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// POST /api/admin/parser/parse - запустить парсинг для товара
// (защищено middleware — только ADMIN/MANAGER)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, sources } = body;

    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      return NextResponse.json(
        { error: 'sources должен быть массивом ссылок/артикулов' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Создаём задачу в БД
    const parseJob = await prisma.parseJob.create({
      data: {
        productId,
        sources,
        status: 'PENDING',
      },
    });

    // Отправляем запрос на сервер парсинга
    const response = await fetch(`${PARSER_URL}/api/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, sources }),
    });

    if (!response.ok) {
      const error = await response.json();
      await prisma.parseJob.update({
        where: { id: parseJob.id },
        data: { status: 'FAILED', error: error.error },
      });

      return NextResponse.json(
        { error: error.error || 'Ошибка парсинга' },
        { status: response.status, headers: corsHeaders }
      );
    }

    const result = await response.json();

    // Обновляем задачу jobId с сервера
    await prisma.parseJob.update({
      where: { id: parseJob.id },
      data: { jobId: result.jobId },
    });

    return NextResponse.json({
      success: true,
      jobId: parseJob.id,
      serverJobId: result.jobId,
      message: 'Парсинг запущен',
      estimatedTime: result.estimatedTime,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error starting parse job:', error);
    const isNetworkError = error instanceof TypeError && (error as Error & { cause?: { code?: string } }).cause?.code === 'ECONNREFUSED';
    return NextResponse.json(
      {
        error: isNetworkError
          ? 'Сервер парсинга не запущен. Запустите parser сервер на порту 3005'
          : 'Failed to start parse job',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
