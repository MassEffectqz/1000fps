'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks/use-debounce';
import type { OrderStatus, PaymentStatus } from '@/lib/validations/order';

// Типы данных
interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    images: { url: string }[];
  };
}

interface OrderUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  subtotal: number;
  discount: number;
  deliveryCost: number;
  deliveryAddress: string | null;
  deliveryMethod: string;
  paymentMethod: string;
  notes: string | null;
  trackingNumber: string | null;
  source: string | null;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: OrderUser;
  warehouse: {
    id: string;
    name: string;
    city: string;
  } | null;
  supplier: {
    id: string;
    name: string;
  } | null;
  items: OrderItem[];
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

// Константы
const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: 'PENDING', label: 'Ожидает' },
  { value: 'CONFIRMED', label: 'Подтверждён' },
  { value: 'PAID', label: 'Оплачен' },
  { value: 'SHIPPING', label: 'В пути' },
  { value: 'DELIVERED', label: 'Доставлен' },
  { value: 'CANCELLED', label: 'Отменён' },
  { value: 'REFUNDED', label: 'Возвращён' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'Все оплаты' },
  { value: 'PENDING', label: 'Ожидает' },
  { value: 'PAID', label: 'Оплачен' },
  { value: 'FAILED', label: 'Ошибка' },
  { value: 'REFUNDED', label: 'Возвращён' },
];

const ORDER_STATUS_COLORS: Record<OrderStatus, 'gray' | 'blue' | 'yellow' | 'orange' | 'green' | 'red'> = {
  PENDING: 'gray',
  CONFIRMED: 'blue',
  PAID: 'green',
  SHIPPING: 'orange',
  DELIVERED: 'green',
  CANCELLED: 'red',
  REFUNDED: 'red',
};

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, 'gray' | 'green' | 'red' | 'yellow'> = {
  PENDING: 'gray',
  PAID: 'green',
  FAILED: 'red',
  REFUNDED: 'yellow',
};

// Утилита для форматирования даты
function formatDate(date: Date | string | null, showTime = false) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(showTime && { hour: '2-digit', minute: '2-digit' }),
  });
}

// Утилита для форматирования суммы
function formatMoney(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// Компонент бейджа статуса заказа
function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const labels: Record<OrderStatus, string> = {
    PENDING: 'Ожидает',
    CONFIRMED: 'Подтверждён',
    PAID: 'Оплачен',
    SHIPPING: 'В пути',
    DELIVERED: 'Доставлен',
    CANCELLED: 'Отменён',
    REFUNDED: 'Возвращён',
  };

  return (
    <Badge variant={ORDER_STATUS_COLORS[status]}>
      {labels[status]}
    </Badge>
  );
}

// Компонент бейджа статуса оплаты
function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const labels: Record<PaymentStatus, string> = {
    PENDING: 'Ожидает',
    PAID: 'Оплачен',
    FAILED: 'Ошибка',
    REFUNDED: 'Возвращён',
  };

  return (
    <Badge variant={PAYMENT_STATUS_COLORS[status]}>
      {labels[status]}
    </Badge>
  );
}

// Компонент модального окна
function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-black2 border border-gray1 rounded-[var(--radius)] w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col',
          sizeClasses[size]
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray1 flex-shrink-0">
          <h2 className="font-display text-[18px] font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray4 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// Компонент Toast уведомления
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  const icons = {
    success: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  };

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-[var(--radius)] text-white shadow-lg animate-in slide-in-from-bottom-4 fade-in',
        bgColors[type]
      )}
    >
      {icons[type]}
      <span className="text-[13px] font-semibold">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// Компонент страницы заказов (требует useSearchParams)
