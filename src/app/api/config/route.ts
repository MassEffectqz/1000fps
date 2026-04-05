import { NextResponse } from 'next/server';

// GET /api/config - конфигурация для Chrome extension парсера
export async function GET() {
  return NextResponse.json({
    ok: true,
    config: {
      backendUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002',
      syncInterval: 30000, // 30 секунд
      autoUpdateInterval: 7200000, // 2 часа
      version: '2.0',
    },
  });
}
