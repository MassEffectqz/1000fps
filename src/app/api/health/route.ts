import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Health check endpoint
 * 
 * GET /api/health
 * 
 * Returns application health status including:
 * - Application status
 * - Database connection status
 * - Uptime
 * - Timestamp
 * 
 * Used by Docker health checks and load balancers.
 */
export async function GET() {
  const startTime = Date.now();
  
  // Проверка подключения к базе данных
  let dbStatus = 'unknown';
  let dbLatency = null;
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
    dbLatency = Date.now() - startTime;
  } catch (error) {
    dbStatus = 'disconnected';
    console.error('Database health check failed:', error);
  }

  // Определение общего статуса
  const isHealthy = dbStatus === 'connected';
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: {
          status: dbStatus,
          latency: dbLatency ? `${dbLatency}ms` : null,
        },
      },
      version: process.env.npm_package_version || 'unknown',
      nodeVersion: process.version,
    },
    { status: statusCode }
  );
}
