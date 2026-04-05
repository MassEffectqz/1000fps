'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  text: string;
  pros: string | null;
  cons: string | null;
  isVerified: boolean;
  isApproved: boolean;
  helpful: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<'pending' | 'approved' | ''>('pending');

  const loadReviews = useCallback(async (retryCount = 0) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(status && { status }),
      });

      const response = await fetch(`/api/admin/reviews?${params}`);

      // Next.js dev: lazy compilation может вернуть 404 при первом запросе
      if (response.status === 404 && retryCount < 3) {
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
        return loadReviews(retryCount + 1);
      }

      if (!response.ok) {
        throw new Error('Ошибка загрузки отзывов');
      }

      const data = await response.json();
      setReviews(data.reviews || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading reviews:', error);
      if (retryCount < 3) {
        await new Promise(r => setTimeout(r, 1500));
        return loadReviews(retryCount + 1);
      }
      toast.error('Ошибка загрузки отзывов');
    } finally {
      setIsLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    loadReviews();
  }, [page, status, loadReviews]);

  const handleModerate = async (reviewId: string, isApproved: boolean) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved }),
      });

      if (!response.ok) {
        throw new Error('Ошибка модерации');
      }

      toast.success(isApproved ? 'Отзыв одобрен' : 'Отзыв отклонен');
      loadReviews();
    } catch (error) {
      console.error('Error moderating review:', error);
      toast.error('Ошибка при модерации');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Удалить этот отзыв?')) return;

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления');
      }

      toast.success('Отзыв удален');
      loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Ошибка при удалении');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[20px] font-bold text-white mb-1">
            Управление отзывами
          </h1>
          <p className="text-[13px] text-gray4">
            Модерация отзывов покупателей
          </p>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant={status === 'pending' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => { setStatus('pending'); setPage(1); }}
        >
          На модерации
        </Button>
        <Button
          variant={status === 'approved' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => { setStatus('approved'); setPage(1); }}
        >
          Одобренные
        </Button>
        <Button
          variant={status === '' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => { setStatus(''); setPage(1); }}
        >
          Все
        </Button>
      </div>

      {/* Список отзывов */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center text-gray4">
            <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div>Загрузка...</div>
          </div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-12 text-center">
          <div className="text-[16px] font-semibold text-white mb-2">Отзывов нет</div>
          <p className="text-[13px] text-gray4">
            {status === 'pending' ? 'Нет отзывов на модерации' : 'Нет отзывов'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5"
            >
              {/* Заголовок отзыва */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[14px] font-bold text-orange">
                      {(review.user.name || review.user.email)[0].toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-white">
                        {review.user.name || 'Пользователь'}
                      </span>
                      {review.isVerified && (
                        <Badge variant="green" className="text-[10px] px-2 py-0.5">
                          ✓ Покупка подтверждена
                        </Badge>
                      )}
                      {!review.isApproved && (
                        <Badge variant="yellow" className="text-[10px] px-2 py-0.5">
                          На модерации
                        </Badge>
                      )}
                    </div>
                    <div className="text-[12px] text-gray4">
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Рейтинг */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      viewBox="0 0 24 24"
                      fill={star <= review.rating ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`w-4 h-4 ${star <= review.rating ? 'text-orange' : 'text-gray3'}`}
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Товар */}
              <div className="mb-3">
                <span className="text-[12px] text-gray4">Товар: </span>
                <a
                  href={`/product/${review.product.slug}`}
                  className="text-[13px] text-orange hover:underline"
                >
                  {review.product.name}
                </a>
              </div>

              {/* Заголовок */}
              {review.title && (
                <h4 className="font-display text-[15px] font-bold text-white mb-2">
                  {review.title}
                </h4>
              )}

              {/* Текст */}
              <p className="text-[14px] text-gray3 leading-relaxed mb-3">
                {review.text}
              </p>

              {/* Плюсы и минусы */}
              {(review.pros || review.cons) && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {review.pros && (
                    <div className="bg-green-500/5 border border-green-500/20 rounded p-2">
                      <div className="text-[11px] font-semibold text-green-500 mb-1">
                        ✓ Преимущества
                      </div>
                      <p className="text-[12px] text-gray3">{review.pros}</p>
                    </div>
                  )}
                  {review.cons && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded p-2">
                      <div className="text-[11px] font-semibold text-red-500 mb-1">
                        ✗ Недостатки
                      </div>
                      <p className="text-[12px] text-gray3">{review.cons}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Действия */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray1">
                {!review.isApproved && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleModerate(review.id, true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      ✓ Одобрить
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleModerate(review.id, false)}
                      className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                    >
                      ✗ Отклонить
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(review.id)}
                  className="text-gray4 hover:text-red-500"
                >
                  Удалить
                </Button>
              </div>
            </div>
          ))}

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Назад
              </Button>
              <span className="text-[13px] text-gray4 px-4">
                Страница {page} из {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Вперед →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
