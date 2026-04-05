'use client';

import { useCompare } from '@/lib/context/compare-context';
import { Breadcrumbs, Button, Badge } from '@/components/ui';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ComparePage() {
  const { comparison, removeFromCompare, clearComparison, isLoading } = useCompare();

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center text-gray4">
            <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div>Загрузка...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Сравнение товаров', href: '/compare' },
          ]}
        />
      </div>

      {/* Заголовок */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-[28px] font-bold text-white mb-2">
            Сравнение товаров
          </h1>
          <p className="text-[14px] text-gray4">
            {comparison.totalItems} товаров для сравнения
          </p>
        </div>
        {comparison.totalItems > 0 && (
          <Button
            variant="outline"
            onClick={clearComparison}
            className="text-[13px]"
          >
            Очистить всё
          </Button>
        )}
      </div>

      {comparison.totalItems === 0 ? (
        /* Пустое состояние */
        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-black3 border border-gray1 rounded-full flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-10 h-10 text-gray4"
            >
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
          </div>
          <h2 className="font-display text-[20px] font-bold text-white mb-3">
            Список сравнения пуст
          </h2>
          <p className="text-[14px] text-gray4 mb-6 max-w-md mx-auto">
            Добавьте товары для сравнения, нажав кнопку &laquo;Сравнить&raquo; в каталоге или на странице товара
          </p>
          <Link href="/catalog">
            <Button>Перейти в каталог</Button>
          </Link>
        </div>
      ) : (
        /* Таблица сравнения */
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray1">
                <th className="w-[200px] p-4 text-left text-[12px] font-bold text-gray3 uppercase tracking-wider bg-black2 sticky left-0 z-10">
                  Характеристики
                </th>
                {comparison.items.map((item) => (
                  <th key={item.id} className="p-4 min-w-[250px] bg-black2">
                    <div className="relative">
                      {/* Кнопка удаления */}
                      <button
                        onClick={() => removeFromCompare(item.id)}
                        className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center rounded-full bg-black3 border border-gray1 text-gray4 hover:text-red-500 hover:border-red-500/50 transition-colors"
                        title="Удалить из сравнения"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="w-4 h-4"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>

                      {/* Фото товара */}
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="block w-full aspect-square mb-4 bg-white rounded-[var(--radius)] p-4 flex items-center justify-center"
                      >
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={200}
                            height={200}
                            className="w-full h-full object-contain"
                            unoptimized
                          />
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-12 h-12 text-gray4"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        )}
                      </Link>

                      {/* Название и цена */}
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="block font-display text-[14px] font-bold text-white hover:text-orange transition-colors mb-2 line-clamp-2"
                      >
                        {item.product.name}
                      </Link>

                      <div className="font-display text-[20px] font-bold text-white mb-2">
                        {item.product.price.toLocaleString('ru-RU')} ₽
                      </div>

                      {item.product.oldPrice && (
                        <div className="text-[12px] text-gray4 line-through mb-3">
                          {item.product.oldPrice.toLocaleString('ru-RU')} ₽
                        </div>
                      )}

                      {/* Рейтинг */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              viewBox="0 0 24 24"
                              fill={
                                i < Math.floor(item.product.rating)
                                  ? 'currentColor'
                                  : 'none'
                              }
                              stroke="currentColor"
                              strokeWidth="2"
                              className={cn(
                                'w-4 h-4',
                                i < Math.floor(item.product.rating)
                                  ? 'text-orange'
                                  : 'text-gray3'
                              )}
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-[12px] text-gray4">
                          {item.product.reviewCount} отзывов
                        </span>
                      </div>

                      {/* Кнопки */}
                      <div className="flex flex-col gap-2">
                        <Link href={`/product/${item.product.slug}`}>
                          <Button className="w-full text-[12px]">
                            Подробнее
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full text-[12px]">
                          В корзину
                        </Button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Основные характеристики */}
              <tr className="border-b border-gray1">
                <td className="p-4 text-[12px] font-bold text-gray3 uppercase tracking-wider bg-black2 sticky left-0 z-10">
                  Бренд
                </td>
                {comparison.items.map((item) => (
                  <td key={item.id} className="p-4 text-[14px] text-white">
                    {item.product.brand?.name || '—'}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray1">
                <td className="p-4 text-[12px] font-bold text-gray3 uppercase tracking-wider bg-black2 sticky left-0 z-10">
                  Артикул
                </td>
                {comparison.items.map((item) => (
                  <td key={item.id} className="p-4 text-[14px] text-gray4">
                    {item.product.sku}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray1">
                <td className="p-4 text-[12px] font-bold text-gray3 uppercase tracking-wider bg-black2 sticky left-0 z-10">
                  Категория
                </td>
                {comparison.items.map((item) => (
                  <td key={item.id} className="p-4">
                    <Link
                      href={`/catalog?categoryId=${item.product.category?.id}`}
                      className="text-[14px] text-orange hover:underline"
                    >
                      {item.product.category?.name || '—'}
                    </Link>
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray1">
                <td className="p-4 text-[12px] font-bold text-gray3 uppercase tracking-wider bg-black2 sticky left-0 z-10">
                  Наличие
                </td>
                {comparison.items.map((item) => (
                  <td key={item.id} className="p-4">
                    <Badge
                      variant={item.product.inStock ? 'green' : 'gray'}
                      className="text-[11px]"
                    >
                      {item.product.inStock ? 'В наличии' : 'Нет в наличии'}
                    </Badge>
                  </td>
                ))}
              </tr>

              {/* Характеристики из specs */}
              {getAllUniqueSpecs(comparison.items).map((specName) => (
                <tr key={specName} className="border-b border-gray1">
                  <td className="p-4 text-[12px] font-bold text-gray3 uppercase tracking-wider bg-black2 sticky left-0 z-10">
                    {specName}
                  </td>
                  {comparison.items.map((item) => {
                    const specValue = getSpecValue(item.product.specs, specName);
                    return (
                      <td key={item.id} className="p-4 text-[14px] text-white">
                        {specValue || '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Вспомогательные функции
function getAllUniqueSpecs(items: Array<{ product: { specs: Array<{ name: string }> } }>): string[] {
  const specs = new Set<string>();
  items.forEach((item) => {
    item.product.specs.forEach((spec) => {
      specs.add(spec.name);
    });
  });
  return Array.from(specs).sort();
}

function getSpecValue(
  specs: Array<{ name: string; value: string; unit: string | null }>,
  specName: string
): string {
  const spec = specs.find((s) => s.name === specName);
  if (!spec) return '';
  return `${spec.value}${spec.unit ? ' ' + spec.unit : ''}`;
}
