import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/admin/parser/jobs/[jobId] - получить статус задачи
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  try {
    // Получаем задачу из БД
    const job = await prisma.parseJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Задача не найдена' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Если задача ещё не завершена, проверяем актуальный статус
    if (job.status === 'PENDING' || job.status === 'PROCESSING') {
      // Пытаемся получить обновлённый статус
      // (если есть внешний парсер — опрашиваем его)
      try {
        const PARSER_URL = process.env.PARSER_URL;
        if (PARSER_URL && job.jobId) {
          const response = await fetch(`${PARSER_URL}/api/parse/${job.jobId}`, {
            signal: AbortSignal.timeout(5000),
          });

          if (response.ok) {
            const parseResult = await response.json();

            // Обновляем задачу в БД
            const updateData: Record<string, unknown> = {};

            // Маппинг статусов: lowercase → UPPERCASE для Prisma
            const statusMap: Record<string, string> = {
              pending: 'PENDING',
              processing: 'PROCESSING',
              completed: 'COMPLETED',
              failed: 'FAILED',
            };

            if (parseResult.status) {
              updateData.status = statusMap[parseResult.status.toLowerCase()] || parseResult.status;
            }

            if (parseResult.result) {
              // Сохраняем результат с processedCount для прогресса
              const result = parseResult.result;
              const processedCount = Array.isArray(result)
                ? result.length
                : (result as { processedCount?: number })?.processedCount || 0;

              updateData.result = {
                ...(typeof result === 'object' ? result : {}),
                processedCount,
              } as Prisma.InputJsonValue;
            }

            if (parseResult.completedAt) {
              updateData.completedAt = new Date(parseResult.completedAt);
            }

            if (Object.keys(updateData).length > 0) {
              await prisma.parseJob.update({
                where: { id: jobId },
                data: updateData,
              });

              // Возвращаем обновлённые данные
              return NextResponse.json({
                jobId: job.jobId,
                status: updateData.status || job.status,
                sources: job.sources,
                result: updateData.result || job.result,
                completedAt: updateData.completedAt || job.completedAt,
                error: job.error,
                // Добавляем прогресс для UI
                progress: updateData.result
                  ? {
                      processed: (updateData.result as { processedCount?: number })?.processedCount || 0,
                      total: job.sources?.length || 0,
                    }
                  : null,
              }, { headers: corsHeaders });
            }
          }
        }
      } catch {
        // Игнорируем ошибки внешнего парсера — возвращаем данные из БД
      }
    }

    // Формируем ответ с прогрессом
    const result = job.result as { processedCount?: number } | null;
    const processedCount = result?.processedCount || 0;
    const totalSources = job.sources?.length || 0;

    return NextResponse.json({
      jobId: job.jobId,
      status: job.status,
      sources: job.sources,
      result: job.result,
      completedAt: job.completedAt,
      error: job.error,
      createdAt: job.createdAt,
      // Прогресс для UI
      progress: job.status === 'PROCESSING' || job.status === 'PENDING'
        ? { processed: processedCount, total: totalSources }
        : job.status === 'COMPLETED'
          ? { processed: totalSources, total: totalSources }
          : null,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching parse job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parse job' },
      { status: 500, headers: corsHeaders }
    );
  }
}
