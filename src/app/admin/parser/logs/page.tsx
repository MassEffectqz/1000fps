'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface ParseJob {
  id: string;
  productId: string | null;
  sources: string[];
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  result: unknown;
  jobId: string | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
  } | null;
}

interface ParserLogsResponse {
  jobs: ParseJob[];
  total: number;
  page: number;
  totalPages: number;
}

export default function ParserLogsPage() {
  const [logs, setLogs] = useState<ParserLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<ParseJob | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });

      if (statusFilter) {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/admin/parser/logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-green/20 text-green text-[11px] font-semibold rounded">Завершено</span>;
      case 'FAILED':
        return <span className="px-2 py-1 bg-red/20 text-red text-[11px] font-semibold rounded">Ошибка</span>;
      case 'PROCESSING':
        return <span className="px-2 py-1 bg-blue/20 text-blue text-[11px] font-semibold rounded">В процессе</span>;
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow/20 text-yellow text-[11px] font-semibold rounded">Ожидание</span>;
      default:
        return <span className="px-2 py-1 bg-gray1 text-gray4 text-[11px] font-semibold rounded">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[24px] font-bold text-white mb-2">Логи парсинга</h1>
          <p className="text-[13px] text-gray4">История всех задач парсинга Wildberries</p>
        </div>

        {/* Filters */}
        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-[11px] text-gray4 uppercase tracking-wider mb-1 block">
                Статус
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-black3 border border-gray1 rounded-[var(--radius-sm)] px-3 py-2 text-[12px] text-white outline-none focus:border-orange"
              >
                <option value="">Все статусы</option>
                <option value="PENDING">Ожидание</option>
                <option value="PROCESSING">В процессе</option>
                <option value="COMPLETED">Завершено</option>
                <option value="FAILED">Ошибка</option>
              </select>
            </div>

            <button
              onClick={loadLogs}
              className="px-4 py-2 bg-orange text-white text-[12px] font-semibold rounded-[var(--radius)] hover:bg-orange/80 transition-colors self-end"
            >
              Обновить
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin w-8 h-8 text-orange" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : !logs || logs.jobs.length === 0 ? (
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-12 text-center">
            <div className="text-[48px] mb-4">📋</div>
            <div className="text-[16px] font-semibold text-white mb-2">Задач пока нет</div>
            <div className="text-[13px] text-gray4">Запустите парсинг товара чтобы увидеть логи</div>
          </div>
        ) : (
          <>
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-black3 border-b border-gray1">
                  <tr>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray4 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray4 uppercase tracking-wider">
                      Товар
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray4 uppercase tracking-wider">
                      Источники
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray4 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray4 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.jobs.map((job) => (
                    <tr key={job.id} className="border-b border-gray1 hover:bg-black3/50 transition-colors">
                      <td className="px-4 py-3 text-[12px]">
                        {new Date(job.createdAt).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {job.product ? (
                          <div>
                            <div className="text-[12px] text-white font-medium truncate max-w-[300px]">
                              {job.product.name}
                            </div>
                            <div className="text-[11px] text-gray4">
                              {job.product.price.toLocaleString('ru-RU')} ₽
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray4">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray4">
                        {job.sources.length} {job.sources.length === 1 ? 'источник' : 'источников'}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="text-[11px] text-orange hover:text-orange/80 transition-colors"
                        >
                          Подробнее
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {logs.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-[12px] text-gray4">
                  Страница {logs.page} из {logs.totalPages} (всего {logs.total} задач)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 bg-black2 border border-gray1 rounded text-[12px] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange transition-colors"
                  >
                    Назад
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(logs.totalPages, p + 1))}
                    disabled={page === logs.totalPages}
                    className="px-3 py-1.5 bg-black2 border border-gray1 rounded text-[12px] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange transition-colors"
                  >
                    Вперёд
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray1">
              <h2 className="text-[16px] font-bold text-white">Детали задачи</h2>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray4 hover:text-white transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <div className="text-[11px] text-gray4 uppercase tracking-wider mb-1">Статус</div>
                {getStatusBadge(selectedJob.status)}
              </div>

              <div>
                <div className="text-[11px] text-gray4 uppercase tracking-wider mb-1">Товар</div>
                <div className="text-[13px] text-white">
                  {selectedJob.product?.name || '—'}
                </div>
              </div>

              <div key="sources-section">
                <div className="text-[11px] text-gray4 uppercase tracking-wider mb-1">Источники</div>
                <div className="space-y-1">
                  {(() => {
                    const sources = selectedJob.sources;
                    if (Array.isArray(sources)) {
                      return (sources as string[]).map((url: string, i: number) => (
                        <div key={i} className="text-[11px] text-orange break-all">
                          {url}
                        </div>
                      ));
                    }
                    return (<span className="text-[11px] text-gray4">—</span>);
                  })()}
                </div>
              </div>

              {selectedJob.error && (
                <div>
                  <div className="text-[11px] text-gray4 uppercase tracking-wider mb-1">Ошибка</div>
                  <div className="text-[12px] text-red bg-red/10 border border-red/20 rounded p-3">
                    {selectedJob.error}
                  </div>
                </div>
              )}

              {selectedJob.result !== null && selectedJob.result !== undefined && (
                <div>
                  <div className="text-[11px] text-gray4 uppercase tracking-wider mb-1">Результат</div>
                  <pre className="text-[11px] text-white bg-black3 border border-gray1 rounded p-3 overflow-x-auto max-h-[300px]">
                    {JSON.stringify(selectedJob.result, null, 2)}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] text-gray4 uppercase tracking-wider mb-1">Создана</div>
                  <div className="text-[12px] text-white">
                    {new Date(selectedJob.createdAt).toLocaleString('ru-RU')}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray4 uppercase tracking-wider mb-1">Завершена</div>
                  <div className="text-[12px] text-white">
                    {selectedJob.completedAt
                      ? new Date(selectedJob.completedAt).toLocaleString('ru-RU')
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
