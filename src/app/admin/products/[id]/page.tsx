'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductForm, { type ProductFormData } from '@/components/ui/product-form-container';

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

interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  order: number;
  isMain: boolean;
}

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceMod: number;
  stock: number;
  sku?: string | null;
  order: number;
}

interface ProductSpecification {
  id: string;
  name: string;
  value: string;
  unit?: string | null;
  isVariant: boolean;
  order: number;
}

interface ProductTag {
  id: string;
  tagId: string;
  tag: {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
  };
}

interface WarehouseStock {
  id: string;
  warehouseId: string;
  quantity: number;
  reserved: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string | null;
  fullDescription?: string | null;
  price: number;
  oldPrice?: number | null;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  warrantyPeriod: number;
  warrantyType: 'MANUFACTURER' | 'SELLER';
  isActive: boolean;
  isDraft: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isHit: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  categoryId: string;
  brandId?: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  specs: ProductSpecification[];
  tags: ProductTag[];
  warehouseStocks: WarehouseStock[];
}

export default function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [categorySpecifications, setCategorySpecifications] = useState<CategorySpecification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Функция для построения дерева категорий из плоского списка
  const buildCategoryTree = (flatCategories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // Создаем мапу всех категорий
    for (const cat of flatCategories) {
      categoryMap.set(cat.id, { ...cat, children: [] });
    }

    // Строим дерево
    for (const cat of flatCategories) {
      const category = categoryMap.get(cat.id);
      if (category) {
        if (cat.parentId) {
          const parent = categoryMap.get(cat.parentId);
          if (parent) {
            parent.children?.push(category);
          } else {
            rootCategories.push(category);
          }
        } else {
          rootCategories.push(category);
        }
      }
    }

    return rootCategories;
  };

  useEffect(() => {
    loadData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async (retryCount = 0) => {
    try {
      const [productRes, categoriesRes, brandsRes, warehousesRes, tagsRes] = await Promise.all([
        fetch(`/api/admin/products/${id}`),
        fetch('/api/admin/categories'),
        fetch('/api/admin/brands'),
        fetch('/api/admin/warehouses'),
        fetch('/api/admin/tags?popular=true&limit=20'),
      ]);

      // Next.js dev: lazy compilation — retry on 404
      const failed404 = [productRes, categoriesRes, brandsRes, warehousesRes, tagsRes]
        .some(r => r.status === 404);
      if (failed404 && retryCount < 3) {
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
        return loadData(retryCount + 1);
      }

      if (productRes.ok) {
        const productData = await productRes.json();
        
        // Загружаем поставщиков отдельно
        let suppliers = [];
        try {
          const suppliersRes = await fetch(`/api/admin/products/${id}/suppliers`);
          if (suppliersRes.ok) {
            const suppliersData = await suppliersRes.json();
            suppliers = suppliersData.data || [];
          }
        } catch (e) {
          console.warn('Failed to load suppliers:', e);
        }
        
        setProduct({ ...productData, suppliers });

        // Загружаем спецификации категории
        if (productData.category?.id) {
          const specsRes = await fetch(`/api/admin/categories/${productData.category.id}/specifications`);
          if (specsRes.ok) {
            setCategorySpecifications(await specsRes.json());
          }
        }
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        const flatCategories = Array.isArray(data) ? data : data.tree || data.list || [];
        
        // Строим дерево из плоского списка
        const categoryTree = buildCategoryTree(flatCategories);
        setCategories(categoryTree);
      }

      if (brandsRes.ok) {
        setBrands(await brandsRes.json());
      }

      if (warehousesRes.ok) {
        const data = await warehousesRes.json();
        setWarehouses(Array.isArray(data.warehouses) ? data.warehouses : []);
      }

      if (tagsRes.ok) {
        setPopularTags(await tagsRes.json());
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: ProductFormData) => {
    try {
      // Transform parseSources to string[] for API
      const payload = {
        ...data,
        parseSources: Array.isArray(data.parseSources)
          ? data.parseSources.map((s: { url?: string } | string) => typeof s === 'string' ? s : s.url ?? '')
          : [],
      };

      console.log('[Product Save] Отправляемые данные:', {
        id: initialData?.id,
        parseSources: payload.parseSources,
        parseSourcesCount: payload.parseSources.length,
      });

      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('[Product Save] Успешно сохранено');
        // НЕ делаем редирект сразу - даём пользователю проверить результат
        // router.push('/admin/products');
        alert('✅ Товар сохранён! Обновите страницу чтобы проверить что источники сохранились.');
      } else {
        const error = await response.json();
        console.error('[Product Save] Ошибка:', error);
        alert(`Ошибка: ${error.error || 'Не удалось обновить товар'}`);
      }
    } catch (error) {
      console.error('[Product Save] Save error:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/products');
      } else {
        alert('Ошибка при удалении товара');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Произошла ошибка при удалении товара');
    }
  };

  // Преобразуем данные продукта в формат формы
  const initialData = product ? {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    categoryId: product.categoryId,
    brandId: product.brandId || '',
    description: product.description || '',
    fullDescription: product.fullDescription || '',
    price: Number(product.price), // Цена в рублях
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    discountType: product.discountType,
    discountValue: Number(product.discountValue), // Процент скидки
    weight: product.weight ? Number(product.weight) : null, // Вес в кг
    length: product.length ? Number(product.length) : null, // Длина в см
    width: product.width ? Number(product.width) : null, // Ширина в см
    height: product.height ? Number(product.height) : null, // Высота в см
    warrantyPeriod: product.warrantyPeriod,
    warrantyType: product.warrantyType,
    isActive: product.isActive,
    isDraft: product.isDraft,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isHit: product.isHit,
    isUsed: (product as { isUsed?: boolean }).isUsed ?? false,
    metaTitle: product.metaTitle || '',
    metaDescription: product.metaDescription || '',
    metaKeywords: product.metaKeywords || '',
    images: product.images.map(img => ({
      id: img.id,
      url: img.url,
      alt: img.alt || undefined,
      order: img.order,
      isMain: img.isMain,
    })),
    variants: product.variants.map(v => ({
      id: v.id,
      name: v.name,
      value: v.value,
      priceMod: Number(v.priceMod), // Цена в рублях
      stock: v.stock,
      sku: v.sku || undefined,
      order: v.order,
    })),
    specifications: product.specs.map(s => ({
      id: s.id,
      name: s.name,
      value: s.value,
      unit: s.unit || undefined,
      isVariant: s.isVariant,
      order: s.order,
    })),
    tags: product.tags.map(pt => ({
      tagId: pt.tag.id,
      name: pt.tag.name,
      slug: pt.tag.slug,
      color: pt.tag.color || undefined,
    })),
    warehouseStocks: product.warehouseStocks.map(ws => ({
      warehouseId: ws.warehouseId,
      quantity: ws.quantity,
      reserved: ws.reserved,
    })),
    // Parse sources из Product.parserSources
    parseSources: (product as Product & { parseSources?: string[] }).parseSources?.map((url: string, i: number) => ({
      url,
      priority: i,
      isActive: true,
    })) || [],
    // Поставщики
    suppliers: (product as Product & { suppliers?: Array<Record<string, unknown>> }).suppliers || [],
  } : undefined;

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

  if (!product) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center text-gray4">
          <div className="text-[16px] mb-4">Товар не найден</div>
          <Link href="/admin/products" className="text-orange hover:underline">
            Вернуться к списку товаров
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ProductForm
        initialData={initialData}
        categories={categories}
        brands={brands}
        warehouses={warehouses}
        popularTags={popularTags}
        categorySpecifications={categorySpecifications}
        onSave={handleSave}
      />
      
      <Button variant="danger" onClick={handleDelete} className="mt-6 ml-6">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        Удалить товар
      </Button>
    </div>
  );
}

// Простой компонент кнопки для этой страницы
function Button({ variant = 'primary', className = '', children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-[var(--radius)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-5 py-[10px] text-[13px]';
  
  const variants = {
    primary: 'bg-orange text-white hover:bg-orange2',
    secondary: 'bg-black3 border border-gray1 text-gray4 hover:text-white hover:border-gray2',
    danger: 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
