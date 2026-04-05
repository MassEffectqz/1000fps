'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    pros: '',
    cons: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Пожалуйста, поставьте оценку');
      return;
    }

    if (formData.text.length < 10) {
      toast.error('Текст отзыва должен быть не менее 10 символов');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          title: formData.title || undefined,
          text: formData.text,
          pros: formData.pros || undefined,
          cons: formData.cons || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при отправке отзыва');
      }

      toast.success(data.message || 'Отзыв отправлен на модерацию');
      
      // Сброс формы
      setRating(0);
      setFormData({ title: '', text: '', pros: '', cons: '' });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка при отправке отзыва');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
      <h3 className="font-display text-[18px] font-bold text-white mb-6">
        Оставить отзыв
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Рейтинг */}
        <div>
          <label className="block text-[14px] font-semibold text-white mb-2">
            Ваша оценка *
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={star <= (hoveredRating || rating) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn(
                    'w-8 h-8',
                    star <= (hoveredRating || rating) ? 'text-orange' : 'text-gray3'
                  )}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            ))}
            <span className="ml-3 text-[14px] text-gray4">
              {rating > 0 && (
                <span className="text-orange font-semibold">
                  {rating} из 5
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Заголовок */}
        <div>
          <label className="block text-[14px] font-semibold text-white mb-2">
            Заголовок
          </label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Кратко опишите ваше впечатление"
            maxLength={100}
            className="bg-black3 border-gray1 text-white placeholder:text-gray4"
          />
          <div className="text-[12px] text-gray4 mt-1">
            {formData.title.length}/100
          </div>
        </div>

        {/* Текст отзыва */}
        <div>
          <label className="block text-[14px] font-semibold text-white mb-2">
            Текст отзыва *
          </label>
          <Textarea
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            placeholder="Расскажите о вашем опыте использования товара..."
            rows={5}
            maxLength={2000}
            className="bg-black3 border-gray1 text-white placeholder:text-gray4 resize-none"
          />
          <div className="text-[12px] text-gray4 mt-1">
            {formData.text.length}/2000
          </div>
        </div>

        {/* Плюсы и минусы */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[14px] font-semibold text-green-500 mb-2 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
              Преимущества
            </label>
            <Textarea
              value={formData.pros}
              onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
              placeholder="Что вам понравилось?"
              rows={3}
              maxLength={500}
              className="bg-black3 border-gray1 text-white placeholder:text-gray4 resize-none"
            />
          </div>
          <div>
            <label className="block text-[14px] font-semibold text-red-500 mb-2 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.66A1.94 1.94 0 0 1 22 4v7a2 2 0 0 1-2 2h-3" />
              </svg>
              Недостатки
            </label>
            <Textarea
              value={formData.cons}
              onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
              placeholder="Что не понравилось?"
              rows={3}
              maxLength={500}
              className="bg-black3 border-gray1 text-white placeholder:text-gray4 resize-none"
            />
          </div>
        </div>

        {/* Кнопка отправки */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray1">
          <div className="text-[12px] space-y-1">
            <p className="text-gray4">
              * Отзыв появится после проверки модератором
            </p>
            {rating === 0 && formData.text.length < 10 && (
              <p className="text-orange flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Поставьте оценку и напишите хотя бы 10 символов
              </p>
            )}
            {rating === 0 && formData.text.length >= 10 && (
              <p className="text-orange flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Поставьте оценку
              </p>
            )}
            {rating > 0 && formData.text.length < 10 && (
              <p className="text-orange flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Напишите ещё {10 - formData.text.length} символов
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0 || formData.text.length < 10}
            className="bg-orange hover:bg-orange/90 text-white"
          >
            {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
          </Button>
        </div>
      </form>
    </div>
  );
}
