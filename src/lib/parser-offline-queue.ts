/**
 * Offline Parser Queue
 * 
 * Сохраняет задачи парсинга в localStorage когда extension недоступен,
 * и автоматически retry при восстановлении подключения.
 */

interface PendingParseTask {
  id: string;
  sources: string[];
  productId?: string;
  createdAt: number;
  retries: number;
  lastError?: string;
}

const STORAGE_KEY = 'wb_parser_offline_queue';
const MAX_RETRIES = 3;
const RETRY_INTERVAL_MS = 30_000; // 30 секунд
const TASK_TTL_MS = 24 * 60 * 60 * 1000; // 24 часа

// ==================== QUEUE MANAGEMENT ====================

function getQueue(): PendingParseTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Фильтруем протухшие задачи
    const now = Date.now();
    return parsed.filter(task => now - task.createdAt < TASK_TTL_MS);
  } catch {
    return [];
  }
}

function saveQueue(queue: PendingParseTask[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    console.warn('[OfflineQueue] Failed to save queue');
  }
}

// ==================== PUBLIC API ====================

/**
 * Добавить задачу в offline очередь
 */
export function enqueueParseTask(sources: string[], productId?: string): string {
  const task: PendingParseTask = {
    id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    sources,
    productId,
    createdAt: Date.now(),
    retries: 0,
  };

  const queue = getQueue();
  queue.push(task);
  saveQueue(queue);

  console.log('[OfflineQueue] Task enqueued:', task.id, { sources: sources.length });
  return task.id;
}

/**
 * Проверить есть ли задачи в очереди
 */
export function hasPendingTasks(): boolean {
  return getQueue().length > 0;
}

/**
 * Получить количество pending задач
 */
export function getPendingCount(): number {
  return getQueue().length;
}

/**
 * Получить все pending задачи
 */
export function getPendingTasks(): PendingParseTask[] {
  return getQueue();
}

/**
 * Удалить задачу из очереди
 */
export function dequeueTask(taskId: string): boolean {
  const queue = getQueue();
  const filtered = queue.filter(t => t.id !== taskId);
  if (filtered.length < queue.length) {
    saveQueue(filtered);
    return true;
  }
  return false;
}

/**
 * Увеличить счётчик retry для задачи
 */
export function incrementRetry(taskId: string, error?: string): boolean {
  const queue = getQueue();
  const task = queue.find(t => t.id === taskId);
  if (!task) return false;

  task.retries++;
  task.lastError = error;

  if (task.retries >= MAX_RETRIES) {
    // Удаляем задачу если превышены максимальные retry
    const filtered = queue.filter(t => t.id !== taskId);
    saveQueue(filtered);
    console.log('[OfflineQueue] Task removed after max retries:', taskId);
    return false;
  }

  saveQueue(queue);
  console.log('[OfflineQueue] Task retry incremented:', taskId, `(${task.retries}/${MAX_RETRIES})`);
  return true;
}

/**
 * Получить oldest задачу для retry
 */
export function getNextRetryTask(): PendingParseTask | null {
  const queue = getQueue();
  if (queue.length === 0) return null;

  // Возвращаем самую старую задачу
  return queue.sort((a, b) => a.createdAt - b.createdAt)[0];
}

/**
 * Очистить всю очередь
 */
export function clearQueue(): void {
  saveQueue([]);
  console.log('[OfflineQueue] Queue cleared');
}

/**
 * Получить информацию об очереди
 */
export function getQueueInfo(): {
  pending: number;
  oldestTask: number | null;
  canRetry: boolean;
} {
  const queue = getQueue();
  const oldestTask = queue.length > 0
    ? Math.min(...queue.map(t => t.createdAt))
    : null;

  return {
    pending: queue.length,
    oldestTask,
    canRetry: queue.length > 0 && queue.some(t => t.retries < MAX_RETRIES),
  };
}

// ==================== AUTO-RETRY ====================

let retryInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Запустить автоматический retry pending задач
 * Вызывается из app при монтировании
 */
export function startAutoRetry(
  onTaskReady: (task: PendingParseTask) => void
): void {
  if (retryInterval) return;

  retryInterval = setInterval(() => {
    const task = getNextRetryTask();
    if (task && task.retries < MAX_RETRIES) {
      console.log('[OfflineQueue] Auto-retry task:', task.id);
      onTaskReady(task);
    }
  }, RETRY_INTERVAL_MS);

  console.log('[OfflineQueue] Auto-retry started');
}

/**
 * Остановить автоматический retry
 */
export function stopAutoRetry(): void {
  if (retryInterval) {
    clearInterval(retryInterval);
    retryInterval = null;
    console.log('[OfflineQueue] Auto-retry stopped');
  }
}

/**
 * Запустить retry для конкретной задачи
 */
export function retryTask(task: PendingParseTask, onParse: (sources: string[], productId?: string) => void): void {
  if (task.retries >= MAX_RETRIES) {
    console.log('[OfflineQueue] Task exceeded max retries, skipping:', task.id);
    dequeueTask(task.id);
    return;
  }

  console.log('[OfflineQueue] Retrying task:', task.id, `(${task.retries + 1}/${MAX_RETRIES})`);
  incrementRetry(task.id);
  onParse(task.sources, task.productId);
}

/**
 * Очистить старые failed задачи при монтировании
 */
export function cleanupStaleTasks(): { count: number } {
  const queue = getQueue();
  const now = Date.now();
  const cleaned = queue.filter(task => {
    // Удаляем задачи старше 24 часов
    return now - task.createdAt < TASK_TTL_MS;
  });

  if (cleaned.length < queue.length) {
    saveQueue(cleaned);
    console.log('[OfflineQueue] Cleaned up', queue.length - cleaned.length, 'stale tasks');
  }

  return { count: cleaned.length };
}
