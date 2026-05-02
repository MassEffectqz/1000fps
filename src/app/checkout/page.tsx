'use client';

import { useCart } from '@/lib/context/cart-context';
import { Breadcrumbs, Button } from '@/components/ui';
import { getWarehousesWithStock, type WarehouseWithStock } from '@/lib/actions/warehouse';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

interface SessionUser {
  user?: {
    id: string;
    email?: string;
    name?: string;
  } | null;
}

interface Supplier {
  id: string;
  name: string;
  url: string;
  price: number;
  oldPrice: number | null;
  deliveryTime: string | null;
  inStock: boolean;
  rating: number | null;
  reviewsCount: number | null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoading: cartLoading, clearCart } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseWithStock[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load profile and warehouses
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load session
        const sessionRes = await fetch('/api/auth/session');
        const sessionData: SessionUser = await sessionRes.json();
        
        if (!sessionData.user) {
          router.push(`/auth/login?redirect=/checkout`);
          return;
        }
        
        setIsAuthenticated(true);
        
        // Load profile
        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.success && profileData.user) {
            setFormData((prev) => ({
              ...prev,
              name: profileData.user.name || sessionData.user?.name || '',
              email: profileData.user.email || sessionData.user?.email || '',
              phone: profileData.user.phone || '',
            }));
          }
        }

        // Load warehouses and suppliers for all cart items
        if (cart.items.length > 0) {
          // Get unique product IDs from cart
          const productIds = [...new Set(cart.items.map(item => item.productId))];
          
          // Load warehouses for first product (for simplicity - same warehouses available for all)
          const firstProductId = cart.items[0]?.productId;
          if (firstProductId) {
            const whData = await getWarehousesWithStock(firstProductId);
            if (whData?.warehouses) {
              setWarehouses(whData.warehouses);
              // Auto-select first warehouse with stock (if no supplier selected)
              if (!selectedSupplier) {
                const firstWithStock = whData.warehouses.find((w: WarehouseWithStock) => w.quantity > 0);
                if (firstWithStock) {
                  setSelectedWarehouse(firstWithStock.id);
                }
              }
            }
          }

          // Load suppliers from all products in cart
          const allSuppliers: Supplier[] = [];
          for (const productId of productIds) {
            const supplierRes = await fetch(`/api/public/products/${productId}/suppliers`);
            if (supplierRes.ok) {
              const supplierData = await supplierRes.json();
              if (supplierData.ok && supplierData.data) {
                allSuppliers.push(...supplierData.data);
              }
            }
          }
          // Deduplicate by ID
          const uniqueSuppliers = allSuppliers.filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i);
          setSuppliers(uniqueSuppliers);
        }
      } catch {
        router.push(`/auth/login?redirect=/checkout`);
      } finally {
        setProfileLoading(false);
      }
    };

    if (!cartLoading) {
      loadData();
    }
  }, [router, cartLoading, cart.items]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Некорректный email';
    }
    if (formData.phone.trim().length < 5) {
      newErrors.phone = 'Укажите номер телефона';
    }

    if (!selectedWarehouse) {
      newErrors.warehouse = 'Выберите пункт самовывоза (склад для доставки)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          warehouseId: selectedWarehouse || null,
          supplierId: selectedSupplier || null,
          paymentMethod: 'CASH',
          deliveryMethod: 'PICKUP',
          deliveryAddress: null,
          notes: formData.notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Ошибка при оформлении заказа');
        return;
      }

      await clearCart();

      if (data.orders && data.orders.length > 1) {
        const orderNumbers = data.orders.map((o: { orderNumber: string }) => o.orderNumber).join(', ');
        router.push(`/orders/success?multiple=true&numbers=${orderNumbers}`);
      } else {
        router.push(`/orders/success?id=${data.order.id}&number=${data.order.orderNumber}`);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Произошла ошибка при оформлении заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading || profileLoading) {
    return (
      <div className="container py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray1 rounded w-48" />
          <div className="h-64 bg-gray1 rounded" />
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <>
        <div className="bg-black2 border-b border-gray1">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Оформление заказа' }]} />
          </div>
        </div>
        <div className="container py-20 text-center">
          <h1 className="font-display text-[28px] font-bold text-white2 mb-4">Корзина пуста</h1>
          <p className="text-gray3 mb-6">Добавьте товары в корзину перед оформлением заказа</p>
          <Link href="/catalog">
            <Button size="lg">Перейти в каталог</Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-black2 border-b border-gray1">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Корзина', href: '/cart' },
              { label: 'Оформление заказа' },
            ]}
          />
        </div>
      </div>

      <div className="container py-6 lg:py-10">
        <h1 className="font-display text-2xl lg:text-[28px] font-bold uppercase text-white2 mb-6 lg:mb-8">
          Оформление заказа
        </h1>

        {(() => {
          const uniqueWarehouses = new Set(cart.items.map(i => i.warehouseId || 'supplier'));
          if (uniqueWarehouses.size > 1) {
            return (
              <div className="bg-orange/10 border border-orange/20 rounded-[var(--radius)] p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-orange flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div>
                    <p className="text-[14px] font-semibold text-orange mb-1">
                      Товары с разных складов
                    </p>
                    <p className="text-[13px] text-gray3">
                      Ваш заказ будет разделён на {uniqueWarehouses.size} отдельных заказов по складам. Каждый заказ нужно будет забрать с соответствующего склада.
                    </p>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Форма */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              {/* Контактные данные */}
              <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4 lg:p-6">
                <h2 className="font-display text-base lg:text-[18px] font-bold text-white2 mb-4">
                  Контактные данные
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] text-gray3 mb-1.5">
                      Имя <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className={`w-full bg-black3 border rounded-[var(--radius)] pl-10 pr-4 py-2.5 text-[14px] text-white2 focus:outline-none focus:border-orange ${
                          errors.name ? 'border-red-500' : 'border-gray1'
                        }`}
                        placeholder="Иван Иванов"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-[12px] text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[13px] text-gray3 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={`w-full bg-black3 border rounded-[var(--radius)] pl-10 pr-4 py-2.5 text-[14px] text-white2 focus:outline-none focus:border-orange ${
                          errors.email ? 'border-red-500' : 'border-gray1'
                        }`}
                        placeholder="email@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[12px] text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[13px] text-gray3 mb-1.5">
                      Телефон <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className={`w-full bg-black3 border rounded-[var(--radius)] pl-10 pr-4 py-2.5 text-[14px] text-white2 focus:outline-none focus:border-orange ${
                          errors.phone ? 'border-red-500' : 'border-gray1'
                        }`}
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[12px] text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

{/* Выбор поставщика */}
              <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4 lg:p-6">
                <h2 className="font-display text-base lg:text-[18px] font-bold text-white2 mb-4">
                  Поставщик
                </h2>
                <div className="space-y-3">
                  {suppliers.length > 0 ? (
                    <select
                      value={selectedSupplier}
                      onChange={(e) => {
                        setSelectedSupplier(e.target.value);
                        if (e.target.value) {
                          setSelectedWarehouse('');
                        }
                      }}
                      className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-2.5 text-[14px] text-white2 focus:border-orange focus:outline-none"
                    >
                      <option value="">Без поставщика (со склада)</option>
                      {suppliers.map((supplier) => {
                        const ratingText = supplier.rating !== null 
                          ? ` • ★ ${supplier.rating.toFixed(1)}${supplier.reviewsCount !== null ? ` (${supplier.reviewsCount} отзывов)` : ''}`
                          : '';
                        return (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name} — {supplier.price.toLocaleString('ru-RU')} ₽{supplier.deliveryTime ? ` • ${supplier.deliveryTime}` : ''}{ratingText}
                          </option>
                        );
                      })}
                    </select>
                  ) : suppliers.length === 0 ? (
                    <p className="text-[13px] text-gray3">Нет доступных поставщиков</p>
                  ) : (
                    <p className="text-[13px] text-gray3">Загрузка поставщиков...</p>
                  )}
                </div>
              </div>

              {/* Самовывоз */}
              <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4 lg:p-6">
                <h2 className="font-display text-base lg:text-[18px] font-bold text-white2 mb-4">
                  Получение заказа
                </h2>
                <div className="space-y-3">
                  {warehouses.length > 0 ? (
                    <select
                      value={selectedWarehouse}
                      onChange={(e) => setSelectedWarehouse(e.target.value)}
                      className={`w-full bg-black3 border rounded-[var(--radius)] px-4 py-2.5 text-[14px] text-white2 focus:border-orange focus:outline-none ${
                        errors.warehouse ? 'border-red-500' : 'border-gray1'
                      }`}
                    >
                      <option value="">Выберите пункт самовывоза</option>
                      {warehouses.map((wh) => {
                        const isAvailable = wh.quantity > 0;
                        const isDisabled = !selectedSupplier && !isAvailable;
                        return (
                          <option key={wh.id} value={wh.id} disabled={isDisabled}>
                            {wh.city} - {wh.name} {!selectedSupplier && (isAvailable ? `(в наличии: ${wh.quantity} шт.)` : '(нет в наличии)')}
                            {selectedSupplier && ' (доставка)'}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <p className="text-[13px] text-gray3">Загрузка складов...</p>
                  )}
                  {errors.warehouse && (
                    <p className="text-[12px] text-red-500 mt-1">{errors.warehouse}</p>
                  )}
                  <p className="text-[13px] text-gray3">
                    {selectedSupplier 
                      ? 'Выберите склад для доставки/самовывоза товара от поставщика'
                      : 'Заберите заказ из нашего магазина после подтверждения готовности'}
                  </p>
                </div>
              </div>

              {/* Оплата */}
              <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4 lg:p-6">
                <h2 className="font-display text-base lg:text-[18px] font-bold text-white2 mb-4">
                  Оплата
                </h2>
                <div className="flex items-start gap-4 p-4 bg-black3 border border-gray1 rounded-[var(--radius)]">
                  <div className="w-10 h-10 bg-orange/10 rounded-[var(--radius)] flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-orange"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[14px] text-white2 font-display font-bold mb-1">
                      Оплата при получении
                    </p>
                    <p className="text-[13px] text-gray3">
                      Оплатите заказ наличными или картой при получении на складе
                    </p>
                  </div>
                </div>
              </div>

              {/* Комментарий */}
              <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4 lg:p-6">
                <h2 className="font-display text-base lg:text-[18px] font-bold text-white2 mb-4">
                  Комментарий к заказу
                </h2>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows={3}
                  className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-2.5 text-[14px] text-white2 focus:outline-none focus:border-orange resize-none"
                  placeholder="Дополнительные пожелания к заказу..."
                  maxLength={1000}
                />
                <p className="text-[11px] text-gray3 mt-1 text-right">
                  {formData.notes.length}/1000
                </p>
              </div>
            </div>

            {/* Итого */}
            <div className="lg:col-span-1">
              <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4 lg:p-6 sticky top-[100px] lg:top-[140px]">
                <h2 className="font-display text-base lg:text-[18px] font-bold uppercase text-white2 mb-4">
                  Ваш заказ
                </h2>

                {/* Товары */}
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 flex-shrink-0 bg-black3 rounded overflow-hidden">
                        {item.product.image && (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-white2 truncate">{item.product.name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-gray3">
                          <span>{item.quantity} × {item.product.finalPrice.toLocaleString('ru-RU')} ₽</span>
                          {item.warehouseId ? (
                            <span className="text-green-500">• Склад</span>
                          ) : (
                            <span className="text-orange">• Поставщик</span>
                          )}
                        </div>
                      </div>
                      <p className="text-[13px] text-white2 font-display font-bold">
                        {(item.product.finalPrice * item.quantity).toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  ))}
                </div>

                {/* Итого */}
                <div className="border-t border-gray1 pt-4 space-y-2 mb-4">
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="text-gray3">Товары ({cart.totalItems})</span>
                    <span className="text-white2">{cart.totalPrice.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="text-gray3">Самовывоз</span>
                    <span className="text-green-500">Бесплатно</span>
                  </div>
                </div>

                <div className="border-t border-gray1 pt-3 lg:pt-4 mb-4 lg:mb-6">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm lg:text-[16px] font-bold text-white2">Итого</span>
                    <span className="font-display text-xl lg:text-[22px] font-bold text-orange">
                      {cart.totalPrice.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Оформляем...' : 'Оформить заказ'}
                </Button>

                <Link href="/cart" className="block mt-3">
                  <Button variant="secondary" fullWidth size="md">
                    Вернуться в корзину
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
