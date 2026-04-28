'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Input, Textarea, Select, Checkbox, Card, Label, Button } from '@/components/ui/form';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { generateSlug } from '@/lib/utils/transliterate';
import { toast } from 'sonner';
import {
  ProductImageUploader,
  ProductImageItem,
  TagInput,
  ProductVariantEditor,
  SpecificationEditor,
} from '@/components/ui/product-form';
import { type ParserStatusData } from '@/components/ui/parser-status';
import { ProductParserConfig } from '@/components/ui/product-parser-config';
import { type PriceHistoryPoint } from '@/components/ui/price-history-mini';

// Типы данных
interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  children?: Category[];
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Warehouse {
  id: string;
  name: string;
  city: string;
  address: string;
  isActive: boolean;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  usageCount: number;
}

interface CategorySpecification {
  id: string;
  name: string;
  type: string;
  unit?: string | null;
  required: boolean;
  options?: string | null;
}

interface ProductFormData {
  // Основные поля
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  brandId: string;
  description: string;
  fullDescription: string;

  // Цена и скидки
  price: number;
  oldPrice?: number | null;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;

  // Габариты и вес
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;

  // Гарантия
  warrantyPeriod: number;
  warrantyType: 'MANUFACTURER' | 'SELLER';

  // Статусы
  isActive: boolean;
  isDraft: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isHit: boolean;

  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;

  // Связанные данные
  images: ProductImageItem[];
  specifications: Array<{
    name: string;
    value: string;
    unit?: string;
    isVariant: boolean;
    order: number;
  }>;
  variants: Array<{
    name: string;
    value: string;
    priceMod: number;
    stock: number;
    sku?: string;
    order: number;
  }>;
  tags: Array<{
    tagId: string;
    name?: string;
    slug?: string;
    color?: string;
  }>;
  warehouseStocks: Array<{
    warehouseId: string;
    quantity: number;
    reserved: number;
  }>;

  // Парсинг
  parseSources: Array<{ url: string; priority: number; isActive: boolean }>;
  useParserPrice: boolean;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData> & { id?: string };
  categories?: Category[];
  brands?: Brand[];
  warehouses?: Warehouse[];
  popularTags?: Tag[];
  categorySpecifications?: CategorySpecification[];
  onSave?: (data: ProductFormData) => Promise<void>;
  onCancel?: () => void;
}

