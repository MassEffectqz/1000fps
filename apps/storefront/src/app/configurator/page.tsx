'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, useConfiguratorStore } from '@/store';
import { usePartsByType } from '@/hooks/useApi';
import { useDebouncedCallback } from 'use-debounce';
import type { Product } from '@/types';

// ============================================
// Типы компонентов
// ============================================

const PART_TYPES = [
  { id: 'cpu', name: 'Процессор', icon: 'M4 4h16v16H4z M9 9h6v6H9', required: true },
  { id: 'gpu', name: 'Видеокарта', icon: 'M2 7h20v12H2z M7 7V5m5 0v2m5-2v2', required: true },
  {
    id: 'motherboard',
    name: 'Материнская плата',
    icon: 'M2 2h20v20H2z M6 6h4v4H6z M14 6h4v4h-4z M6 14h4v4H6z M14 14h4v4h-4z',
    required: true,
  },
  {
    id: 'ram',
    name: 'Оперативная память',
    icon: 'M2 8h20v8H2z M6 8V6m4 0v2m4 0v2m4 0v2',
    required: true,
  },
  { id: 'storage', name: 'Накопитель', icon: 'M22 12H2M22 12a10 10 0 1 1-20 0', required: true },
  { id: 'psu', name: 'Блок питания', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', required: true },
  { id: 'case', name: 'Корпус', icon: 'M2 2h20v20H2z M8 2v20m8-20v20', required: false },
  {
    id: 'cooling',
    name: 'Охлаждение',
    icon: 'M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83',
    required: false,
  },
];

// ============================================
// Helper: Расчёт совместимости
// ============================================

interface CompatibilityIssue {
  partType: string;
  message: string;
  severity: 'error' | 'warning';
}

interface CompatibilityResult {
  issues: CompatibilityIssue[];
  warnings: CompatibilityIssue[];
  isCompatible: boolean;
}

function checkCompatibility(parts: Record<string, unknown>): CompatibilityResult {
  const issues: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];

  const cpu = parts.cpu as Record<string, unknown> | undefined;
  const motherboard = parts.motherboard as Record<string, unknown> | undefined;
  const gpu = parts.gpu as Record<string, unknown> | undefined;
  const psu = parts.psu as Record<string, unknown> | undefined;
  const case_ = parts.case as Record<string, unknown> | undefined;

  // Проверка сокета CPU и материнской платы
  if (cpu && motherboard) {
    const cpuSocket = (cpu.specifications as Record<string, unknown>)?.socket as string | undefined;
    const moboSocket = (motherboard.specifications as Record<string, unknown>)?.socket as string | undefined;

    if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
      issues.push({
        partType: 'cpu',
        message: `Несовместимый сокет: CPU ${cpuSocket}, Motherboard ${moboSocket}`,
        severity: 'error',
      });
    }
  }

  // Проверка мощности БП
  if (psu && (cpu || gpu)) {
    const psuWattage = Number((psu.specifications as Record<string, unknown>)?.wattage) || 0;
    const requiredWattage = calculateRequiredWattage(parts);

    if (psuWattage < requiredWattage) {
      warnings.push({
        partType: 'psu',
        message: `Рекомендуется БП мощностью от ${requiredWattage}W (сейчас ${psuWattage}W)`,
        severity: 'warning',
      });
    }
  }

  // Проверка размещения GPU в корпусе
  if (gpu && case_) {
    const gpuLength = Number((gpu.specifications as Record<string, unknown>)?.length) || 0;
    const caseMaxGpuLength = Number((case_.specifications as Record<string, unknown>)?.maxGpuLength) || 999;

    if (gpuLength > caseMaxGpuLength) {
      issues.push({
        partType: 'gpu',
        message: `Видеокарта не помещается в корпус (длина ${gpuLength}мм, макс. ${caseMaxGpuLength}мм)`,
        severity: 'error',
      });
    }
  }

  return { issues, warnings, isCompatible: issues.length === 0 };
}

