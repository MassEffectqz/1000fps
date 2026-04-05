'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumbs, Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const categories = [
  { id: 'cpu', name: 'Процессор', icon: 'cpu', required: true },
  { id: 'gpu', name: 'Видеокарта', icon: 'gpu', required: true },
  { id: 'motherboard', name: 'Материнская плата', icon: 'mb', required: true },
  { id: 'ram', name: 'Оперативная память', icon: 'ram', required: true },
  { id: 'storage', name: 'Накопитель', icon: 'storage', required: true },
  { id: 'cooling', name: 'Охлаждение', icon: 'cooling', required: true },
  { id: 'psu', name: 'Блок питания', icon: 'psu', required: true },
  { id: 'case', name: 'Корпус', icon: 'case', required: false },
  { id: 'peripherals', name: 'Периферия', icon: 'periph', required: false },
];

const presetConfigs = [
  { id: 'office', name: 'Офисный', color: '#4caf50' },
  { id: 'gaming', name: 'Игровой', color: '#ff6a00' },
  { id: 'pro', name: 'Топовый', color: '#9c27b0' },
  { id: 'stream', name: 'Для стриминга', color: '#2196f3' },
  { id: 'work', name: 'Рабочая станция', color: '#ff9800' },
];

const cpuItems = [
  { id: '1', name: 'AMD Ryzen 7 7800X3D AM5, 8 ядер, OEM', price: 34990, specs: '8 ядер / 16 потоков / 5.0 ГГц / 96 МБ L3' },
  { id: '2', name: 'Intel Core i7-14700K LGA1700, OEM', price: 39990, specs: '20 ядер / 28 потоков / 5.6 ГГц' },
  { id: '3', name: 'AMD Ryzen 5 7600X AM5, OEM', price: 22990, specs: '6 ядер / 12 потоков / 5.3 ГГц / 38 МБ L3' },
];