const LOCAL_STORAGE_KEY = 'product_form_draft';

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories = [],
  brands = [],
  warehouses = [],
  popularTags = [],
  categorySpecifications = [],
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'media' | 'pricing' | 'inventory' | 'variants' | 'seo' | 'parser'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [showNewBrand, setShowNewBrand] = useState(false);

  // Парсинг
  const [parserStatus, setParserStatus] = useState<ParserStatusData>({ status: 'idle' });
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState<{ processed: number; total: number } | null>(null);
  const [, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [parseLastClicked, setParseLastClicked] = useState<number>(0);
  const PARSE_DEBOUNCE_MS = 5000; // 5 секунд между нажатиями

  // Инициализация формы
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    sku: generateSKU(),
    categoryId: '',
    brandId: '',
    description: '',
    fullDescription: '',
    price: 0,
    oldPrice: null,
    discountType: 'PERCENT',
    discountValue: 0,
    weight: null,
    length: null,
    width: null,
    height: null,
    warrantyPeriod: 12,
    warrantyType: 'MANUFACTURER',
    isActive: true,
    isDraft: false,
    isFeatured: false,
    isNew: false,
    isHit: false,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    images: [],
    specifications: [],
    variants: [],
    tags: [],
    warehouseStocks: [],
    parseSources: [],
    useParserPrice: false,
    ...initialData,
  });

  // Логирование initialData при загрузке
  useEffect(() => {
    if (initialData?.id) {
      console.log('[ProductForm] Initial data loaded:', {
        id: initialData.id,
        parseSources: initialData.parseSources,
        parseSourcesCount: initialData.parseSources?.length || 0,
      });
    }
  }, [initialData?.id]);

  // Загрузка черновика из localStorage
  useEffect(() => {
    if (!initialData?.id) {
      const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Failed to load draft:', e);
        }
      }
    }
  }, [initialData?.id]);

  // Автосохранение черновика
  useEffect(() => {
    if (!initialData?.id && !formData.isDraft) {
      const timer = setTimeout(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, initialData?.id]);

  // Автогенерация slug из названия с транслитерацией
  const debouncedName = useDebounce(formData.name, 500);
  useEffect(() => {
    if (debouncedName && !initialData?.id && !formData.slug) {
      const slug = generateSlug(debouncedName);
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [debouncedName, initialData?.id, formData.slug]);

  // Валидация slug на уникальность
  const [slugError, setSlugError] = useState('');
  const debouncedSlug = useDebounce(formData.slug, 500);
  useEffect(() => {
    if (!debouncedSlug || initialData?.id) return;

    const checkSlug = async () => {
      try {
        const response = await fetch(`/api/admin/products?slug=${debouncedSlug}`);
        if (response.ok) {
          const exists = await response.json();
          setSlugError(exists ? 'Такой slug уже существует' : '');
        }
      } catch (error) {
        console.error('Slug validation error:', error);
      }
    };

    checkSlug();
  }, [debouncedSlug, initialData?.id]);

  // Загрузка данных парсинга при монтировании + health check extension
  useEffect(() => {
    if (initialData?.id) {
      loadParserData();
      loadPriceHistory();
    }
    // Парсер работает через parser-server, health check не требуется
  }, []);

  const loadParserData = useCallback(async () => {
    if (!initialData?.id) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`/api/admin/parser/products/${initialData.id}/auto-parse`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setParserStatus({
          status: data.parserPrice ? 'success' : 'not_found',
          lastParsedAt: data.parserUpdatedAt ? new Date(data.parserUpdatedAt) : null,
          parsedData: {
            price: data.parserPrice,
            oldPrice: data.parserOldPrice,
            name: data.parserName,
          },
        });

        // Обновляем formData с новыми полями парсинга
        // ВАЖНО: НЕ перезаписываем parseSources - они уже загружены из initialData (Product.parserSources)
        setFormData(prev => ({
          ...prev,
          useParserPrice: data.useParserPrice || false,
          // parseSources оставляем как есть из initialData
        }));
      } else if (response.status === 404) {
        // Товар без данных парсинга — это нормально
        setParserStatus({ status: 'not_found' });
      } else {
        setParserStatus({ status: 'error', errorMessage: 'Ошибка загрузки данных парсинга' });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setParserStatus({ status: 'error', errorMessage: 'Таймаут загрузки данных парсинга' });
      } else {
        console.error('Failed to load parser data:', error);
        setParserStatus({ status: 'error', errorMessage: 'Ошибка загрузки данных' });
      }
    }
  }, [initialData?.id]);

  const loadPriceHistory = useCallback(async () => {
    if (!initialData?.id) return;

    try {
      const response = await fetch(`/api/admin/parser/products/${initialData.id}/history`);
      if (response.ok) {
        const history = await response.json();
        setPriceHistory(history.map((h: PriceHistoryPoint) => ({
          ...h,
          date: new Date(h.date),
        })));
      }
    } catch (error) {
      console.error('Failed to load price history:', error);
    }
  }, [initialData?.id]);

  const checkParseJobStatus = useCallback(async (jobId: string, totalSources: number): Promise<void> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`/api/admin/parser/jobs/${jobId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) return;

      const job = await response.json();

      if (job.status === 'COMPLETED') {
        const parsedData = job.result?.parsedData || job.result || {};

        setParserStatus({
          status: 'success',
          lastParsedAt: new Date(job.completedAt),
          parsedData: {
            name: parsedData.name,
            price: parsedData.price,
            oldPrice: parsedData.oldPrice,
            brand: parsedData.brand,
            rating: parsedData.rating,
            reviews: parsedData.reviews,
          },
        });
        setParseProgress({ processed: totalSources, total: totalSources });

        // Обновляем цену из парсинга
        if (parsedData.price) {
          setFormData(prev => ({
            ...prev,
            price: parsedData.price,
            oldPrice: parsedData.oldPrice || prev.oldPrice,
          }));
        }

        loadPriceHistory();
        setIsParsing(false);
        setParseProgress(null);
        toast.success(`Парсинг завершён! Обработано ${totalSources} источник(ов)`);

        // Продолжаем опрос для обновления данных (реже)
        setTimeout(() => checkParseJobStatus(jobId, totalSources), 60000);
      } else if (job.status === 'FAILED') {
        setParserStatus({
          status: 'error',
          errorMessage: job.error || 'Ошибка парсинга: данные не получены',
        });
        setIsParsing(false);
        setParseProgress(null);
        toast.error('Парсинг не удался');
      } else if (job.status === 'PENDING' || job.status === 'PROCESSING') {
        // Обновляем прогресс
        const processed = job.result?.processedCount || 0;
        setParseProgress({ processed, total: totalSources });

        // Продолжаем polling
        setTimeout(() => checkParseJobStatus(jobId, totalSources), 2000);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.warn('Job status check timed out');
      } else {
        console.error('Error checking job status:', error);
      }
      // Не останавливаем polling при ошибке одного запроса
      setTimeout(() => checkParseJobStatus(jobId, totalSources), 5000);
    }
  }, [loadPriceHistory]);

  const handleParse = async () => {
    const sources = formData.parseSources?.filter(s => s.isActive).map(s => s.url) || [];

    if (sources.length === 0) {
      toast.warning('Добавьте хотя бы одну ссылку для парсинга');
      return;
    }

    // Debounce: предотвращаем повторные нажатия
    const now = Date.now();
    if (now - parseLastClicked < PARSE_DEBOUNCE_MS) {
      toast.info('Парсинг уже запущен, подождите...');
      return;
    }
    setParseLastClicked(now);

    setIsParsing(true);
    setParseProgress({ processed: 0, total: sources.length });
    setParserStatus({ status: 'parsing' });

    // Offline fallback: сохраняем задачу в localStorage на случай сбоя
    const pendingParse = {
      sources,
      productId: initialData?.id,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem('wb_parser_pending_parse', JSON.stringify(pendingParse));
    } catch {
      console.warn('Failed to save pending parse to localStorage');
    }

    const requestId = `parse_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    try {
      // Отправляем сообщение расширению через content script bridge
      window.postMessage({
        type: 'wb-parser-parse',
        requestId,
        sources,
        productId: initialData?.id,
      }, window.location.origin);

      // Ждём ответ от расширения с таймаутом
      const result = await new Promise<{ ok?: boolean; parsedData?: Record<string, unknown>; error?: string }>((resolve, reject) => {
        const timeout = setTimeout(() => {
          window.removeEventListener('message', listener);
          reject(new Error(
            'Таймаут парсинга (45с). Возможные причины:\n' +
            '1. Расширение WB Parser не установлено или отключено\n' +
            '2. Нет открытых вкладок Wildberries\n' +
            '3. Проблемы с сетью'
          ));
        }, 45000);

        const listener = (event: MessageEvent) => {
          // Validate origin
          if (event.origin !== window.location.origin) return;

          const msg = event.data;
          if (msg && msg.type === 'wb-parser-parse-response' && msg.requestId === requestId) {
            clearTimeout(timeout);
            window.removeEventListener('message', listener);
            resolve(msg.response);
          }
        };

        window.addEventListener('message', listener);
      });

      // Обрабатываем результат
      if (result?.ok && result.parsedData) {
        const { parsedData } = result as { ok?: boolean; parsedData: { name?: string; price?: number; oldPrice?: number; brand?: string; rating?: number; reviews?: number } };

        setParserStatus({
          status: 'success',
          lastParsedAt: new Date(),
          parsedData: {
            name: parsedData.name,
            price: parsedData.price,
            oldPrice: parsedData.oldPrice,
            brand: parsedData.brand,
            rating: parsedData.rating,
            reviews: parsedData.reviews,
          },
        });
        setParseProgress({ processed: sources.length, total: sources.length });

        // Обновляем цену из парсинга
        if (parsedData.price) {
          setFormData(prev => ({
            ...prev,
            price: parsedData.price as number,
            oldPrice: (parsedData.oldPrice as number) || prev.oldPrice,
          }));
        }

        // Отправляем результаты парсинга на сервер для сохранения как поставщики
        const resultWithResults = result as { results?: Array<{ url?: string; success?: boolean; data?: Record<string, unknown> }> };
        if (resultWithResults.results && resultWithResults.results.length > 0 && initialData?.id) {
          try {
            // Преобразуем результаты в плоский формат для saveSuppliers
            const supplierResults = resultWithResults.results
              .filter((r) => r.success && r.url)
              .map((r) => {
                const d = r.data || {};
                return {
                  source: r.url,
                  price: d.price ?? null,
                  oldPrice: d.oldPrice ?? null,
                  name: (d.name as string) || null,
                  brand: (d.brand as string) || null,
                  inStock: true,
                  stockQuantity: null,
                  deliveryMin: null,
                  deliveryMax: null,
                  rating: null,
                  feedbacks: 0,
                };
              });

            if (supplierResults.length > 0) {
              await fetch('/api/admin/parser/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  productId: initialData.id,
                  status: 'COMPLETED',
                  result: supplierResults,
                  sources: sources,
                }),
              });
              console.log('[Parser] Saved', supplierResults.length, 'suppliers');
            }
          } catch (err) {
            console.warn('Failed to save parse results as suppliers:', err);
          }
        }

        loadPriceHistory();
        toast.success('Парсинг завершён успешно!');

        // Очищаем pending parse
        localStorage.removeItem('wb_parser_pending_parse');
      } else if (result?.ok && !result.parsedData) {
        // Extension ответил, но данных нет
        setParserStatus({
          status: 'error',
          errorMessage: 'Источники не вернули данных. Проверьте URL и попробуйте снова.',
        });
        toast.warning('Данные не получены от источников');
      } else {
        setParserStatus({
          status: 'error',
          errorMessage: result?.error || 'Не удалось получить данные от расширения',
        });
        toast.error(result?.error || 'Ошибка парсинга');
      }
    } catch (error) {
      console.error('Parse error:', error);
      const message = error instanceof Error ? error.message : 'Не удалось выполнить парсинг';

      setParserStatus({
        status: 'error',
        errorMessage: message,
      });

      // Сохраняем для retry
      try {
        localStorage.setItem('wb_parser_failed_parse', JSON.stringify({
          ...pendingParse,
          error: message,
          failedAt: Date.now(),
        }));
      } catch {
        // ignore
      }

      toast.error('Парсинг не удался. Проверьте подключение расширения.');
    } finally {
      setIsParsing(false);
      setParseProgress(null);
    }
  };

  // Retry failed parse from localStorage при монтировании
  useEffect(() => {
    try {
      const failedParse = localStorage.getItem('wb_parser_failed_parse');
      if (failedParse) {
        const data = JSON.parse(failedParse);
        // Предлагаем retry если ошибка была менее 5 минут назад
        if (Date.now() - data.failedAt < 5 * 60 * 1000) {
          toast.info(
            'Предыдущий парсинг не удался. Нажмите "Запустить парсинг" для повтора.',
            { duration: 6000 }
          );
        } else {
          // Старый.failed — очищаем
          localStorage.removeItem('wb_parser_failed_parse');
        }
      }
    } catch {
      // ignore corrupt data
    }
  }, []);

  // Вычисляем цену со скидкой
  const discountedPrice = useMemo(() => {
    if (formData.discountValue <= 0) return formData.price;

    if (formData.discountType === 'PERCENT') {
      return formData.price * (1 - formData.discountValue / 100);
    }
    return Math.max(0, formData.price - formData.discountValue);
  }, [formData.price, formData.discountValue, formData.discountType]);

  // Обработчики изменений
  const handleChange = useCallback(<K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Валидация обязательных полей перед отправкой
      const errors: string[] = [];

      if (!formData.name || formData.name.trim() === '') {
        errors.push('Название товара обязательно');
      }

      if (!formData.slug || formData.slug.trim() === '') {
        errors.push('Slug обязателен');
      }

      if (!formData.sku || formData.sku.trim() === '') {
        errors.push('Артикул обязателен');
      }

      if (!formData.categoryId) {
        errors.push('Категория обязательна');
      }

      if (!formData.price || formData.price <= 0) {
        errors.push('Цена должна быть больше 0');
      }

      if (errors.length > 0) {
        alert('⚠️ Ошибки валидации:\n\n' + errors.map(e => '• ' + e).join('\n'));
        setIsSaving(false);
        return;
      }

      // Очистка черновика
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      if (onSave) {
        await onSave(formData);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
    alert('Черновик сохранен');
  };

  const handleClearDraft = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setFormData(prev => ({
      ...prev,
      name: '',
      slug: '',
      description: '',
      fullDescription: '',
      price: 0,
      oldPrice: null,
      discountValue: 0,
      specifications: [],
      variants: [],
      tags: [],
      images: [],
      parseSources: [],
    }));
  };

  // Обновляем общий остаток на основе складов
  const totalStock = formData.warehouseStocks.reduce((sum, ws) => sum + ws.quantity, 0);

  const handleWarehouseChange = (warehouseId: string, quantity: number) => {
    setFormData(prev => {
      const existing = prev.warehouseStocks.find(ws => ws.warehouseId === warehouseId);
      if (existing) {
        if (quantity === 0) {
          return {
            ...prev,
            warehouseStocks: prev.warehouseStocks.filter(ws => ws.warehouseId !== warehouseId),
          };
        }
        return {
          ...prev,
          warehouseStocks: prev.warehouseStocks.map(ws =>
            ws.warehouseId === warehouseId ? { ...ws, quantity } : ws
          ),
        };
      } else if (quantity > 0) {
        return {
          ...prev,
          warehouseStocks: [...prev.warehouseStocks, { warehouseId, quantity, reserved: 0 }],
        };
      }
      return prev;
    });
  };

  const handleReservedChange = (warehouseId: string, reserved: number) => {
    setFormData(prev => ({
      ...prev,
      warehouseStocks: prev.warehouseStocks.map(ws =>
        ws.warehouseId === warehouseId
          ? { ...ws, reserved: Math.min(reserved, ws.quantity) }
          : ws
      ),
    }));
  };

  // Категории с деревом
  const categoryOptions = useMemo(() => {
    const buildOptions = (cats: Category[], level = 0): { value: string; label: string; disabled?: boolean }[] => {
      let options: { value: string; label: string; disabled?: boolean }[] = [];
      for (const cat of cats) {
        options.push({
          value: cat.id,
          label: `${'  '.repeat(level)}${cat.name}`,
        });
        if (cat.children && cat.children.length > 0) {
          options = [...options, ...buildOptions(cat.children, level + 1)];
        }
      }
      return options;
    };
    return [{ value: '', label: 'Выберите категорию', disabled: true }, ...buildOptions(categories)];
  }, [categories]);

  const brandOptions = useMemo(() => [
    { value: '', label: 'Выберите бренд', disabled: true },
    ...brands.map(b => ({ value: b.id, label: b.name })),
    { value: '__new__', label: '+ Добавить новый бренд' },
  ], [brands]);

  // Динамические характеристики для категории
  const currentCategorySpecs = useMemo(() => {
    return categorySpecifications;
  }, [categorySpecifications]);

  return (
    <div className="p-6 w-full max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[20px] font-bold text-white mb-1">
            {initialData?.id ? 'Редактирование товара' : 'Новый товар'}
          </h1>
          <p className="text-[13px] text-gray4">
            {initialData?.id ? `Артикул: ${initialData.sku}` : 'Заполните информацию о товаре'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleClearDraft}>
            Очистить
          </Button>
          <Button variant="secondary" onClick={handleSaveDraft}>
            Сохранить черновик
          </Button>
          <Button variant="secondary" onClick={() => setShowPreview(true)}>
            Предпросмотр
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            {initialData?.id ? 'Сохранить' : 'Создать товар'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray1 overflow-x-auto">
        {[
          { id: 'general', label: 'Основное' },
          { id: 'media', label: 'Изображения' },
          { id: 'pricing', label: 'Цена и скидки' },
          { id: 'inventory', label: 'Склады' },
          { id: 'variants', label: 'Варианты' },
          { id: 'seo', label: 'SEO' },
          { id: 'parser', label: 'Парсинг' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'px-5 py-[10px] text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'text-orange border-orange'
                : 'text-gray4 border-transparent hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

{/* 2-Column: Left = Основная информация, Right = Tab content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ЛЕВАЯ КОЛОНКА - Основная информация (всегда показывается) */}
        <div className="space-y-6">
          <Card title="Основная информация">
            <div className="space-y-4">
              <Input label="Название" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required placeholder="Название товара" />
              <Input label="Slug" value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} required placeholder="product-url" error={slugError} />
              <Input label="Артикул" value={formData.sku} onChange={(e) => handleChange('sku', e.target.value)} required placeholder="SKU-12345" />
              <Select label="Категория" value={formData.categoryId} onChange={(e) => handleChange('categoryId', e.target.value)} options={categoryOptions} required />
              <div>
                <Label>Бренд</Label>
                <select value={formData.brandId} onChange={(e) => { if (e.target.value === '__new__') { setShowNewBrand(true); } else { handleChange('brandId', e.target.value); setShowNewBrand(false); } }} className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-3 py-2 text-white text-[13px]">
                  {brandOptions.map((opt) => (<option key={opt.value} value={opt.value} disabled={'disabled' in opt ? opt.disabled : false}>{opt.label}</option>))}
                </select>
                {showNewBrand && (<div className="mt-2 flex gap-2"><input type="text" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} placeholder="Новый бренд" className="flex-1 bg-black3 border border-gray1 rounded px-2 py-1 text-white text-xs" /><Button size="sm" onClick={() => { handleChange('brandId', newBrandName); setNewBrandName(''); setShowNewBrand(false); }}>OK</Button></div>)}
              </div>
            </div>
          </Card>

          <Card title="Статусы">
            <div className="grid grid-cols-2 gap-3">
              <Checkbox label="Активен" checked={formData.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} />
              <Checkbox label="Рекоменд." checked={formData.isFeatured} onChange={(e) => handleChange('isFeatured', e.target.checked)} />
              <Checkbox label="Новинка" checked={formData.isNew} onChange={(e) => handleChange('isNew', e.target.checked)} />
              <Checkbox label="Хит" checked={formData.isHit} onChange={(e) => handleChange('isHit', e.target.checked)} />
            </div>
          </Card>
        </div>

        {/* ПРАВАЯ КОЛОНКА - Контент вкладки */}
        <div className="lg:col-span-2 space-y-6">
          {/* ОСНОВНОЕ */}
          {activeTab === 'general' && (
            <>
              <Card title="Описание">
                <div className="space-y-4">
                  <Textarea label="Краткое" value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} rows={3} maxLength={1000} hint={`${(formData.description || '').length}/1000`} />
                  <Textarea label="Полное" value={formData.fullDescription || ''} onChange={(e) => handleChange('fullDescription', e.target.value)} rows={10} placeholder="Markdown" />
                </div>
              </Card>
              <Card title="Характеристики">
                <SpecificationEditor specifications={formData.specifications} onChange={(specs) => handleChange('specifications', specs)} categorySpecs={currentCategorySpecs.map(s => ({ ...s, unit: s.unit ?? undefined, options: s.options ?? undefined }))} />
              </Card>
              <Card title="Теги">
                <TagInput tags={formData.tags} onChange={(tags) => handleChange('tags', tags)} popularTags={popularTags.map(t => ({ ...t, color: t.color ?? undefined }))} />
              </Card>
              <Card title="Габариты">
                <div className="grid grid-cols-4 gap-3">
                  <Input label="Вес (кг)" type="number" step="0.001" value={formData.weight || ''} onChange={(e) => handleChange('weight', e.target.value ? parseFloat(e.target.value) : null)} />
                  <Input label="Длина" type="number" step="0.01" value={formData.length || ''} onChange={(e) => handleChange('length', e.target.value ? parseFloat(e.target.value) : null)} />
                  <Input label="Ширина" type="number" step="0.01" value={formData.width || ''} onChange={(e) => handleChange('width', e.target.value ? parseFloat(e.target.value) : null)} />
                  <Input label="Высота" type="number" step="0.01" value={formData.height || ''} onChange={(e) => handleChange('height', e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
              </Card>
              <Card title="Гарантия">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Срок (мес)" type="number" value={formData.warrantyPeriod} onChange={(e) => handleChange('warrantyPeriod', parseInt(e.target.value) || 0)} />
                  <Select label="Тип" value={formData.warrantyType} onChange={(e) => handleChange('warrantyType', e.target.value as 'MANUFACTURER' | 'SELLER')} options={[{ value: 'MANUFACTURER', label: 'От производителя' }, { value: 'SELLER', label: 'От магазина' }]} />
                </div>
              </Card>
            </>
          )}

          {/* ИЗОБРАЖЕНИЯ */}
          {activeTab === 'media' && (
            <Card title="Изображения">
              <ProductImageUploader images={formData.images} onChange={(images) => handleChange('images', images)} productId={initialData?.id} />
            </Card>
          )}

          {/* ЦЕНА И СКИДКИ */}
          {activeTab === 'pricing' && (
            <>
              <Card title="Цена">
                <div className="space-y-4">
                  <Input label="Базовая (₽)" type="number" value={formData.price} onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)} required />
                  <Input label="Старая (₽)" type="number" value={formData.oldPrice || ''} onChange={(e) => handleChange('oldPrice', e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
              </Card>
              <Card title="Скидка">
                <div className="space-y-4">
                  <Select label="Тип" value={formData.discountType} onChange={(e) => handleChange('discountType', e.target.value as 'PERCENT' | 'FIXED')} options={[{ value: 'PERCENT', label: 'Процент (%)' }, { value: 'FIXED', label: 'Фиксированная (₽)' }]} />
                  <Input label="Значение" type="number" value={formData.discountValue} onChange={(e) => handleChange('discountValue', parseFloat(e.target.value) || 0)} />
                </div>
                {formData.discountValue > 0 && (
                  <div className="mt-4 p-4 bg-orange/10 border border-orange/20 rounded-[var(--radius)]">
                    <div className="text-gray4 text-xs mb-1">Цена со скидкой</div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange text-xl font-bold">{Math.round(discountedPrice).toLocaleString('ru-RU')} ₽</span>
                      <span className="text-gray4 line-through text-sm">{formData.price.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}

          {/* СКЛАДЫ */}
          {activeTab === 'inventory' && (
            <Card title="Остатки">
              <div className="space-y-4">
                <div className="flex justify-between pb-3 border-b border-gray1">
                  <span className="text-gray4">Всего</span>
                  <span className="text-orange font-bold text-lg">{totalStock} ед.</span>
                </div>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {warehouses.map((wh) => {
                    const stock = formData.warehouseStocks.find(ws => ws.warehouseId === wh.id);
                    const qty = stock?.quantity || 0;
                    const res = stock?.reserved || 0;
                    return (
                      <div key={wh.id} className="p-3 bg-black3 border border-gray1 rounded-[var(--radius)]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${wh.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                          <span className="font-bold text-white">{wh.name}</span>
                          <span className="text-gray4 text-xs">{wh.city}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <div className="text-[10px] text-gray4">В наличии</div>
                            <input type="number" min="0" value={qty} onChange={(e) => handleWarehouseChange(wh.id, parseInt(e.target.value) || 0)} className="w-full bg-black2 border border-gray1 rounded px-2 py-1 text-center text-white" disabled={!wh.isActive} />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray4">Резерв</div>
                            <input type="number" min="0" max={qty} value={res} onChange={(e) => handleReservedChange(wh.id, parseInt(e.target.value) || 0)} className="w-full bg-black2 border border-gray1 rounded px-2 py-1 text-center text-gray3" disabled={qty === 0 || !wh.isActive} />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray4">Доступно</div>
                            <div className={`text-center py-1 font-bold ${qty - res > 0 ? 'text-green-500' : 'text-gray4'}`}>{qty - res}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* ВАРИАНТЫ */}
          {activeTab === 'variants' && (
            <Card title="Варианты">
              <ProductVariantEditor variants={formData.variants} onChange={(variants) => handleChange('variants', variants)} />
            </Card>
          )}

          {/* SEO */}
          {activeTab === 'seo' && (
            <>
              <Card title="SEO">
                <div className="space-y-4">
                  <Input label="Meta Title" value={formData.metaTitle} onChange={(e) => handleChange('metaTitle', e.target.value)} maxLength={255} hint={`${(formData.metaTitle || '').length}/255`} />
                  <Textarea label="Meta Description" value={formData.metaDescription} onChange={(e) => handleChange('metaDescription', e.target.value)} rows={4} maxLength={500} hint={`${(formData.metaDescription || '').length}/500`} />
                  <Input label="Meta Keywords" value={formData.metaKeywords} onChange={(e) => handleChange('metaKeywords', e.target.value)} placeholder="关键词, через запятую" />
                </div>
              </Card>
              {(formData.metaTitle || formData.metaDescription) && (
                <Card title="Предпросмотр">
                  <div className="space-y-1">
                    <div className="text-[#1a0dab]">{formData.metaTitle || formData.name}</div>
                    <div className="text-[#006621] text-xs">https://1000fps.ru/product/{formData.slug}</div>
                    <div className="text-[#545454] text-sm">{formData.metaDescription || formData.description || '...'}</div>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* ПАРСИНГ */}
          {activeTab === 'parser' && (
            initialData?.id ? (
              <ProductParserConfig productId={initialData.id} useParserPrice={formData.useParserPrice} parseSources={formData.parseSources || []} parserStatus={parserStatus} isParsing={isParsing} parseProgress={parseProgress} onToggleParserPrice={(enabled) => handleChange('useParserPrice', enabled)} onUpdateSources={(sources) => handleChange('parseSources', sources)} onParse={handleParse} />
            ) : (
              <Card title="Парсинг">
                <p className="text-gray4">Сохраните товар, затем добавьте источники.</p>
              </Card>
            )
          )}
        </div>
      </div>

      {/* Модальное окно предпросмотра */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray1">
              <h2 className="font-display text-[18px] font-bold text-white">Предпросмотр товара</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray4 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-8">
                {/* Изображение */}
                <div>
                  {formData.images.length > 0 ? (
                    <div className="relative w-full aspect-square">
                      <Image
                        src={formData.images.find(img => img.isMain)?.url || formData.images[0].url}
                        alt={formData.name}
                        fill
                        className="object-cover rounded-[var(--radius)]"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-16 h-16 text-gray4">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Информация */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-[24px] font-bold text-white mb-2">
                      {formData.name || 'Название товара'}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] text-gray4">Артикул: <span className="text-orange font-mono">{formData.sku}</span></span>
                      {formData.isNew && (
                        <span className="text-[10px] px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-[var(--radius)] font-bold">
                          Новинка
                        </span>
                      )}
                      {formData.isHit && (
                        <span className="text-[10px] px-2 py-1 bg-orange/10 text-orange border border-orange/20 rounded-[var(--radius)] font-bold">
                          Хит
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-[32px] font-extrabold text-orange">
                      {Math.round(discountedPrice).toLocaleString('ru-RU')} ₽
                    </span>
                    {formData.oldPrice && (
                      <span className="text-[16px] text-gray4 line-through">
                        {formData.oldPrice.toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                  </div>

                  {formData.description && (
                    <p className="text-[13px] text-gray4">
                      {formData.description}
                    </p>
                  )}

                  {formData.specifications.length > 0 && (
                    <div>
                      <h4 className="text-[11px] uppercase tracking-wider text-gray3 font-bold mb-2">Характеристики</h4>
                      <div className="space-y-1">
                        {formData.specifications.slice(0, 5).map((spec, i) => (
                          <div key={i} className="flex justify-between text-[12px]">
                            <span className="text-gray4">{spec.name}</span>
                            <span className="text-white">{spec.value} {spec.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray1">
              <Button variant="secondary" onClick={() => setShowPreview(false)}>
                Закрыть
              </Button>
              <Button onClick={() => { setShowPreview(false); handleSave(); }}>
                Подтвердить и сохранить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Вспомогательная функция для генерации SKU
function generateSKU(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SKU-${timestamp}-${random}`;
}

export type { ProductFormData };
export default ProductForm;
