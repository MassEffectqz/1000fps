/**
 * Unit тесты для Offline Parser Queue
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  enqueueParseTask,
  dequeueTask,
  incrementRetry,
  getNextRetryTask,
  getPendingCount,
  getPendingTasks,
  hasPendingTasks,
  clearQueue,
  retryTask,
  startAutoRetry,
  stopAutoRetry,
  getQueueInfo,
  cleanupStaleTasks,
} from '@/lib/parser-offline-queue';

// Мокаем localStorage (jsdom его не предоставляет полностью)
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('parser-offline-queue', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
    stopAutoRetry();
  });

  afterEach(() => {
    vi.useRealTimers();
    stopAutoRetry();
  });

  describe('enqueueParseTask', () => {
    it('должен добавить задачу в очередь', () => {
      const taskId = enqueueParseTask(['https://example.com/1']);
      expect(taskId).toBeDefined();
      expect(typeof taskId).toBe('string');
      expect(taskId.startsWith('offline_')).toBe(true);
      expect(getPendingCount()).toBe(1);
    });

    it('должен добавить задачу с productId', () => {
      enqueueParseTask(['https://example.com/1'], 'prod_123');
      const tasks = getPendingTasks();
      expect(tasks[0].productId).toBe('prod_123');
    });

    it('должен добавить несколько задач', () => {
      enqueueParseTask(['https://example.com/1']);
      enqueueParseTask(['https://example.com/2']);
      enqueueParseTask(['https://example.com/3']);
      expect(getPendingCount()).toBe(3);
    });

    it('должен инициализировать retries = 0', () => {
      enqueueParseTask(['https://example.com/1']);
      const tasks = getPendingTasks();
      expect(tasks[0].retries).toBe(0);
    });
  });

  describe('dequeueTask', () => {
    it('должен удалить задачу по ID', () => {
      const taskId = enqueueParseTask(['https://example.com/1']);
      const result = dequeueTask(taskId);
      expect(result).toBe(true);
      expect(getPendingCount()).toBe(0);
    });

    it('должен вернуть false если задача не найдена', () => {
      const result = dequeueTask('nonexistent');
      expect(result).toBe(false);
    });

    it('должен удалить только одну задачу', () => {
      const id1 = enqueueParseTask(['https://example.com/1']);
      enqueueParseTask(['https://example.com/2']);
      dequeueTask(id1);
      expect(getPendingCount()).toBe(1);
    });
  });

  describe('incrementRetry', () => {
    it('должен увеличить retry счётчик', () => {
      const taskId = enqueueParseTask(['https://example.com/1']);
      const result = incrementRetry(taskId, 'Error 1');
      expect(result).toBe(true);
      const tasks = getPendingTasks();
      expect(tasks[0].retries).toBe(1);
      expect(tasks[0].lastError).toBe('Error 1');
    });

    it('должен удалить задачу при достижении MAX_RETRIES (3)', () => {
      const taskId = enqueueParseTask(['https://example.com/1']);
      incrementRetry(taskId, 'Error 1');
      incrementRetry(taskId, 'Error 2');
      const result = incrementRetry(taskId, 'Error 3');
      expect(result).toBe(false); // Возвращает false при удалении
      expect(getPendingCount()).toBe(0);
    });

    it('должен вернуть false для несуществующей задачи', () => {
      const result = incrementRetry('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('getNextRetryTask', () => {
    it('должен вернуть oldest задачу', () => {
      enqueueParseTask(['https://example.com/1']);
      vi.advanceTimersByTime(1000);
      enqueueParseTask(['https://example.com/2']);
      const task = getNextRetryTask();
      expect(task).not.toBeNull();
      expect(task!.sources[0]).toBe('https://example.com/1');
    });

    it('должен вернуть null если очередь пуста', () => {
      const task = getNextRetryTask();
      expect(task).toBeNull();
    });
  });

  describe('TTL cleanup', () => {
    it('должен отфильтровать протухшие задачи (> 24 часов)', () => {
      enqueueParseTask(['https://example.com/1']);
      // Перемещаемся на 25 часов вперёд
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);
      enqueueParseTask(['https://example.com/2']);
      // Первая задача должна быть удалена при следующем getQueue
      expect(getPendingCount()).toBe(1);
    });

    it('cleanupStaleTasks должен удалить старые задачи', () => {
      enqueueParseTask(['https://example.com/1']);
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);
      enqueueParseTask(['https://example.com/2']);
      const result = cleanupStaleTasks();
      expect(result.count).toBe(1);
    });
  });

  describe('hasPendingTasks / getPendingCount', () => {
    it('hasPendingTasks должен вернуть false для пустой очереди', () => {
      expect(hasPendingTasks()).toBe(false);
    });

    it('hasPendingTasks должен вернуть true с задачами', () => {
      enqueueParseTask(['https://example.com/1']);
      expect(hasPendingTasks()).toBe(true);
    });

    it('getPendingCount должен вернуть точное количество', () => {
      enqueueParseTask(['https://example.com/1']);
      enqueueParseTask(['https://example.com/2']);
      expect(getPendingCount()).toBe(2);
    });
  });

  describe('getQueueInfo', () => {
    it('должен вернуть информацию о пустой очереди', () => {
      const info = getQueueInfo();
      expect(info.pending).toBe(0);
      expect(info.oldestTask).toBeNull();
      expect(info.canRetry).toBe(false);
    });

    it('должен вернуть информацию с задачами', () => {
      enqueueParseTask(['https://example.com/1']);
      const info = getQueueInfo();
      expect(info.pending).toBe(1);
      expect(info.oldestTask).toBeGreaterThan(0);
      expect(info.canRetry).toBe(true);
    });
  });

  describe('clearQueue', () => {
    it('должен очистить всю очередь', () => {
      enqueueParseTask(['https://example.com/1']);
      enqueueParseTask(['https://example.com/2']);
      clearQueue();
      expect(getPendingCount()).toBe(0);
    });
  });

  describe('retryTask', () => {
    it('должен вызвать onParse для задачи с retries < MAX', () => {
      enqueueParseTask(['https://example.com/1'], 'prod_1');
      const onParse = vi.fn();
      const tasks = getPendingTasks();
      retryTask(tasks[0], onParse);
      expect(onParse).toHaveBeenCalledWith(['https://example.com/1'], 'prod_1');
    });

    it('должен удалить задачу если retries >= MAX', () => {
      const taskId = enqueueParseTask(['https://example.com/1']);
      // Доводим до max retries
      incrementRetry(taskId, 'err1'); // retries=1
      incrementRetry(taskId, 'err2'); // retries=2
      const tasks = getPendingTasks();
      // retries = 2, retryTask вызовет incrementRetry который удалит (2 >= 3)
      // Но onParse вызывается ДО incrementRetry в исходном коде
      const onParse = vi.fn();
      retryTask(tasks[0], onParse);
      // onParse вызывается 1 раз (до проверки max retries внутри retryTask)
      expect(onParse).toHaveBeenCalledTimes(1);
      // Задача удалена
      expect(getPendingCount()).toBe(0);
    });
  });

  describe('startAutoRetry / stopAutoRetry', () => {
    it('должен запустить auto-retry и вызвать callback', () => {
      enqueueParseTask(['https://example.com/1']);
      const callback = vi.fn();
      startAutoRetry(callback);
      // Продвигаем время на 30 секунд (RETRY_INTERVAL_MS)
      vi.advanceTimersByTime(30000);
      expect(callback).toHaveBeenCalled();
      stopAutoRetry();
    });

    it('не должен запускать второй интервал если уже запущен', () => {
      enqueueParseTask(['https://example.com/1']);
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      startAutoRetry(callback1);
      startAutoRetry(callback2); // Должен игнорироваться
      vi.advanceTimersByTime(30000);
      expect(callback1).toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      stopAutoRetry();
    });

    it('stopAutoRetry должен очистить интервал', () => {
      enqueueParseTask(['https://example.com/1']);
      const callback = vi.fn();
      startAutoRetry(callback);
      stopAutoRetry();
      vi.advanceTimersByTime(30000);
      const callCountAfterStop = callback.mock.calls.length;
      vi.advanceTimersByTime(30000);
      expect(callback.mock.calls.length).toBe(callCountAfterStop);
    });
  });

  describe('edge cases', () => {
    it('должен обработать corrupted localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce('not-json');
      expect(getPendingCount()).toBe(0);
    });

    it('должен обработать localStorage.setItem ошибку', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Quota exceeded');
      });
      // Не должен крашиться
      expect(() => enqueueParseTask(['https://example.com/1'])).not.toThrow();
    });

    it('должен обработать non-array данные в localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ not: 'array' }));
      expect(getPendingCount()).toBe(0);
    });
  });
});