export default function ConfiguratorPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('cpu');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<Record<string, { id?: string; name?: string; price?: number; specs?: string }>>({
    cpu: cpuItems[0],
  });

  // Save modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const total = Object.values(selectedComponents).reduce((sum: number, item) => sum + (item?.price || 0), 0);
  const partCount = Object.keys(selectedComponents).length;
  const selectedItems = Object.entries(selectedComponents).filter(([, item]) => item?.id);

  // Оценочное энергопотребление (CPU 65W, GPU 200W, остальное 25W)
  const estimatedPower = selectedItems.reduce((watts, [catId]) => {
    if (catId === 'cpu') return watts + 65;
    if (catId === 'gpu') return watts + 200;
    return watts + 25;
  }, 0);

  // Сохранить сборку в профиль
  const handleSaveConfig = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.error('Добавьте хотя бы один компонент');
      return;
    }

    setIsSaving(true);

    try {
      // Проверка авторизации
      const authRes = await fetch('/api/profile');
      if (!authRes.ok) {
        if (authRes.status === 401) {
          toast.error('Войдите в аккаунт для сохранения сборки');
          router.push('/login?callbackUrl=/configurator');
          return;
        }
        throw new Error('Ошибка проверки авторизации');
      }

      const payload = {
        name: saveName.trim() || null,
        isPreset: false,
        presetType: null,
        total,
        power: estimatedPower,
        isPublic,
        items: selectedItems.map(([categoryId, item]) => ({
          categoryId,
          productId: item.id!,
          quantity: 1,
          price: item.price!,
        })),
      };

      const res = await fetch('/api/profile/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка сохранения');
      }

      toast.success('Сборка сохранена в профиль!');
      setShowSaveModal(false);
      setSaveName('');
      setIsPublic(false);
      router.push('/profile');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось сохранить сборку';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, [saveName, isPublic, total, estimatedPower, selectedItems, router]);

  // Сбросить все компоненты
  const handleReset = useCallback(() => {
    setSelectedComponents({});
    setActiveSection('');
    setSelectedPreset(null);
    toast.success('Сборка сброшена');
  }, []);

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-black2 border-b border-gray1">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Конфигуратор ПК' }]} />
        </div>
      </div>

      {/* Topbar */}
      <div className="bg-black2 border-b border-gray1">
        <div className="container" style={{ padding: 0, maxWidth: '100%' }}>
          <div className="flex items-center h-[52px]">
            <div className="flex items-center gap-[10px] px-5 font-display text-[18px] font-extrabold uppercase text-white2 border-r border-gray1 h-full">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] text-orange">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
                <path d="M9 8h6M12 6v4" />
              </svg>
              Конфигуратор ПК
            </div>
            <div className="flex items-center flex-1 h-full overflow-x-auto">
              <span className="text-[11px] text-gray3 px-4 border-r border-gray1 h-full flex items-center whitespace-nowrap">
                Готовые сборки:
              </span>
              {presetConfigs.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={cn(
                    'flex items-center gap-[6px] px-4 h-full text-[12px] font-medium text-gray4 border-r border-gray1 transition-colors hover:bg-black3 hover:text-white whitespace-nowrap',
                    selectedPreset === preset.id && 'text-orange bg-black3'
                  )}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: preset.color }} />
                  {preset.name}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 h-full border-l border-gray1">
              <Button variant="ghost" size="sm" onClick={() => setShowSaveModal(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Сохранить
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
                Сбросить
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: 0, maxWidth: '100%' }}>
        <div className="grid grid-cols-[1fr_320px] gap-0 items-start min-h-[calc(100vh-100px)]">
          {/* Parts List */}
          <div className="border-r border-gray1">
            {categories.map((cat) => (
              <div key={cat.id} className={cn('border-b border-gray1', activeSection === cat.id && 'is-selected')}>
                <div
                  className="flex items-center h-[44px] cursor-pointer bg-black2 transition-colors hover:bg-black3"
                  onClick={() => setActiveSection(activeSection === cat.id ? '' : cat.id)}
                >
                  <div className={cn('w-[44px] h-[44px] flex items-center justify-center border-r border-gray1 text-gray3', activeSection === cat.id && 'text-orange')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]">
                      {cat.icon === 'cpu' && <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" /></>}
                      {cat.icon === 'gpu' && <><rect x="1" y="7" width="22" height="12" rx="2" /><path d="M7 7V5M12 7V4M17 7V5" /><circle cx="8" cy="13" r="2" /><circle cx="16" cy="13" r="2" /></>}
                      {cat.icon === 'mb' && <><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M6 6h4v4H6zM14 6h4v4h-4zM6 14h4v4H6z" /></>}
                      {cat.icon === 'ram' && <><rect x="2" y="8" width="20" height="8" rx="1" /><path d="M6 8V6M10 8V6M14 8V6M18 8V6M6 16v2M10 16v2M14 16v2M18 16v2" /></>}
                      {cat.icon === 'storage' && <><path d="M22 12H2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" /><circle cx="12" cy="12" r="3" /></>}
                      {cat.icon === 'cooling' && <><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" /><circle cx="12" cy="12" r="4" /></>}
                      {cat.icon === 'psu' && <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />}
                      {cat.icon === 'case' && <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 12h6M12 9v6" /></>}
                      {cat.icon === 'periph' && <><rect x="6" y="2" width="12" height="20" rx="2" /><circle cx="12" cy="16" r="1" /></>}
                    </svg>
                  </div>
                  <div className="flex-1 text-[13px] font-semibold text-gray4 px-[14px]">
                    {cat.name}
                    {selectedComponents[cat.id] && (
                      <span className="ml-2 text-[10px] px-[6px] py-[1px] bg-orange text-white rounded-full font-display font-bold">
                        1
                      </span>
                    )}
                  </div>
                  {cat.required && (
                    <span className={cn('text-[10px] text-gray3 pr-2', selectedComponents[cat.id] ? 'text-orange' : '')}>
                      {selectedComponents[cat.id] ? 'Выбрано' : 'Обязательно'}
                    </span>
                  )}
                  <div className="w-5 h-5 rounded-full border border-gray2 mr-[14px] flex items-center justify-center">
                    {selectedComponents[cat.id] && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-[10px] h-[10px] text-green-500">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div className="pr-[14px] text-gray2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn('w-[14px] h-[14px] transition-transform', activeSection === cat.id && 'rotate-180')}>
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>

                {/* Selected component */}
                {selectedComponents[cat.id] && (
                  <div className="flex items-center gap-3 px-[14px] py-[10px] bg-black3 border-b border-gray1">
                    <div className="w-12 h-9 bg-black2 border border-gray1 rounded-[var(--radius)] flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 48 36" fill="none" className="w-9 h-7 p-1">
                        <rect x="8" y="6" width="32" height="24" rx="2" stroke="var(--gray2)" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-white2 leading-[1.3] truncate">{selectedComponents[cat.id].name}</div>
                      <div className="text-[11px] text-gray3">{selectedComponents[cat.id].specs}</div>
                    </div>
                    <div className="font-display text-[15px] font-extrabold text-white2 flex-shrink-0">
                      {selectedComponents[cat.id]?.price?.toLocaleString('ru-RU')} руб.
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newComponents = { ...selectedComponents };
                        delete newComponents[cat.id];
                        setSelectedComponents(newComponents);
                      }}
                      className="w-6 h-6 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray3 transition-colors hover:border-red-500 hover:text-red-500 flex-shrink-0 ml-2"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Component picker */}
                {activeSection === cat.id && (
                  <div className="border-b border-gray1">
                    <div className="flex items-center gap-2 p-[10px] border-b border-gray1 bg-black">
                      <div className="relative flex-1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-gray3">
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                          type="text"
                          placeholder={`Поиск ${cat.name.toLowerCase()}...`}
                          className="w-full pl-[32px] pr-3 py-[7px] bg-black2 border border-gray1 rounded-[var(--radius)] text-white text-[13px] outline-none focus:border-orange"
                        />
                      </div>
                      <select className="bg-black2 border border-gray1 rounded-[var(--radius)] px-[10px] py-[7px] text-white text-[12px] outline-none cursor-pointer appearance-none pr-6">
                        <option>По популярности</option>
                        <option>Сначала дешевле</option>
                        <option>Сначала дороже</option>
                      </select>
                    </div>
                    <div className="max-h-[340px] overflow-y-auto">
                      {cpuItems.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            'flex items-center gap-3 p-[10px] border-b border-gray1 cursor-pointer transition-colors hover:bg-black3',
                            selectedComponents[cat.id]?.id === item.id && 'bg-orange/5 outline outline-1 outline-orange'
                          )}
                          onClick={() => setSelectedComponents({ ...selectedComponents, [cat.id]: item })}
                        >
                          <div className="w-14 h-[42px] bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center flex-shrink-0">
                            <svg viewBox="0 0 48 36" fill="none" className="w-full h-full p-1">
                              <rect x="8" y="6" width="32" height="24" rx="2" stroke="var(--gray2)" strokeWidth="1.5" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] text-white2 leading-[1.35] mb-[3px] truncate">{item.name}</div>
                            <div className="text-[11px] text-gray3">{item.specs}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-display text-[15px] font-extrabold text-white2">
                              {item.price.toLocaleString('ru-RU')} руб.
                            </div>
                          </div>
                          <button className={cn(
                            'w-8 h-8 bg-orange border-none rounded-[var(--radius)] flex items-center justify-center text-white cursor-pointer transition-colors hover:bg-orange2 flex-shrink-0',
                            selectedComponents[cat.id]?.id === item.id && 'bg-green-500 hover:bg-green-500'
                          )}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px]">
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar Summary */}
          <div className="bg-black2 border-l border-gray1 min-h-screen sticky top-0">
            <div className="px-4 py-4 border-b border-gray1 font-display text-[13px] font-bold tracking-wider uppercase text-orange">
              Ваша сборка
            </div>
            <div className="py-1 border-b border-gray1">
              {categories.map((cat) => (
                selectedComponents[cat.id] && (
                  <div key={cat.id} className="flex items-start justify-between gap-2 px-4 py-2 border-b border-gray1 bg-orange/3 last:border-b-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-gray3 uppercase tracking-wider font-semibold">{cat.name}</div>
                      <div className="text-[11px] text-white2 leading-[1.35] truncate">{selectedComponents[cat.id].name}</div>
                    </div>
                    <div className="text-orange font-bold text-[12px] flex-shrink-0 pt-[10px]">
                      {selectedComponents[cat.id]?.price?.toLocaleString('ru-RU')} руб.
                    </div>
                  </div>
                )
              ))}
              {partCount === 0 && (
                <div className="px-4 py-8 text-center text-[12px] text-gray3">
                  Выберите компоненты для сборки
                </div>
              )}
            </div>

            {/* Power estimate */}
            <div className="px-4 py-3 border-b border-gray1">
              <div className="text-[11px] font-bold tracking-wider uppercase text-gray3 mb-2">
                Потребляемая мощность
              </div>
              <div className="h-[6px] bg-gray1 rounded-[3px] overflow-hidden mb-[6px]">
                <div className="h-full bg-orange rounded-[3px] transition-all duration-500" style={{ width: `${Math.min(100, (estimatedPower / 800) * 100)}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-gray3">
                <span>~{estimatedPower} Вт</span>
                <span>Рекомендуем БП от {Math.ceil(estimatedPower * 1.5 / 50) * 50} Вт</span>
              </div>
            </div>

            {/* Total */}
            <div className="px-4 py-4 border-b border-gray1">
              <div className="flex justify-between mb-[6px] text-[12px] text-gray3">
                <span>Компоненты</span>
                <span>{partCount} шт.</span>
              </div>
              <div className="flex justify-between items-baseline pt-[10px] border-t border-gray1 mt-[10px]">
                <div className="font-display text-[14px] font-bold uppercase text-white2">
                  Итого
                </div>
                <div className="font-display text-[26px] font-extrabold text-white2">
                  {total.toLocaleString('ru-RU')} руб.
                </div>
              </div>
              <div className="text-[11px] text-gray3 text-right mt-1">
                Рассрочка от {total > 0 ? (total / 24).toFixed(0) : '0'} руб./мес
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-4 flex flex-col gap-2">
              <Button fullWidth size="lg" disabled={partCount === 0}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Добавить в корзину
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setShowSaveModal(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                </svg>
                Сохранить в профиль
              </Button>
            </div>

            {/* Share */}
            <div className="px-4 py-3 border-t border-gray1 flex gap-2">
              <Button variant="ghost" size="sm" fullWidth className="text-[11px]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                </svg>
                Поделиться
              </Button>
              <Button variant="ghost" size="sm" fullWidth className="text-[11px]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M8 12h8M12 8v8" />
                </svg>
                Копировать ссылку
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Config Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowSaveModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-black2 border border-gray1 rounded-[var(--radius)] w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray1">
              <h3 className="font-display text-[16px] font-bold uppercase text-white2">
                Сохранить сборку
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray3 hover:text-white transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
                  Название сборки <span className="text-gray3 font-normal">(необязательно)</span>
                </label>
                <Input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Например: Игровой ПК 2026"
                  maxLength={100}
                />
              </div>

              {/* Public toggle */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <div className="text-[13px] text-white2 font-medium">Публичная сборка</div>
                  <div className="text-[11px] text-gray3">Другие пользователи смогут видеть вашу сборку</div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={cn(
                    'w-11 h-6 rounded-full transition-colors',
                    isPublic ? 'bg-orange' : 'bg-gray1'
                  )}>
                    <div className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                      isPublic && 'translate-x-5'
                    )} />
                  </div>
                </div>
              </label>

              {/* Summary */}
              <div className="bg-black3 border border-gray1 rounded-[var(--radius)] p-3">
                <div className="text-[11px] text-gray3 mb-1">Компоненты:</div>
                <div className="space-y-1">
                  {selectedItems.map(([catId, item]) => {
                    const cat = categories.find(c => c.id === catId);
                    return (
                      <div key={catId} className="flex items-center justify-between text-[12px]">
                        <span className="text-gray4 truncate flex-1 mr-2">{cat?.name}: {item.name}</span>
                        <span className="text-orange font-bold flex-shrink-0">{item.price?.toLocaleString('ru-RU')} ₽</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[13px] font-bold text-white2 mt-2 pt-2 border-t border-gray1">
                  <span>Итого</span>
                  <span>{total.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-5 py-4 border-t border-gray1">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowSaveModal(false)}
                disabled={isSaving}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleSaveConfig}
                disabled={isSaving || partCount === 0}
              >
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
