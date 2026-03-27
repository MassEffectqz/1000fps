'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useCreateOrder, useCart } from '@/hooks/useApi';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cartData } = useCart();
  const { isAuthenticated } = useAuthStore();
  const createOrder = useCreateOrder();

  const cart = cartData?.cart;
  const cartItems = cart?.items || [];
  const removeItem = async (itemId: number) => {
    // TODO: implement remove from checkout
    console.log('Remove item:', itemId);
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    street: '',
    building: '',
    apartment: '',
    zipCode: '',
    comment: '',
    shippingMethod: 'pickup',
    paymentMethod: 'card',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = cartItems.reduce(
    (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = formData.shippingMethod === 'pickup' ? 0 : 500;
  const total = subtotal + shippingCost;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = 'Введите имя';
    if (!formData.lastName) newErrors.lastName = 'Введите фамилию';
    if (!formData.email) newErrors.email = 'Введите email';
    if (!formData.phone) newErrors.phone = 'Введите телефон';
    if (!formData.city) newErrors.city = 'Введите город';
    if (!formData.street) newErrors.street = 'Введите улицу';
    if (!formData.building) newErrors.building = 'Введите дом';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;
    if (cartItems.length === 0) return;

    try {
      const order = await createOrder.mutateAsync({
        shippingAddress: {
          city: formData.city,
          street: formData.street,
          building: formData.building,
          apartment: formData.apartment,
          zipCode: formData.zipCode,
        },
        shippingMethod: formData.shippingMethod,
        paymentMethod: formData.paymentMethod,
        comment: formData.comment,
      });

      router.push(`/orders/${order.id}?success=1`);
    } catch (err) {
      console.error('Failed to create order:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--white2)' }}>
          Оформление заказа
        </h1>
        <p style={{ color: 'var(--gray3)', marginBottom: '24px' }}>
          Для оформления заказа необходимо войти в аккаунт
        </p>
        <Link
          href="/auth/login"
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            padding: '12px 32px',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            borderRadius: 'var(--radius)',
            background: 'var(--orange)',
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          Войти
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--white2)' }}>
          Корзина пуста
        </h1>
        <p style={{ color: 'var(--gray3)', marginBottom: '24px' }}>
          Добавьте товары для оформления заказа
        </p>
        <Link
          href="/catalog"
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            padding: '12px 32px',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            borderRadius: 'var(--radius)',
            background: 'var(--orange)',
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ background: 'var(--black2)', borderBottom: '1px solid var(--gray1)' }}>
        <div className="container">
          <div
            className="breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 0',
              fontSize: '12px',
              color: 'var(--gray3)',
            }}
          >
            <Link href="/" style={{ color: 'var(--gray3)', textDecoration: 'none' }}>
              Главная
            </Link>
            <span className="breadcrumb__sep" style={{ color: 'var(--gray2)' }}>
              /
            </span>
            <Link href="/cart" style={{ color: 'var(--gray3)', textDecoration: 'none' }}>
              Корзина
            </Link>
            <span className="breadcrumb__sep" style={{ color: 'var(--gray2)' }}>
              /
            </span>
            <span style={{ color: 'var(--white)' }}>Оформление заказа</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '0 20px 40px' }}>
        <h1
          style={{
            fontSize: 'clamp(20px, 2.5vw, 28px)',
            margin: '28px 0 24px',
            color: 'var(--white2)',
          }}
        >
          Оформление заказа
        </h1>

        <form onSubmit={handleSubmit}>
          <div
            className="checkout-layout"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 380px',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* Left column - Forms */}
            <div
              className="checkout-forms"
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              {/* Contact Info */}
              <div
                className="checkout-section"
                style={{
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                }}
              >
                <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--white2)' }}>
                  Контактная информация
                </h2>
                <div
                  className="form-row"
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        color: 'var(--gray3)',
                        marginBottom: '6px',
                      }}
                    >
                      Имя *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={`input ${errors.firstName ? 'input--error' : ''}`}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'var(--black3)',
                        border: `1px solid ${errors.firstName ? 'var(--orange)' : 'var(--gray1)'}`,
                        borderRadius: 'var(--radius)',
                        color: 'var(--white)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                    {errors.firstName && (
                      <span style={{ fontSize: '11px', color: 'var(--orange)' }}>
                        {errors.firstName}
                      </span>
                    )}
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        color: 'var(--gray3)',
                        marginBottom: '6px',
                      }}
                    >
                      Фамилия *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className={`input ${errors.lastName ? 'input--error' : ''}`}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'var(--black3)',
                        border: `1px solid ${errors.lastName ? 'var(--orange)' : 'var(--gray1)'}`,
                        borderRadius: 'var(--radius)',
                        color: 'var(--white)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                    {errors.lastName && (
                      <span style={{ fontSize: '11px', color: 'var(--orange)' }}>
                        {errors.lastName}
                      </span>
                    )}
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        color: 'var(--gray3)',
                        marginBottom: '6px',
                      }}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`input ${errors.email ? 'input--error' : ''}`}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'var(--black3)',
                        border: `1px solid ${errors.email ? 'var(--orange)' : 'var(--gray1)'}`,
                        borderRadius: 'var(--radius)',
                        color: 'var(--white)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                    {errors.email && (
                      <span style={{ fontSize: '11px', color: 'var(--orange)' }}>
                        {errors.email}
                      </span>
                    )}
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        color: 'var(--gray3)',
                        marginBottom: '6px',
                      }}
                    >
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`input ${errors.phone ? 'input--error' : ''}`}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'var(--black3)',
                        border: `1px solid ${errors.phone ? 'var(--orange)' : 'var(--gray1)'}`,
                        borderRadius: 'var(--radius)',
                        color: 'var(--white)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                    {errors.phone && (
                      <span style={{ fontSize: '11px', color: 'var(--orange)' }}>
                        {errors.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div
                className="checkout-section"
                style={{
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                }}
              >
                <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--white2)' }}>
                  Адрес доставки
                </h2>
                <div
                  className="form-row"
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        color: 'var(--gray3)',
                        marginBottom: '6px',
                      }}
                    >
                      Город *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`input ${errors.city ? 'input--error' : ''}`}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'var(--black3)',
                        border: `1px solid ${errors.city ? 'var(--orange)' : 'var(--gray1)'}`,
                        borderRadius: 'var(--radius)',
                        color: 'var(--white)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                    {errors.city && (
                      <span style={{ fontSize: '11px', color: 'var(--orange)' }}>
                        {errors.city}
                      </span>
                    )}
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        color: 'var(--gray3)',
                        marginBottom: '6px',
                      }}
                    >
                      Почтовый индекс
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'var(--black3)',
                        border: '1px solid var(--gray1)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--white)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        color: 'var(--gray3)',
                        marginBottom: '6px',
                      }}
                    >
                      Улица *
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className={`input ${errors.street ? 'input--error' : ''}`}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'var(--black3)',
                        border: `1px solid ${errors.street ? 'var(--orange)' : 'var(--gray1)'}`,
                        borderRadius: 'var(--radius)',
                        color: 'var(--white)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                    {errors.street && (
                      <span style={{ fontSize: '11px', color: 'var(--orange)' }}>
                        {errors.street}
                      </span>
                    )}
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        color: 'var(--gray3)',
                        marginBottom: '6px',
                      }}
                    >
                      Дом *
                    </label>
                    <input
                      type="text"
                      value={formData.building}
                      onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      className={`input ${errors.building ? 'input--error' : ''}`}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'var(--black3)',
                        border: `1px solid ${errors.building ? 'var(--orange)' : 'var(--gray1)'}`,
                        borderRadius: 'var(--radius)',
                        color: 'var(--white)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                    {errors.building && (
                      <span style={{ fontSize: '11px', color: 'var(--orange)' }}>
                        {errors.building}
                      </span>
                    )}
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        color: 'var(--gray3)',
                        marginBottom: '6px',
                      }}
                    >
                      Квартира/офис
                    </label>
                    <input
                      type="text"
                      value={formData.apartment}
                      onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'var(--black3)',
                        border: '1px solid var(--gray1)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--white)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div
                className="checkout-section"
                style={{
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                }}
              >
                <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--white2)' }}>
                  Способ доставки
                </h2>
                <div className="radio-group" style={{ display: 'flex', gap: '12px' }}>
                  <label
                    className="radio-card"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background:
                        formData.shippingMethod === 'pickup' ? 'var(--black3)' : 'transparent',
                      border: `1px solid ${formData.shippingMethod === 'pickup' ? 'var(--orange)' : 'var(--gray1)'}`,
                      borderRadius: 'var(--radius)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="pickup"
                      checked={formData.shippingMethod === 'pickup'}
                      onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                      style={{ accentColor: 'var(--orange)' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white2)' }}>
                        Самовывоз
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gray3)' }}>Бесплатно</div>
                    </div>
                  </label>
                  <label
                    className="radio-card"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background:
                        formData.shippingMethod === 'delivery' ? 'var(--black3)' : 'transparent',
                      border: `1px solid ${formData.shippingMethod === 'delivery' ? 'var(--orange)' : 'var(--gray1)'}`,
                      borderRadius: 'var(--radius)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="delivery"
                      checked={formData.shippingMethod === 'delivery'}
                      onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                      style={{ accentColor: 'var(--orange)' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white2)' }}>
                        Доставка
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gray3)' }}>500 ₽</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Method */}
              <div
                className="checkout-section"
                style={{
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                }}
              >
                <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--white2)' }}>
                  Способ оплаты
                </h2>
                <div className="radio-group" style={{ display: 'flex', gap: '12px' }}>
                  <label
                    className="radio-card"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background:
                        formData.paymentMethod === 'card' ? 'var(--black3)' : 'transparent',
                      border: `1px solid ${formData.paymentMethod === 'card' ? 'var(--orange)' : 'var(--gray1)'}`,
                      borderRadius: 'var(--radius)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      style={{ accentColor: 'var(--orange)' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white2)' }}>
                        Картой онлайн
                      </div>
                    </div>
                  </label>
                  <label
                    className="radio-card"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background:
                        formData.paymentMethod === 'cash' ? 'var(--black3)' : 'transparent',
                      border: `1px solid ${formData.paymentMethod === 'cash' ? 'var(--orange)' : 'var(--gray1)'}`,
                      borderRadius: 'var(--radius)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      style={{ accentColor: 'var(--orange)' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white2)' }}>
                        При получении
                      </div>
                    </div>
                  </label>
                  <label
                    className="radio-card"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background:
                        formData.paymentMethod === 'bonus' ? 'var(--black3)' : 'transparent',
                      border: `1px solid ${formData.paymentMethod === 'bonus' ? 'var(--orange)' : 'var(--gray1)'}`,
                      borderRadius: 'var(--radius)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bonus"
                      checked={formData.paymentMethod === 'bonus'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      style={{ accentColor: 'var(--orange)' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white2)' }}>
                        Бонусами
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Comment */}
              <div
                className="checkout-section"
                style={{
                  background: 'var(--black2)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                }}
              >
                <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--white2)' }}>
                  Комментарий к заказу
                </h2>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Необязательное поле"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'var(--black3)',
                    border: '1px solid var(--gray1)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--white)',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            {/* Right column - Order Summary */}
            <div
              className="checkout-summary"
              style={{
                background: 'var(--black2)',
                border: '1px solid var(--gray1)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                position: 'sticky',
                top: '16px',
              }}
            >
              <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--white2)' }}>
                Ваш заказ
              </h2>

              <div
                className="summary-items"
                style={{ maxHeight: '320px', overflowY: 'auto', marginBottom: '16px' }}
              >
                {cartItems.map((item: { id: number; product?: { name: string; slug: string; mainImageUrl?: string }; price: number; quantity: number }) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px 0',
                      borderBottom: '1px solid var(--gray1)',
                    }}
                  >
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--black3)',
                        border: '1px solid var(--gray1)',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.product?.mainImageUrl ? (
                        <img
                          src={item.product.mainImageUrl}
                          alt={item.product.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <svg
                          viewBox="0 0 60 60"
                          fill="none"
                          style={{ width: '40px', height: '40px' }}
                        >
                          <rect
                            x="5"
                            y="15"
                            width="50"
                            height="30"
                            rx="2"
                            stroke="var(--gray2)"
                            strokeWidth="2"
                          />
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        href={`/product/${item.product?.slug || '#'}`}
                        style={{
                          fontSize: '12px',
                          color: 'var(--white)',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textDecoration: 'none',
                        }}
                      >
                        {item.product?.name}
                      </Link>
                      <div style={{ fontSize: '11px', color: 'var(--gray3)', marginTop: '4px' }}>
                        {item.quantity} × {item.price.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      style={{
                        width: '20px',
                        height: '20px',
                        flexShrink: 0,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--gray3)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ width: '14px', height: '14px' }}
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div
                className="summary-totals"
                style={{ borderTop: '1px solid var(--gray1)', paddingTop: '16px' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    fontSize: '13px',
                    color: 'var(--gray4)',
                  }}
                >
                  <span>Подытог:</span>
                  <span>{subtotal.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    fontSize: '13px',
                    color: 'var(--gray4)',
                  }}
                >
                  <span>Доставка:</span>
                  <span>{shippingCost === 0 ? 'Бесплатно' : `${shippingCost} ₽`}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--gray1)',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--white2)',
                  }}
                >
                  <span>Итого:</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px' }}>
                    {total.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '14px 24px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  borderRadius: 'var(--radius)',
                  background: 'var(--orange)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Оформить заказ
              </button>

              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--gray3)',
                  textAlign: 'center',
                  marginTop: '12px',
                }}
              >
                Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
