/**
 * Parser Server для 1000FPS
 * Простой HTTP сервер для парсинга товаров
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const http = require('http');
const PORT = process.env.PARSER_PORT || 3005;
const PARSER_API_KEY = process.env.PARSER_API_KEY;
const APP_URL = process.env.APP_URL;

// Хранилище задач
const jobs = new Map();

// TTL для задач — 1 час (в мс)
const JOB_TTL_MS = 60 * 60 * 1000;

// Лимит размера тела запроса — 1MB
const MAX_BODY_SIZE = 1 * 1024 * 1024;

// Интервал очистки просроченных задач — каждые 10 минут
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

/**
 * Периодическая очистка просроченных задач
 */
function cleanupExpiredJobs() {
  const now = Date.now();
  let cleaned = 0;

  for (const [jobId, job] of jobs.entries()) {
    const createdAt = new Date(job.createdAt).getTime();
    if (now - createdAt > JOB_TTL_MS) {
      jobs.delete(jobId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[CLEANUP] Removed ${cleaned} expired jobs. Remaining: ${jobs.size}`);
  }
}

// Запускаем периодическую очистку
const cleanupTimer = setInterval(cleanupExpiredJobs, CLEANUP_INTERVAL_MS);
// Не даём таймеру мешать graceful shutdown
cleanupTimer.unref();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // CORS — ограничиваем конкретным origin
  const allowedOrigin = APP_URL || 'http://localhost:3000';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Key аутентификация (пропускаем только health check)
  if (url.pathname !== '/api/health' && PARSER_API_KEY) {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing API key. Provide x-api-key header.' }));
      return;
    }

    if (apiKey !== PARSER_API_KEY) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid API key.' }));
      return;
    }
  }

  // POST /api/parse - запустить парсинг
  if (url.pathname === '/api/parse' && req.method === 'POST') {
    let body = '';
    let bodySize = 0;

    req.on('data', chunk => {
      bodySize += chunk.length;
      if (bodySize > MAX_BODY_SIZE) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request body too large. Max size: 1MB' }));
        req.destroy();
        return;
      }
      body += chunk;
    });

    req.on('end', () => {
      // Проверяем, не был ли запрос прерван из-за превышения размера
      if (bodySize > MAX_BODY_SIZE) return;

      try {
        const data = JSON.parse(body);
        const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        jobs.set(jobId, {
          id: jobId,
          productId: data.productId,
          sources: data.sources || [],
          status: 'pending',
          createdAt: new Date().toISOString(),
          result: null,
        });

        // Запускаем парсинг в фоне
        processJob(jobId);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          jobId,
          estimatedTime: '30-60 секунд',
        }));
      } catch (err) {
        if (err instanceof SyntaxError) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON body' }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      }
    });
    return;
  }

  // GET /api/parse/:jobId - статус задачи
  if (url.pathname.startsWith('/api/parse/') && req.method === 'GET') {
    const jobId = url.pathname.split('/api/parse/')[1];
    const job = jobs.get(jobId);

    if (!job) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Job not found' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(job));
    return;
  }

  // GET /api/health - health check
  if (url.pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      jobsCount: jobs.size,
      uptime: process.uptime(),
    }));
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Обработка задачи
async function processJob(jobId) {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = 'processing';
  job.startedAt = new Date().toISOString();

  try {
    // TODO: Реальная логика парсинга
    // Сейчас просто имитируем задержку
    await new Promise(resolve => setTimeout(resolve, 5000));

    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    job.result = {
      price: Math.floor(Math.random() * 50000) + 10000,
      name: `Товар ${jobId}`,
      inStock: true,
    };
  } catch (err) {
    job.status = 'failed';
    job.error = err.message;
    job.completedAt = new Date().toISOString();
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Parser Server] Running on port ${PORT}`);
  console.log(`[Parser Server] Health: http://localhost:${PORT}/api/health`);
  console.log(`[Parser Server] CORS origin: ${APP_URL || 'http://localhost:3000'}`);
  console.log(`[Parser Server] Auth: ${PARSER_API_KEY ? 'enabled' : 'disabled (set PARSER_API_KEY)'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Parser Server] SIGTERM received, shutting down...');
  clearInterval(cleanupTimer);
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[Parser Server] SIGINT received, shutting down...');
  clearInterval(cleanupTimer);
  server.close(() => process.exit(0));
});