function OrdersPageContent() {
  // Состояния
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Фильтры
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Модалки
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<{ id: string; number: string } | null>(null);

  // Смена статуса
  const [newStatus, setNewStatus] = useState<OrderStatus>('PENDING');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Удаление
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Загрузка заказов
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '20');

      if (statusFilter) params.set('status', statusFilter);
      if (paymentFilter) params.set('paymentStatus', paymentFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);

      const response = await fetch(`/api/admin/orders?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Не удалось загрузить заказы');
      }

      const data: OrdersResponse = await response.json();
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setTotalOrders(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, paymentFilter, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Обновление URL параметров
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (statusFilter) params.set('status', statusFilter);
    if (paymentFilter) params.set('paymentStatus', paymentFilter);
    if (debouncedSearch) params.set('search', debouncedSearch);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [currentPage, statusFilter, paymentFilter, debouncedSearch]);

  // Обработчики фильтров
  const handleResetFilters = () => {
    setStatusFilter('');
    setPaymentFilter('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Открытие деталей заказа
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewPaymentStatus(order.paymentStatus);
    setIsDetailsModalOpen(true);
  };

  // Открытие модалки смены статуса
  const handleOpenStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewPaymentStatus(order.paymentStatus);
    setIsStatusModalOpen(true);
  };

  // Сохранение нового статуса
  const handleSaveStatus = async () => {
    if (!selectedOrder) return;

    setUpdatingStatus(true);

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newPaymentStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Не удалось обновить статус');
      }

      setToast({ message: 'Статус заказа обновлён', type: 'success' });
      setIsStatusModalOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Ошибка при обновлении',
        type: 'error',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Открытие модалки удаления
  const handleOpenDeleteModal = (order: Order) => {
    setOrderToDelete({ id: order.id, number: order.orderNumber });
    setIsDeleteModalOpen(true);
  };

  // Удаление заказа
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/orders/${orderToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || 'Не удалось удалить заказ');
      }

      setToast({ message: 'Заказ удалён', type: 'success' });
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
      fetchOrders();
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Ошибка при удалении',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Закрытие модалки деталей
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOrder(null);
  };

  // Активные фильтры (для отображения количества)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter) count++;
    if (paymentFilter) count++;
    if (debouncedSearch) count++;
    return count;
  }, [statusFilter, paymentFilter, debouncedSearch]);

  return (
    <div className="p-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[20px] font-bold text-white mb-1">Заказы</h1>
          <p className="text-[13px] text-gray4">Управление заказами клиентов</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="gray">
            Всего: {totalOrders}
          </Badge>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Поиск */}
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Поиск по номеру или email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Фильтр по статусу */}
          <div className="w-[180px]">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={ORDER_STATUS_OPTIONS}
            />
          </div>

          {/* Фильтр по оплате */}
          <div className="w-[160px]">
            <Select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={PAYMENT_STATUS_OPTIONS}
            />
          </div>

          {/* Кнопка сброса */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="flex-shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-1">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Сбросить ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>

      {/* Таблица заказов */}
      <div className="bg-black2 border border-gray1 rounded-[var(--radius)] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin mb-3" />
            <div className="text-[14px] text-gray4">Загрузка заказов...</div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 mx-auto mb-3 text-red-500">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="text-[14px] text-red-400">{error}</div>
            <Button variant="outline" size="sm" onClick={fetchOrders} className="mt-4">
              Повторить
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 mx-auto mb-3 text-gray4">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <div className="text-[14px] text-gray4">Заказы не найдены</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray1">
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray3 px-4 py-3">
                      Номер заказа
                    </th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray3 px-4 py-3">
                      Клиент
                    </th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray3 px-4 py-3">
                      Сумма
                    </th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray3 px-4 py-3">
                      Статус заказа
                    </th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray3 px-4 py-3">
                      Статус оплаты
                    </th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray3 px-4 py-3">
                      Источник
                    </th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray3 px-4 py-3">
                      Дата
                    </th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-wider text-gray3 px-4 py-3">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray1/50 hover:bg-black3 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-[13px] font-semibold text-orange hover:text-orange2 transition-colors"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[13px] text-white font-medium">
                          {order.user.name || 'Без имени'}
                        </div>
                        <div className="text-[11px] text-gray4">
                          {order.user.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[13px] font-bold text-white">
                          {formatMoney(order.total)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-4 py-3">
                        {order.source ? (
                          <span className={cn(
                            'text-[10px] font-bold px-[6px] py-[2px] rounded-[var(--radius)]',
                            order.source === 'WAREHOUSE'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-orange/10 text-orange'
                          )}>
                            {order.source === 'WAREHOUSE' ? 'Склад' : 'Поставщик'}
                          </span>
                        ) : (
                          <span className="text-[12px] text-gray4">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[12px] text-gray3">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                            title="Просмотр"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenStatusModal(order)}
                            title="Изменить статус"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDeleteModal(order)}
                            title="Удалить"
                            className="text-red-400 hover:text-red-300"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Пагинация */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Модалка деталей заказа */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          title={`Заказ ${selectedOrder.orderNumber}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Основная информация */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-gray4 mb-1">Статус заказа</div>
                <OrderStatusBadge status={selectedOrder.status} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-gray4 mb-1">Статус оплаты</div>
                <PaymentStatusBadge status={selectedOrder.paymentStatus} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-gray4 mb-1">Дата создания</div>
                <div className="text-[13px] text-white">{formatDate(selectedOrder.createdAt, true)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-gray4 mb-1">Сумма</div>
                <div className="text-[15px] font-bold text-orange">{formatMoney(selectedOrder.total)}</div>
              </div>
            </div>

            {/* Информация о клиенте */}
            <div className="bg-black3 border border-gray1 rounded-[var(--radius)] p-4">
              <h3 className="font-display text-[14px] font-bold text-white mb-3 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Информация о клиенте
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] text-gray4">Имя</div>
                  <div className="text-[13px] text-white">{selectedOrder.user.name || '—'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray4">Email</div>
                  <div className="text-[13px] text-white">{selectedOrder.user.email}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray4">Телефон</div>
                  <div className="text-[13px] text-white">{selectedOrder.user.phone || '—'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray4">Роль</div>
                  <div className="text-[13px] text-white">{selectedOrder.user.role}</div>
                </div>
              </div>
            </div>

            {/* Адрес доставки */}
            {selectedOrder.deliveryAddress && (
              <div className="bg-black3 border border-gray1 rounded-[var(--radius)] p-4">
                <h3 className="font-display text-[14px] font-bold text-white mb-3 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Адрес доставки
                </h3>
                <div className="text-[13px] text-white">{selectedOrder.deliveryAddress}</div>
              </div>
            )}

            {/* Товары */}
            <div className="bg-black3 border border-gray1 rounded-[var(--radius)] p-4">
              <h3 className="font-display text-[14px] font-bold text-white mb-3 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Товары ({selectedOrder.items.length})
              </h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-black2 border border-gray1 rounded-[var(--radius)]"
                  >
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-[var(--radius)]"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray1 rounded-[var(--radius)] flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-gray4">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-white truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] text-gray4">
                        Артикул: {item.product.sku}
                      </div>
                    </div>
                    <div className="text-[13px] text-gray4">
                      {item.quantity} × {formatMoney(item.price)}
                    </div>
                    <div className="text-[13px] font-bold text-white min-w-[80px] text-right">
                      {formatMoney(item.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Суммы */}
            <div className="bg-black3 border border-gray1 rounded-[var(--radius)] p-4">
              <h3 className="font-display text-[14px] font-bold text-white mb-3 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Суммы
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray4">Подытог:</span>
                  <span className="text-white">{formatMoney(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray4">Скидка:</span>
                    <span className="text-green-400">-{formatMoney(selectedOrder.discount)}</span>
                  </div>
                )}
                {selectedOrder.deliveryCost > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray4">Доставка:</span>
                    <span className="text-white">{formatMoney(selectedOrder.deliveryCost)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[15px] font-bold pt-2 border-t border-gray1 mt-2">
                  <span className="text-white">Итого:</span>
                  <span className="text-orange">{formatMoney(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Заметки */}
            {selectedOrder.notes && (
              <div className="bg-black3 border border-gray1 rounded-[var(--radius)] p-4">
                <h3 className="font-display text-[14px] font-bold text-white mb-2">Заметки</h3>
                <div className="text-[13px] text-gray3">{selectedOrder.notes}</div>
              </div>
            )}

            {/* Кнопки действий */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray1">
              <Button variant="ghost" onClick={handleCloseDetailsModal}>
                Закрыть
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleOpenStatusModal(selectedOrder);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Изменить статус
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Модалка смены статуса */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedOrder(null);
        }}
        title="Изменить статус заказа"
        size="sm"
      >
        <div className="space-y-4">
          {selectedOrder && (
            <>
              <div className="bg-black3 border border-gray1 rounded-[var(--radius)] p-3 mb-4">
                <div className="text-[11px] text-gray4 mb-1">Заказ</div>
                <div className="text-[14px] font-bold text-white">{selectedOrder.orderNumber}</div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray3 mb-2">
                  Статус заказа
                </label>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  options={[
                    { value: 'PENDING', label: 'Ожидает' },
                    { value: 'CONFIRMED', label: 'Подтверждён' },
                    { value: 'PAID', label: 'Оплачен' },
                    { value: 'SHIPPING', label: 'В пути' },
                    { value: 'DELIVERED', label: 'Доставлен' },
                    { value: 'CANCELLED', label: 'Отменён' },
                    { value: 'REFUNDED', label: 'Возвращён' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray3 mb-2">
                  Статус оплаты
                </label>
                <Select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                  options={[
                    { value: 'PENDING', label: 'Ожидает' },
                    { value: 'PAID', label: 'Оплачен' },
                    { value: 'FAILED', label: 'Ошибка' },
                    { value: 'REFUNDED', label: 'Возвращён' },
                  ]}
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsStatusModalOpen(false);
                    setSelectedOrder(null);
                  }}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveStatus}
                  disabled={updatingStatus}
                  className="flex-1"
                >
                  {updatingStatus ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    'Сохранить изменения'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Модалка подтверждения удаления */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setOrderToDelete(null);
        }}
        title="Подтверждение удаления"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-red-500">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-bold text-white mb-1">
                Удалить заказ?
              </div>
              <div className="text-[12px] text-gray4">
                {orderToDelete && `Заказ ${orderToDelete.number} будет удалён безвозвратно`}
              </div>
            </div>
          </div>

          <div className="bg-black3 border border-gray1 rounded-[var(--radius)] p-3">
            <div className="text-[11px] text-yellow-500 flex items-start gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>
                Товары вернутся на склад, бонусы будут возвращены клиенту
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setOrderToDelete(null);
              }}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteOrder}
              disabled={deleting}
              className="flex-1"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Удаление...
                </>
              ) : (
                'Удалить'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast уведомления */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// Главный компонент с Suspense границей
export default function AdminOrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center text-gray4">
          <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div>Загрузка...</div>
        </div>
      </div>
    }>
      <OrdersPageContent />
    </Suspense>
  );
}