function calculateRequiredWattage(parts: Record<string, unknown>): number {
  let total = 100; // Базовое потребление системы

  if (parts.cpu) {
    const cpuSpecs = (parts.cpu as Record<string, unknown>).specifications as Record<string, unknown> | undefined;
    const tdp = Number(cpuSpecs?.tdp) || 65;
    total += tdp;
  }

  if (parts.gpu) {
    const gpuSpecs = (parts.gpu as Record<string, unknown>).specifications as Record<string, unknown> | undefined;
    const tdp = Number(gpuSpecs?.tdp) || 150;
    total += tdp;
  }

  // Добавляем 50W запаса
  return total + 50;
}

// ============================================
// Main Component
// ============================================

export default function ConfiguratorPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    currentConfig,
    savedConfigs,
    setPart,
    removePart,
    clearConfig,
    saveConfig,
    fetchConfigs,
  } = useConfiguratorStore();

  const [selectedPartType, setSelectedPartType] = useState<string>('cpu');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [configName, setConfigName] = useState('');

  // Загружаем сохранённые сборки
  useEffect(() => {
    if (isAuthenticated) {
      fetchConfigs();
    }
  }, [isAuthenticated, fetchConfigs]);

  // Загружаем компоненты для выбранного типа
  const { data: partsData, isLoading: partsLoading } = usePartsByType(selectedPartType);
  const parts = useMemo(() => partsData?.data || [], [partsData?.data]);

  // Debounced search
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
  }, 300);

  // Фильтрация компонентов
  const filteredParts = useMemo(() => {
    if (!searchQuery) return parts;
    return parts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [parts, searchQuery]);

  // Текущая конфигурация
  const config = useMemo(() => {
    return (
      currentConfig?.items?.reduce(
        (acc: Record<string, Product>, item: { partType: string; product: Product }) => {
          acc[item.partType] = item.product;
          return acc;
        },
        {} as Record<string, Product>
      ) || {}
    );
  }, [currentConfig?.items]);

  // Общая стоимость
  const totalPrice = useMemo(() => {
    let sum = 0;
    const parts = Object.values(config) as Product[];
    for (let i = 0; i < parts.length; i++) {
      sum += parts[i]?.price || 0;
    }
    return sum;
  }, [config]);

  // Проверка совместимости
  const compatibility = useMemo(() => checkCompatibility(config), [config]);

  // Расчёт мощности
  const requiredWattage = useMemo(() => calculateRequiredWattage(config), [config]);

  // Количество выбранных компонентов
  const selectedCount = Object.keys(config).length;
  const requiredSelected = PART_TYPES.filter((p) => p.required && config[p.id]).length;
  const requiredTotal = PART_TYPES.filter((p) => p.required).length;

  // Обработчики
  const handleSelectPart = (part: Product) => {
    setPart(selectedPartType, part.id, part);
  };

  const handleRemovePart = (partType: string) => {
    removePart(partType);
  };

  const handleSaveConfig = async () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    setShowSaveModal(true);
  };

  const confirmSaveConfig = async () => {
    await saveConfig(configName || 'Моя сборка');
    setShowSaveModal(false);
    setConfigName('');
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    // TODO: реализовать добавление в корзину
    alert('Функционал добавления в корзину будет реализован');
  };

  const loadPreset = (_preset: string) => {
    // TODO: загрузка готовых пресетов
  };

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
              padding: '10px 0',
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
            <span style={{ color: 'var(--white)' }}>Конфигуратор ПК</span>
          </div>
        </div>
      </div>

      {/* Topbar */}
      <div
        className="cfg-topbar"
        style={{
          background: 'var(--black2)',
          borderBottom: '1px solid var(--gray1)',
          padding: 0,
        }}
      >
        <div className="container" style={{ padding: 0, maxWidth: '100%' }}>
          <div
            className="cfg-topbar__inner"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              height: '52px',
            }}
          >
            <div
              className="cfg-topbar__title"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0 20px',
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--white2)',
                borderRight: '1px solid var(--gray1)',
                height: '100%',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: '18px', height: '18px', color: 'var(--orange)' }}
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
                <path d="M9 8h6M12 6v4" />
              </svg>
              Конфигуратор ПК
            </div>

            {/* Presets */}
            <div
              className="cfg-topbar__presets"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 16px',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--gray3)' }}>Пресеты:</span>
              <button
                onClick={() => loadPreset('gaming')}
                style={{
                  padding: '4px 12px',
                  background: 'var(--black3)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--gray4)',
                  cursor: 'pointer',
                  transition: 'var(--tr)',
                }}
              >
                Игровой
              </button>
              <button
                onClick={() => loadPreset('office')}
                style={{
                  padding: '4px 12px',
                  background: 'var(--black3)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--gray4)',
                  cursor: 'pointer',
                  transition: 'var(--tr)',
                }}
              >
                Офисный
              </button>
              <button
                onClick={() => loadPreset('workstation')}
                style={{
                  padding: '4px 12px',
                  background: 'var(--black3)',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--gray4)',
                  cursor: 'pointer',
                  transition: 'var(--tr)',
                }}
              >
                Для работы
              </button>
            </div>

            {/* Actions */}
            <div
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingRight: '16px',
              }}
            >
              <button
                onClick={clearConfig}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid var(--gray1)',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--gray4)',
                  cursor: 'pointer',
                  transition: 'var(--tr)',
                }}
              >
                Очистить
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={selectedCount === 0}
                style={{
                  padding: '8px 16px',
                  background: selectedCount > 0 ? 'var(--orange)' : 'var(--gray2)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#fff',
                  cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
                  transition: 'var(--tr)',
                }}
              >
                Сохранить
              </button>
              <button
                onClick={handleAddToCart}
                disabled={!compatibility.isCompatible}
                style={{
                  padding: '8px 20px',
                  background: compatibility.isCompatible ? 'var(--orange)' : 'var(--gray2)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#fff',
                  cursor: compatibility.isCompatible ? 'pointer' : 'not-allowed',
                  transition: 'var(--tr)',
                }}
              >
                В корзину
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ padding: '0 20px 40px' }}>
        <div
          className="cfg-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr 320px',
            gap: '24px',
            marginTop: '24px',
            alignItems: 'start',
          }}
        >
          {/* Left Sidebar - Part Types */}
          <aside
            className="cfg-parts-nav"
            style={{
              background: 'var(--black2)',
              border: '1px solid var(--gray1)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--gray1)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--gray3)',
              }}
            >
              Компоненты
            </div>
            {PART_TYPES.map((partType) => {
              const isSelected = selectedPartType === partType.id;
              const hasPart = !!config[partType.id];
              const isRequired = partType.required;
              const isCompatible =
                hasPart && !compatibility.issues.find((i) => i.partType === partType.id);

              return (
                <button
                  key={partType.id}
                  onClick={() => setSelectedPartType(partType.id)}
                  className={`cfg-part-btn ${isSelected ? 'is-active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '14px 16px',
                    background: isSelected ? 'var(--black3)' : 'transparent',
                    border: 'none',
                    borderLeft: isSelected ? '3px solid var(--orange)' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'var(--tr)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        width: '18px',
                        height: '18px',
                        color: hasPart ? 'var(--orange)' : 'var(--gray3)',
                      }}
                    >
                      <path d={partType.icon} />
                    </svg>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: isSelected ? 'var(--white2)' : 'var(--gray4)',
                      }}
                    >
                      {partType.name}
                      {isRequired && !hasPart && (
                        <span style={{ color: 'var(--orange)', marginLeft: '4px' }}>*</span>
                      )}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {hasPart && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        style={{
                          width: '16px',
                          height: '16px',
                          color: isCompatible ? '#4caf50' : '#f44336',
                        }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Progress */}
            <div
              style={{
                padding: '16px',
                borderTop: '1px solid var(--gray1)',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--gray3)', marginBottom: '8px' }}>
                Выбрано компонентов
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--white2)',
                  marginBottom: '8px',
                }}
              >
                <span>
                  {selectedCount} из {PART_TYPES.length}
                </span>
                <span
                  style={{
                    color: requiredSelected === requiredTotal ? '#4caf50' : 'var(--orange)',
                  }}
                >
                  {requiredSelected}/{requiredTotal} обязательных
                </span>
              </div>
              <div
                style={{
                  height: '4px',
                  background: 'var(--black3)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${(selectedCount / PART_TYPES.length) * 100}%`,
                    height: '100%',
                    background: 'var(--orange)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </aside>

          {/* Center - Parts List */}
          <main
            className="cfg-parts-list"
            style={{
              background: 'var(--black2)',
              border: '1px solid var(--gray1)',
              borderRadius: 'var(--radius)',
              minHeight: '500px',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--gray1)',
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'var(--white2)',
                }}
              >
                {PART_TYPES.find((p) => p.id === selectedPartType)?.name}
              </h2>
              <div style={{ position: 'relative' }}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '14px',
                    height: '14px',
                    color: 'var(--gray3)',
                    pointerEvents: 'none',
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Поиск..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  style={{
                    width: '200px',
                    padding: '8px 12px 8px 32px',
                    background: 'var(--black3)',
                    border: '1px solid var(--gray1)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--white)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Parts Grid */}
            {partsLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray3)' }}>
                Загрузка...
              </div>
            ) : filteredParts.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray3)' }}>
                Компоненты не найдены
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1px',
                  background: 'var(--gray1)',
                }}
              >
                {filteredParts.map((part) => {
                  const isSelected = config[selectedPartType]?.id === part.id;
                  const specs = (part.specifications as Record<string, unknown>) || {};

                  return (
                    <div
                      key={part.id}
                      onClick={() => handleSelectPart(part)}
                      style={{
                        background: isSelected ? 'var(--black3)' : 'var(--black2)',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'var(--tr)',
                        border: isSelected ? '2px solid var(--orange)' : '2px solid transparent',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: 'var(--gray3)',
                          }}
                        >
                          {part.brand?.name || 'Бренд'}
                        </span>
                        {part.available && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: '#4caf50',
                              background: 'rgba(76, 175, 80, 0.1)',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius)',
                            }}
                          >
                            В наличии
                          </span>
                        )}
                      </div>
                      <h3
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--white2)',
                          marginBottom: '8px',
                          lineHeight: 1.4,
                        }}
                      >
                        {part.name}
                      </h3>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--gray3)',
                          marginBottom: '12px',
                          lineHeight: 1.5,
                        }}
                      >
                        {Object.entries(specs)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <div key={key}>
                              {key}: {String(value)}
                            </div>
                          ))}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: 800,
                            color: 'var(--white2)',
                            fontFamily: 'var(--font-display)',
                          }}
                        >
                          {part.price?.toLocaleString('ru-RU')} ₽
                        </span>
                        {isSelected && (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            style={{
                              width: '20px',
                              height: '20px',
                              color: 'var(--orange)',
                            }}
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          {/* Right Sidebar - Summary */}
          <aside
            className="cfg-summary"
            style={{
              background: 'var(--black2)',
              border: '1px solid var(--gray1)',
              borderRadius: 'var(--radius)',
              padding: '20px',
              position: 'sticky',
              top: '132px',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--white2)',
                marginBottom: '16px',
              }}
            >
              Ваша сборка
            </h3>

            {/* Selected Parts */}
            <div style={{ marginBottom: '20px' }}>
              {Object.entries(config).length === 0 ? (
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--gray3)',
                    textAlign: 'center',
                    padding: '20px 0',
                  }}
                >
                  Выберите компоненты из каталога
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(Object.entries(config) as Array<[string, Product]>).map(([partType, part]) => (
                    <div
                      key={partType}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px',
                        background: 'var(--black3)',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: 'var(--gray3)',
                            marginBottom: '2px',
                          }}
                        >
                          {PART_TYPES.find((p) => p.id === partType)?.name}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--white2)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {part.name}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: 'var(--white2)',
                            fontFamily: 'var(--font-display)',
                          }}
                        >
                          {part.price?.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePart(partType)}
                        style={{
                          width: '24px',
                          height: '24px',
                          flexShrink: 0,
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--gray3)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'var(--tr)',
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
              )}
            </div>

            {/* Compatibility Status */}
            {Object.keys(config).length >= 3 && (
              <div
                style={{
                  padding: '12px',
                  background: compatibility.isCompatible
                    ? 'rgba(76, 175, 80, 0.1)'
                    : 'rgba(244, 67, 54, 0.1)',
                  border: `1px solid ${compatibility.isCompatible ? '#4caf50' : '#f44336'}`,
                  borderRadius: 'var(--radius)',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      width: '16px',
                      height: '16px',
                      color: compatibility.isCompatible ? '#4caf50' : '#f44336',
                    }}
                  >
                    {compatibility.isCompatible ? (
                      <polyline points="20 6 9 17 4 12" />
                    ) : (
                      <circle cx="12" cy="12" r="10" />
                    )}
                  </svg>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: compatibility.isCompatible ? '#4caf50' : '#f44336',
                      textTransform: 'uppercase',
                    }}
                  >
                    {compatibility.isCompatible ? 'Совместимо' : 'Есть проблемы'}
                  </span>
                </div>
                {compatibility.issues.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#f44336' }}>
                    {compatibility.issues.map((issue, idx) => (
                      <div key={idx}>• {issue.message}</div>
                    ))}
                  </div>
                )}
                {compatibility.warnings.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#ff9800', marginTop: '8px' }}>
                    {compatibility.warnings.map((warning, idx) => (
                      <div key={idx}>⚠ {warning.message}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Power Consumption */}
            {Object.keys(config).length >= 2 && (
              <div
                style={{
                  padding: '12px',
                  background: 'var(--black3)',
                  borderRadius: 'var(--radius)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--gray3)', marginBottom: '8px' }}>
                  Расчётная мощность
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span
                    style={{
                      fontSize: '24px',
                      fontWeight: 800,
                      color: 'var(--white2)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {requiredWattage}W
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: '20px', height: '20px', color: 'var(--orange)' }}
                  >
                    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Total */}
            <div
              style={{
                paddingTop: '16px',
                borderTop: '1px solid var(--gray1)',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}
              >
                <span style={{ fontSize: '14px', color: 'var(--gray3)' }}>Итого:</span>
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: 'var(--white2)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {totalPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!compatibility.isCompatible || Object.keys(config).length === 0}
                style={{
                  width: '100%',
                  padding: '14px',
                  background:
                    compatibility.isCompatible && Object.keys(config).length > 0
                      ? 'var(--orange)'
                      : 'var(--gray2)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#fff',
                  cursor:
                    compatibility.isCompatible && Object.keys(config).length > 0
                      ? 'pointer'
                      : 'not-allowed',
                  transition: 'var(--tr)',
                }}
              >
                Добавить в корзину
              </button>
            </div>

            {/* Saved Configs */}
            {isAuthenticated && savedConfigs && savedConfigs.length > 0 && (
              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--gray1)',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--gray3)', marginBottom: '8px' }}>
                  Сохранённые сборки
                </div>
                {savedConfigs.slice(0, 3).map((cfg) => (
                  <div
                    key={cfg.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--gray1)',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: 'var(--white2)' }}>{cfg.name}</span>
                    <button
                      onClick={() => router.push(`/configurator?load=${cfg.id}`)}
                      style={{
                        fontSize: '11px',
                        color: 'var(--orange)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Загрузить
                    </button>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'var(--black2)',
              border: '1px solid var(--gray1)',
              borderRadius: 'var(--radius)',
              padding: '32px',
              width: '100%',
              maxWidth: '400px',
            }}
          >
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--white2)',
                marginBottom: '16px',
              }}
            >
              Сохранить сборку
            </h3>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Название сборки"
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--black3)',
                border: '1px solid var(--gray1)',
                borderRadius: 'var(--radius)',
                color: 'var(--white)',
                fontSize: '14px',
                outline: 'none',
                marginBottom: '20px',
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={confirmSaveConfig}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'var(--orange)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Сохранить
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'var(--gray1)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--gray4)',
                  cursor: 'pointer',
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
