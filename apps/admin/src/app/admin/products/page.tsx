'use client';

import { useState } from 'react';
import { productsApi, categoriesApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  oldPrice?: number;
  stock: number;
  categoryId: number;
  category?: { name: string };
  brandId?: number;
  brand?: { name: string };
  status: 'active' | 'low_stock' | 'out_of_stock';
  images?: string[];
}

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: productsData, isLoading: productsLoading } = useQuery<{ data: Product[] }>({
    queryKey: ['admin-products', page, limit],
    queryFn: async () => {
      const result = await productsApi.list({ page, limit });
      return result as unknown as { data: Product[] };
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const result = await categoriesApi.list();
      return result as unknown as { data: { name: string }[] };
    },
  });

  const products: Product[] = productsData?.data || [];
  const categories = categoriesData?.data || [];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryList = ['all', ...categories.map(c => c.name)];

  if (productsLoading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)' }}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            width: '32px',
            height: '32px',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite',
          }}
        >
          <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
        Загрузка товаров...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase font-display">Товары</h1>
          <p className="text-sm text-gray-400 mt-1">Управление каталогом товаров</p>
        </div>
        <a
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--orange)] hover:bg-[var(--orange2)] text-white text-sm font-display font-bold uppercase tracking-wide rounded transition"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-5 h-5"
          >
            <path d="M12 4v16m8-8H4" />
          </svg>
          Добавить товар
        </a>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск товаров..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--black2)] border border-[var(--gray1)] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[var(--orange)] transition"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 bg-[var(--black2)] border border-[var(--gray1)] rounded text-white focus:outline-none focus:border-[var(--orange)] transition"
        >
          {categoryList.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'Все категории' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card__head">
          <span className="card__title">Товары ({filteredProducts.length})</span>
        </div>
        <div className="card__body card__body--flush">
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-3)' }}>
              {products.length === 0 ? 'Нет товаров' : 'Нет товаров по выбранным фильтрам'}
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>SKU</th>
                  <th>Категория</th>
                  <th>Бренд</th>
                  <th style={{ textAlign: 'right' }}>Цена</th>
                  <th style={{ textAlign: 'center' }}>Остаток</th>
                  <th>Статус</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus =
                    product.stock === 0 ? 'out_of_stock' : product.stock < 5 ? 'low_stock' : 'active';
                  const statusLabels: Record<string, string> = {
                    active: 'В наличии',
                    low_stock: 'Мало',
                    out_of_stock: 'Нет',
                  };
                  const statusColors: Record<string, string> = {
                    active: 'green',
                    low_stock: 'yellow',
                    out_of_stock: 'red',
                  };

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="text-white fw700">{product.name}</div>
                      </td>
                      <td className="mono f11">{product.sku}</td>
                      <td>{product.category?.name || '-'}</td>
                      <td>{product.brand?.name || '-'}</td>
                      <td className="text-right text-white fw700">
                        {product.price.toLocaleString('ru-RU')} ₽
                        {product.oldPrice && product.oldPrice > product.price && (
                          <div className="f10 text-muted line-through">
                            {product.oldPrice.toLocaleString('ru-RU')} ₽
                          </div>
                        )}
                      </td>
                      <td className="text-center">{product.stock}</td>
                      <td>
                        <span className={`badge badge--${statusColors[stockStatus]}`}>
                          <span className="badge-dot" />
                          {statusLabels[stockStatus]}
                        </span>
                      </td>
                      <td>
                        <div className="tbl-actions">
                          <a href={`/admin/products/${product.id}/edit`} className="tbl-btn">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              width="12"
                              height="12"
                            >
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </a>
                          <button className="tbl-btn tbl-btn--danger">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              width="12"
                              height="12"
                            >
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {products.length >= limit && (
        <div className="flex flex-c gap-8" style={{ justifyContent: 'center' }}>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Назад
          </button>
          <span className="f12 text-muted" style={{ padding: '8px 16px' }}>
            Страница {page}
          </span>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setPage(p => p + 1)}
            disabled={products.length < limit}
          >
            Вперёд
          </button>
        </div>
      )}
    </div>
  );
}
