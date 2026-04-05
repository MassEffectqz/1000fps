'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  text: string;
  pros: string | null;
  cons: string | null;
  isVerified: boolean;
  helpful: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ReviewsListProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  onVote?: (reviewId: string, type: 'helpful' | 'unhelpful') => void;
}

export function ReviewsList({
  reviews,
  averageRating,
  totalReviews,
  ratingDistribution,
  onVote,
}: ReviewsListProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest');

  return (
    <div className="space-y-8">
      {/* Сводка рейтинга */}
      <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Средний рейтинг */}
          <div className="text-center">
            <div className="text-[48px] font-display font-bold text-white">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  viewBox="0 0 24 24"
                  fill={star <= Math.round(averageRating) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn(
                    'w-5 h-5',
                    star <= Math.round(averageRating) ? 'text-orange' : 'text-gray3'
                  )}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <div className="text-[14px] text-gray4">
              {totalReviews} {totalReviews === 1 ? 'отзыв' : totalReviews < 5 ? 'отзыва' : 'отзывов'}
            </div>
          </div>

          {/* Распределение по звездам */}
          <div className="md:col-span-2 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingDistribution[stars] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-[13px] text-gray4 w-16 flex items-center gap-1">
                    {stars} <span className="text-orange">★</span>
                  </span>
                  <div className="flex-1 h-2 bg-gray1 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[13px] text-gray4 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Сортировка */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[18px] font-bold text-white">
          Отзывы покупателей
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-gray4">Сортировка:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              const value = e.target.value;
              if (['newest', 'highest', 'lowest', 'helpful'].includes(value)) {
                setSortBy(value as 'newest' | 'highest' | 'lowest' | 'helpful');
              }
            }}
            className="bg-black2 border border-gray1 rounded-[var(--radius)] px-3 py-1.5 text-[13px] text-white focus:outline-none focus:border-orange"
          >
            <option value="newest">Сначала новые</option>
            <option value="highest">Сначала положительные</option>
            <option value="lowest">Сначала отрицательные</option>
            <option value="helpful">По полезности</option>
          </select>
        </div>
      </div>

      {/* Список отзывов */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-black2 border border-gray1 rounded-[var(--radius)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-gray3 mx-auto mb-4">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h4 className="font-display text-[16px] font-bold text-white mb-2">
            Пока нет отзывов
          </h4>
          <p className="text-[14px] text-gray4">
            Будьте первым, кто оставит отзыв на этот товар
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  onVote?: (reviewId: string, type: 'helpful' | 'unhelpful') => void;
}

function ReviewCard({ review, onVote }: ReviewCardProps) {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (type: 'helpful' | 'unhelpful') => {
    if (!onVote || isVoting) return;
    setIsVoting(true);
    await onVote(review.id, type);
    setIsVoting(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-5">
      {/* Заголовок отзыва */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Аватар пользователя */}
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
              className={cn(
                'w-4 h-4',
                star <= review.rating ? 'text-orange' : 'text-gray3'
              )}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>
      </div>

      {/* Заголовок */}
      {review.title && (
        <h4 className="font-display text-[15px] font-bold text-white mb-2">
          {review.title}
        </h4>
      )}

      {/* Текст отзыва */}
      <p className="text-[14px] text-gray3 leading-relaxed mb-4">
        {review.text}
      </p>

      {/* Плюсы и минусы */}
      {(review.pros || review.cons) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {review.pros && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-[var(--radius)] p-3">
              <div className="text-[12px] font-semibold text-green-500 mb-1">
                ✓ Преимущества
              </div>
              <p className="text-[13px] text-white2">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-[var(--radius)] p-3">
              <div className="text-[12px] font-semibold text-red-500 mb-1">
                ✗ Недостатки
              </div>
              <p className="text-[13px] text-white2">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {/* Полезность отзыва */}
      {onVote && (
        <div className="flex items-center gap-4 pt-3 border-t border-gray1">
          <span className="text-[12px] text-gray4">
            Отзыв полезен?
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote('helpful')}
            disabled={isVoting}
            className="h-7 px-3 text-[12px] text-gray4 hover:text-green-500"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 mr-1">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            Да ({review.helpful > 0 ? review.helpful : ''})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote('unhelpful')}
            disabled={isVoting}
            className="h-7 px-3 text-[12px] text-gray4 hover:text-red-500"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 mr-1">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.66A1.94 1.94 0 0 1 22 4v7a2 2 0 0 1-2 2h-3" />
            </svg>
            Нет
          </Button>
        </div>
      )}
    </div>
  );
}
