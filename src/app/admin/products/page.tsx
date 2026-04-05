'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { useDebounce } from '@/lib/hooks/use-debounce';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category?: { name: string } | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Debounce для search query (300ms)
  const debouncedSearch = useDebounce(searchQuery, 300);

  const loadProducts = useCallback(async (page = 1, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(Math.ceil(data.total / limit) || 1);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, loadProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот товар?')) return;
    
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadProducts();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center text-gray4">
          <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div>Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[20px] font-bold text-white mb-1">Товары</h1>
          <p className="text-[13px] text-gray4">Управление ассортиментом товаров</p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-5 py-[10px] bg-orange text-white rounded-[var(--radius)] text-[13px] font-semibold hover:bg-orange2 transition-colors"
        >
          + Добавить товар
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray3">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск товаров..."
            className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] pl-10 pr-4 py-[8px] text-white text-[13px] outline-none focus:border-orange transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-black2 border border-gray1 rounded-[var(--radius)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray1">
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Название</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Артикул</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Категория</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Цена</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Остаток</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Статус</th>
                <th className="text-right px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-gray1 last:border-b-0 hover:bg-black3 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-[13px] font-bold text-white hover:text-orange transition-colors"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray4 font-mono">{product.sku}</td>
                    <td className="px-4 py-3 text-[13px] text-gray4">
                      {product.category?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-bold text-white">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'text-[13px] font-bold',
                        product.stock > 20 ? 'text-green-500' : product.stock > 5 ? 'text-yellow-500' : 'text-red-500'
                      )}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'text-[10px] font-bold px-[8px] py-[3px] rounded-[var(--radius)] inline-flex items-center gap-1',
                        product.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      )}>
                        <span className="w-1 h-1 rounded-full bg-current" />
                        {product.isActive ? 'Активен' : 'Не активен'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-[6px]">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="w-7 h-7 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-orange hover:text-orange"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="w-7 h-7 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-red-500 hover:text-red-500"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 mx-auto mb-3 opacity-50">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <div>Товаров нет</div>
                    <div className="text-[12px] mt-1">Нажмите &quot;Добавить товар&quot; чтобы создать первый</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
