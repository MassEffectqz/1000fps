'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Warehouse {
  id: string;
  name: string;
  city: string;
  address: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stock: Array<{
    id: string;
    quantity: number;
    reserved: number;
    product: {
      id: string;
      name: string;
      sku: string;
    };
  }>;
  _count: {
    stock: number;
  };
}

interface FormData {
  name: string;
  city: string;
  address: string;
  phone: string;
  isActive: boolean;
}

const initialFormData: FormData = {
  name: '',
  city: '',
  address: '',
  phone: '',
  isActive: true,
};

export default function AdminWarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingWarehouse, setDeletingWarehouse] = useState<Warehouse | null>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  // Показ уведомления
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  // Загрузка складов
  const loadWarehouses = useCallback(async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { isActive: statusFilter === 'active' ? 'true' : 'false' }),
        ...(cityFilter !== 'all' && { city: cityFilter }),
      });

      const response = await fetch(`/api/admin/warehouses?${params}`);
      if (response.ok) {
        const data = await response.json();
        setWarehouses(data.warehouses || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error loading warehouses:', error);
      showToast('Ошибка загрузки складов', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, cityFilter, showToast]);

  useEffect(() => {
    loadWarehouses(currentPage);
  }, [currentPage, loadWarehouses]);

  // Получение уникальных городов для фильтра
  const uniqueCities = Array.from(new Set(warehouses.map(w => w.city))).sort();

  // Обработчик поиска
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadWarehouses(1);
  };

  // Открытие модального окна создания
  const handleCreate = () => {
    setEditingWarehouse(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  // Открытие модального окна редактирования
  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      city: warehouse.city,
      address: warehouse.address,
      phone: warehouse.phone || '',
      isActive: warehouse.isActive,
    });
    setShowModal(true);
  };

  // Открытие подтверждения удаления
  const handleDeleteClick = (warehouse: Warehouse) => {
    setDeletingWarehouse(warehouse);
    setShowDeleteConfirm(true);
  };

  // Сохранение (создание или обновление)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingWarehouse
        ? `/api/admin/warehouses/${editingWarehouse.id}`
        : '/api/admin/warehouses';

      const method = editingWarehouse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast(
          editingWarehouse ? 'Склад обновлён' : 'Склад создан',
          'success'
        );
        setShowModal(false);
        loadWarehouses(currentPage);
      } else {
        const error = await response.json();
        showToast(`Ошибка: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Error saving warehouse:', error);
      showToast('Ошибка сохранения', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Удаление склада
  const handleDeleteConfirm = async () => {
    if (!deletingWarehouse) return;

    try {
      const response = await fetch(`/api/admin/warehouses/${deletingWarehouse.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Склад удалён', 'success');
        setShowDeleteConfirm(false);
        setDeletingWarehouse(null);
        loadWarehouses(currentPage);
      } else {
        const error = await response.json();
        showToast(`Ошибка: ${error.error}`, 'error');
        setShowDeleteConfirm(false);
        setDeletingWarehouse(null);
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      showToast('Ошибка удаления', 'error');
      setShowDeleteConfirm(false);
      setDeletingWarehouse(null);
    }
  };

  // Закрытие модального окна
  const handleModalClose = () => {
    setShowModal(false);
    setEditingWarehouse(null);
    setFormData(initialFormData);
  };

  // Закрытие подтверждения удаления
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeletingWarehouse(null);
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
          <h1 className="font-display text-[20px] font-bold text-white mb-1">Склады</h1>
          <p className="text-[13px] text-gray4">Управление складами и остатками</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-5 py-[10px] bg-orange text-white rounded-[var(--radius)] text-[13px] font-semibold hover:bg-orange2 transition-colors"
        >
          + Добавить склад
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, адресу, городу..."
              className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] pl-10 pr-4 py-[8px] text-white text-[13px] outline-none focus:border-orange transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-[8px] text-white text-[13px] outline-none focus:border-orange transition-colors appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="all">Все статусы</option>
            <option value="active">Активен</option>
            <option value="inactive">Не активен</option>
          </select>

          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-[8px] text-white text-[13px] outline-none focus:border-orange transition-colors appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="all">Все города</option>
            {uniqueCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {/* Search Button */}
          <button
            type="submit"
            className="px-5 py-[8px] bg-orange text-white rounded-[var(--radius)] text-[13px] font-semibold hover:bg-orange2 transition-colors"
          >
            Найти
          </button>

          {/* Reset Button */}
          {(searchQuery || statusFilter !== 'all' || cityFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCityFilter('all');
                setCurrentPage(1);
              }}
              className="px-5 py-[8px] bg-black3 border border-gray1 rounded-[var(--radius)] text-[13px] font-semibold text-gray4 hover:text-white hover:border-gray2 transition-colors"
            >
              Сбросить
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-black2 border border-gray1 rounded-[var(--radius)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray1">
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Название</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Город</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Адрес</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Телефон</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Товаров</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Статус</th>
                <th className="text-right px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.length > 0 ? (
                warehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="border-b border-gray1 last:border-b-0 hover:bg-black3 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-bold text-white">{warehouse.name}</span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray4">{warehouse.city}</td>
                    <td className="px-4 py-3 text-[13px] text-gray4">{warehouse.address}</td>
                    <td className="px-4 py-3 text-[13px] text-gray4">
                      {warehouse.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'text-[13px] font-bold',
                        warehouse._count.stock > 20 ? 'text-green-500' : warehouse._count.stock > 5 ? 'text-yellow-500' : 'text-gray4'
                      )}>
                        {warehouse._count.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'text-[10px] font-bold px-[8px] py-[3px] rounded-[var(--radius)] inline-flex items-center gap-1',
                        warehouse.isActive
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      )}>
                        <span className="w-1 h-1 rounded-full bg-current" />
                        {warehouse.isActive ? 'Активен' : 'Не активен'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-[6px]">
                        <button
                          onClick={() => handleEdit(warehouse)}
                          className="w-7 h-7 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-orange hover:text-orange"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(warehouse)}
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
                      <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
                    </svg>
                    <div>Складов нет</div>
                    <div className="text-[12px] mt-1">Нажмите &quot;Добавить склад&quot; чтобы создать первый</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Info */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-[12px] text-gray4">
            Показано {warehouses.length} из {total} складов
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-[6px] bg-black3 border border-gray1 rounded-[var(--radius)] text-[12px] text-gray4 disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange hover:text-orange transition-colors"
            >
              Назад
            </button>
            <span className="text-[12px] text-gray4">
              Страница {currentPage} из {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-[6px] bg-black3 border border-gray1 rounded-[var(--radius)] text-[12px] text-gray4 disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange hover:text-orange transition-colors"
            >
              Вперёд
            </button>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray1 sticky top-0 bg-black2 z-10">
              <h2 className="font-display text-[18px] font-bold text-white">
                {editingWarehouse ? 'Редактирование склада' : 'Новый склад'}
              </h2>
              <button
                onClick={handleModalClose}
                className="w-8 h-8 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-orange hover:text-orange"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
                    Название склада *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-[8px] text-white text-[13px] outline-none focus:border-orange transition-colors"
                    placeholder="Например: Основной склад"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
                      Город *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-[8px] text-white text-[13px] outline-none focus:border-orange transition-colors"
                      placeholder="Например: Москва"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-[8px] text-white text-[13px] outline-none focus:border-orange transition-colors"
                      placeholder="+7 (999) 000-00-00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
                    Адрес *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-[8px] text-white text-[13px] outline-none focus:border-orange transition-colors resize-none"
                    placeholder="Полный адрес склада"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3 p-4 bg-black3 border border-gray1 rounded-[var(--radius)] cursor-pointer hover:border-gray2 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 accent-orange"
                    />
                    <span className="text-[13px] font-semibold text-white">Активный склад</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray1">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-5 py-[10px] bg-black3 border border-gray1 rounded-[var(--radius)] text-[13px] font-semibold text-gray4 hover:text-white hover:border-gray2 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-[10px] bg-orange text-white rounded-[var(--radius)] text-[13px] font-semibold hover:bg-orange2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Сохранение...' : editingWarehouse ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {showDeleteConfirm && deletingWarehouse && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-[var(--radius)] flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-red-500">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-[16px] font-bold text-white">Удаление склада</h3>
                  <p className="text-[13px] text-gray4 mt-1">
                    Вы уверены, что хотите удалить склад &quot;{deletingWarehouse.name}&quot;?
                  </p>
                </div>
              </div>

              {deletingWarehouse._count.stock > 0 && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-[var(--radius)]">
                  <p className="text-[13px] text-red-400">
                    <strong>Внимание!</strong> На складе находится {deletingWarehouse._count.stock} товаров.
                    Нельзя удалить склад с товарами.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={handleDeleteCancel}
                  className="px-5 py-[10px] bg-black3 border border-gray1 rounded-[var(--radius)] text-[13px] font-semibold text-gray4 hover:text-white hover:border-gray2 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletingWarehouse._count.stock > 0}
                  className="px-5 py-[10px] bg-red-500 text-white rounded-[var(--radius)] text-[13px] font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={cn(
            'flex items-center gap-3 px-5 py-[14px] rounded-[var(--radius)] border shadow-lg min-w-[300px]',
            toast.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          )}>
            {toast.type === 'success' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 flex-shrink-0">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            <span className="text-[13px] font-semibold">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
