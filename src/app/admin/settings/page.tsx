'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Settings {
  // Общие
  storeName: string;
  storeEmail: string | null;
  storePhone: string | null;
  storeAddress: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  
  // SEO
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  
  // Соцсети
  socialVk: string | null;
  socialTelegram: string | null;
  socialYoutube: string | null;
  
  // Заказы
  defaultOrderStatus: string;
  defaultPaymentStatus: string;
  autoConfirmOrders: boolean;
  allowGuestCheckout: boolean;
  
  // Доставка
  freeShippingThreshold: number | null;
  defaultDeliveryCost: number | null;
  
  // Налоги
  taxRate: number | null;
  taxIncluded: boolean;
  
  // Уведомления
  notifyNewOrderEmail: string | null;
  notifyLowStockThreshold: number | null;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  
  // SMTP
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPassword: string | null;
  smtpFrom: string | null;
}

type TabId = 'general' | 'seo' | 'orders' | 'delivery' | 'notifications' | 'smtp';

const tabs: { id: TabId; label: string }[] = [
  { id: 'general', label: 'Общие' },
  { id: 'seo', label: 'SEO' },
  { id: 'orders', label: 'Заказы' },
  { id: 'delivery', label: 'Доставка' },
  { id: 'notifications', label: 'Уведомления' },
  { id: 'smtp', label: 'SMTP' },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('general');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        setSettings(await response.json());
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Ошибка загрузки настроек');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Настройки сохранены');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка сохранения');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Произошла ошибка при сохранении');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
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

  if (!settings) {
    return (
      <div className="p-6">
        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-12 text-center">
          <div className="text-[16px] font-semibold text-white mb-2">Ошибка загрузки настроек</div>
          <button onClick={loadSettings} className="text-orange hover:underline">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[20px] font-bold text-white mb-1">Настройки</h1>
          <p className="text-[13px] text-gray4">Настройки интернет-магазина</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-[10px] bg-orange text-white rounded-[var(--radius)] text-[13px] font-semibold hover:bg-orange2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-[10px] text-[13px] font-semibold border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-orange text-white'
                : 'border-transparent text-gray4 hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 max-w-3xl">
        {/* Общие настройки */}
        {activeTab === 'general' && (
          <div className="space-y-5">
            <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
              Общая информация
            </h2>
            
            <div>
              <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                Название магазина
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => updateSetting('storeName', e.target.value)}
                className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.storeEmail || ''}
                  onChange={(e) => updateSetting('storeEmail', e.target.value || null)}
                  className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={settings.storePhone || ''}
                  onChange={(e) => updateSetting('storePhone', e.target.value || null)}
                  className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                Адрес
              </label>
              <textarea
                value={settings.storeAddress || ''}
                onChange={(e) => updateSetting('storeAddress', e.target.value || null)}
                rows={2}
                className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                  Логотип (URL)
                </label>
                <input
                  type="url"
                  value={settings.logoUrl || ''}
                  onChange={(e) => updateSetting('logoUrl', e.target.value || null)}
                  className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                  Фавикон (URL)
                </label>
                <input
                  type="url"
                  value={settings.faviconUrl || ''}
                  onChange={(e) => updateSetting('faviconUrl', e.target.value || null)}
                  className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray1">
              <h3 className="font-display text-[12px] font-bold text-white uppercase tracking-wider mb-4">
                Социальные сети
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                    ВКонтакте
                  </label>
                  <input
                    type="url"
                    value={settings.socialVk || ''}
                    onChange={(e) => updateSetting('socialVk', e.target.value || null)}
                    className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                    placeholder="https://vk.com/..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                    Telegram
                  </label>
                  <input
                    type="url"
                    value={settings.socialTelegram || ''}
                    onChange={(e) => updateSetting('socialTelegram', e.target.value || null)}
                    className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                    placeholder="https://t.me/..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                    YouTube
                  </label>
                  <input
                    type="url"
                    value={settings.socialYoutube || ''}
                    onChange={(e) => updateSetting('socialYoutube', e.target.value || null)}
                    className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-5">
            <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
              SEO настройки
            </h2>
            
            <div>
              <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                Заголовок (title)
              </label>
              <input
                type="text"
                value={settings.seoTitle || ''}
                onChange={(e) => updateSetting('seoTitle', e.target.value || null)}
                className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                placeholder="1000FPS — Интернет-магазин..."
              />
              <div className="text-[10px] text-gray4 mt-1">Рекомендуемая длина: 50-60 символов</div>
            </div>

            <div>
              <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                Описание (description)
              </label>
              <textarea
                value={settings.seoDescription || ''}
                onChange={(e) => updateSetting('seoDescription', e.target.value || null)}
                rows={3}
                className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange resize-none"
                placeholder="Видеокарты, процессоры, материнские платы..."
              />
              <div className="text-[10px] text-gray4 mt-1">Рекомендуемая длина: 150-160 символов</div>
            </div>

            <div>
              <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                Ключевые слова (keywords)
              </label>
              <input
                type="text"
                value={settings.seoKeywords || ''}
                onChange={(e) => updateSetting('seoKeywords', e.target.value || null)}
                className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                placeholder="видеокарты, процессоры, комплектующие"
              />
            </div>
          </div>
        )}

        {/* Заказы */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
              Настройки заказов
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                  Статус по умолчанию
                </label>
                <select
                  value={settings.defaultOrderStatus}
                  onChange={(e) => updateSetting('defaultOrderStatus', e.target.value)}
                  className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                >
                  <option value="PENDING">Новый (PENDING)</option>
                  <option value="CONFIRMED">Подтверждённый (CONFIRMED)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                  Статус оплаты по умолчанию
                </label>
                <select
                  value={settings.defaultPaymentStatus}
                  onChange={(e) => updateSetting('defaultPaymentStatus', e.target.value)}
                  className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                >
                  <option value="PENDING">Ожидается (PENDING)</option>
                  <option value="PAID">Оплачен (PAID)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoConfirmOrders}
                  onChange={(e) => updateSetting('autoConfirmOrders', e.target.checked)}
                  className="w-4 h-4 accent-orange"
                />
                <div>
                  <div className="text-[13px] text-white font-semibold">Автоматически подтверждать заказы</div>
                  <div className="text-[11px] text-gray4">Заказы будут сразу получать статус &laquo;Подтверждён&raquo;</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowGuestCheckout}
                  onChange={(e) => updateSetting('allowGuestCheckout', e.target.checked)}
                  className="w-4 h-4 accent-orange"
                />
                <div>
                  <div className="text-[13px] text-white font-semibold">Разрешить оформление без регистрации</div>
                  <div className="text-[11px] text-gray4">Покупатели смогут оформлять заказы без создания аккаунта</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Доставка */}
        {activeTab === 'delivery' && (
          <div className="space-y-5">
            <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
              Настройки доставки
            </h2>
            
            <div>
              <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                Бесплатная доставка от (₽)
              </label>
              <input
                type="number"
                value={settings.freeShippingThreshold || ''}
                onChange={(e) => updateSetting('freeShippingThreshold', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                Стоимость доставки по умолчанию (₽)
              </label>
              <input
                type="number"
                value={settings.defaultDeliveryCost || ''}
                onChange={(e) => updateSetting('defaultDeliveryCost', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                placeholder="500"
              />
            </div>

            <div className="pt-4 border-t border-gray1">
              <h3 className="font-display text-[12px] font-bold text-white uppercase tracking-wider mb-4">
                Налоги
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                    Ставка налога (%)
                  </label>
                  <input
                    type="number"
                    value={settings.taxRate || ''}
                    onChange={(e) => updateSetting('taxRate', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                    placeholder="20"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.taxIncluded}
                      onChange={(e) => updateSetting('taxIncluded', e.target.checked)}
                      className="w-4 h-4 accent-orange"
                    />
                    <div className="text-[13px] text-white">Налог включён в цену</div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Уведомления */}
        {activeTab === 'notifications' && (
          <div className="space-y-5">
            <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
              Настройки уведомлений
            </h2>
            
            <div>
              <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                Email для уведомлений о новых заказах
              </label>
              <input
                type="email"
                value={settings.notifyNewOrderEmail || ''}
                onChange={(e) => updateSetting('notifyNewOrderEmail', e.target.value || null)}
                className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                placeholder="orders@1000fps.ru"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                Порог уведомления о низком остатке
              </label>
              <input
                type="number"
                value={settings.notifyLowStockThreshold || ''}
                onChange={(e) => updateSetting('notifyLowStockThreshold', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                placeholder="5"
                min="0"
              />
              <div className="text-[10px] text-gray4 mt-1">Уведомлять когда остаток товара меньше указанного значения</div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableEmailNotifications}
                  onChange={(e) => updateSetting('enableEmailNotifications', e.target.checked)}
                  className="w-4 h-4 accent-orange"
                />
                <div className="text-[13px] text-white">Включить email уведомления</div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableSmsNotifications}
                  onChange={(e) => updateSetting('enableSmsNotifications', e.target.checked)}
                  className="w-4 h-4 accent-orange"
                />
                <div className="text-[13px] text-white">Включить SMS уведомления</div>
              </label>
            </div>
          </div>
        )}

        {/* SMTP */}
        {activeTab === 'smtp' && (
          <div className="space-y-5">
            <h2 className="font-display text-[14px] font-bold text-white uppercase tracking-wider mb-4">
              SMTP настройки
            </h2>
            <div className="text-[11px] text-gray4 mb-4">
              Настройки почтового сервера для отправки email уведомлений
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                  SMTP хост
                </label>
                <input
                  type="text"
                  value={settings.smtpHost || ''}
                  onChange={(e) => updateSetting('smtpHost', e.target.value || null)}
                  className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                  Порт
                </label>
                <input
                  type="number"
                  value={settings.smtpPort || ''}
                  onChange={(e) => updateSetting('smtpPort', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                  placeholder="587"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                  Пользователь
                </label>
                <input
                  type="text"
                  value={settings.smtpUser || ''}
                  onChange={(e) => updateSetting('smtpUser', e.target.value || null)}
                  className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                  placeholder="username@gmail.com"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  value={settings.smtpPassword || ''}
                  onChange={(e) => updateSetting('smtpPassword', e.target.value || null)}
                  className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray3 uppercase tracking-wider mb-2">
                От кого (From)
              </label>
              <input
                type="email"
                value={settings.smtpFrom || ''}
                onChange={(e) => updateSetting('smtpFrom', e.target.value || null)}
                className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-[8px] text-white text-[13px] outline-none focus:border-orange"
                placeholder="noreply@1000fps.ru"
              />
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-[var(--radius)] p-4">
              <div className="text-[12px] text-yellow-500">
                ⚠️ Для работы email уведомлений также требуется включить опцию в разделе &laquo;Уведомления&raquo;
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
