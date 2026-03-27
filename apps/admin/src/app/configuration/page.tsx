'use client';

import { useState } from 'react';
import { useSettings, useUpdateSettings } from '@/hooks/useApi';

interface Settings {
  siteName: string;
  contactEmail: string;
  phone: string;
  currency: string;
  language: string;
  description: string;
  minOrderAmount: number;
  freeShippingThreshold: number;
  reservationHours: number;
  productsPerPage: number;
  lowStockThreshold: number;
  productCacheMinutes: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export default function ConfigurationPanel() {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<Partial<Settings>>({});

  const { data: settingsData, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const settings = ((settingsData as unknown as { data?: Settings })?.data) || {
    siteName: '1000FPS',
    contactEmail: 'info@1000fps.ru',
    phone: '8-800-555-35-35',
    currency: 'RUB',
    language: 'ru',
    description: 'Интернет-магазин компьютерной техники 1000FPS',
    minOrderAmount: 1000,
    freeShippingThreshold: 5000,
    reservationHours: 24,
    productsPerPage: 24,
    lowStockThreshold: 5,
    productCacheMinutes: 60,
    emailNotifications: true,
    smsNotifications: false,
  };

  const handleChange = (key: keyof Settings, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (Object.keys(formData).length > 0) {
      updateMutation.mutate(formData);
      setFormData({});
    }
  };

  if (isLoading) {
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
        Загрузка настроек...
      </div>
    );
  }

  const currentValue = <K extends keyof Settings>(key: K): Settings[K] => formData[key] ?? settings[key];

  return (
    <>
      {/* HEADER */}
      <div className="mb-16">
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
          Конфигурация
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Настройки сайта и параметры</p>
      </div>

      {/* TABS */}
      <div className="tabs mb-16">
        <button
          className={`tab ${activeTab === 'general' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          Общие
        </button>
        <button
          className={`tab ${activeTab === 'orders' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Заказы
        </button>
        <button
          className={`tab ${activeTab === 'products' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Товары
        </button>
        <button
          className={`tab ${activeTab === 'notifications' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Уведомления
        </button>
      </div>

      {/* GENERAL SETTINGS */}
      {activeTab === 'general' && (
        <div className="card">
          <div className="card__head">
            <span className="card__title">Общие настройки</span>
          </div>
          <div className="card__body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Название сайта</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentValue('siteName')}
                  onChange={(e) => handleChange('siteName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email для связи</label>
                <input
                  type="email"
                  className="form-input"
                  value={currentValue('contactEmail')}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row--3">
              <div className="form-group">
                <label className="form-label">Телефон</label>
                <input
                  type="tel"
                  className="form-input"
                  value={currentValue('phone')}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Валюта</label>
                <select
                  className="form-select"
                  value={currentValue('currency')}
                  onChange={(e) => handleChange('currency', e.target.value)}
                >
                  <option value="RUB">RUB (₽)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Язык</label>
                <select
                  className="form-select"
                  value={currentValue('language')}
                  onChange={(e) => handleChange('language', e.target.value)}
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Описание сайта</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={currentValue('description')}
                onChange={(e) => handleChange('description', e.target.value)}
              ></textarea>
            </div>

            <div className="flex mt-16" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn--primary" onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER SETTINGS */}
      {activeTab === 'orders' && (
        <div className="card">
          <div className="card__head">
            <span className="card__title">Настройки заказов</span>
          </div>
          <div className="card__body">
            <div className="form-row--3">
              <div className="form-group">
                <label className="form-label">Минимальная сумма заказа (₽)</label>
                <input
                  type="number"
                  className="form-input"
                  value={currentValue('minOrderAmount')}
                  onChange={(e) => handleChange('minOrderAmount', Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Бесплатная доставка от (₽)</label>
                <input
                  type="number"
                  className="form-input"
                  value={currentValue('freeShippingThreshold')}
                  onChange={(e) => handleChange('freeShippingThreshold', Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Резерв товаров (часов)</label>
                <input
                  type="number"
                  className="form-input"
                  value={currentValue('reservationHours')}
                  onChange={(e) => handleChange('reservationHours', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group mt-16">
              <label className="form-label">Статусы заказов</label>
              <div className="cat-tree">
                {[
                  'PENDING',
                  'CONFIRMED',
                  'PAID',
                  'ASSEMBLING',
                  'SHIPPED',
                  'DELIVERING',
                  'DELIVERED',
                  'CANCELLED',
                ].map((status) => (
                  <div key={status} className="cat-row" style={{ padding: '8px 16px' }}>
                    <span className="cat-label">{status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex mt-16" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn--primary" onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT SETTINGS */}
      {activeTab === 'products' && (
        <div className="card">
          <div className="card__head">
            <span className="card__title">Настройки товаров</span>
          </div>
          <div className="card__body">
            <div className="form-row--3">
              <div className="form-group">
                <label className="form-label">Товаров на странице</label>
                <input
                  type="number"
                  className="form-input"
                  value={currentValue('productsPerPage')}
                  onChange={(e) => handleChange('productsPerPage', Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Порог &quot;Мало товара&quot;</label>
                <input
                  type="number"
                  className="form-input"
                  value={currentValue('lowStockThreshold')}
                  onChange={(e) => handleChange('lowStockThreshold', Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Кэш товаров (минут)</label>
                <input
                  type="number"
                  className="form-input"
                  value={currentValue('productCacheMinutes')}
                  onChange={(e) => handleChange('productCacheMinutes', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group mt-16">
              <label className="form-label">Группы характеристик</label>
              <div className="cat-tree">
                {['Основные', 'Технические', 'Габариты', 'Дополнительно'].map((group) => (
                  <div key={group} className="cat-row" style={{ padding: '8px 16px' }}>
                    <span className="cat-label">{group}</span>
                    <div className="flex gap-6">
                      <button className="tbl-btn">
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
                      </button>
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
                  </div>
                ))}
              </div>
            </div>

            <div className="flex mt-16" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn--primary" onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION SETTINGS */}
      {activeTab === 'notifications' && (
        <div className="card">
          <div className="card__head">
            <span className="card__title">Настройки уведомлений</span>
          </div>
          <div className="card__body">
            <div className="cat-tree">
              <div className="cat-row cat-row--root">
                <span className="cat-label">Email уведомления</span>
                <input
                  type="checkbox"
                  checked={currentValue('emailNotifications')}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  style={{ marginLeft: 'auto' }}
                />
              </div>
              <div className="cat-row cat-row--child">
                <span className="cat-label">Новый заказ</span>
                <input type="checkbox" defaultChecked style={{ marginLeft: 'auto' }} />
              </div>
              <div className="cat-row cat-row--child">
                <span className="cat-label">Статус заказа изменён</span>
                <input type="checkbox" defaultChecked style={{ marginLeft: 'auto' }} />
              </div>
              <div className="cat-row cat-row--child">
                <span className="cat-label">Мало товара на складе</span>
                <input type="checkbox" defaultChecked style={{ marginLeft: 'auto' }} />
              </div>

              <div className="cat-row cat-row--root" style={{ marginTop: '16px' }}>
                <span className="cat-label">SMS уведомления</span>
                <input
                  type="checkbox"
                  checked={currentValue('smsNotifications')}
                  onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                  style={{ marginLeft: 'auto' }}
                />
              </div>
              <div className="cat-row cat-row--child">
                <span className="cat-label">Новый заказ</span>
                <input type="checkbox" style={{ marginLeft: 'auto' }} />
              </div>
              <div className="cat-row cat-row--child">
                <span className="cat-label">Статус заказа изменён</span>
                <input type="checkbox" style={{ marginLeft: 'auto' }} />
              </div>
            </div>

            <div className="flex mt-16" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn--primary" onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
