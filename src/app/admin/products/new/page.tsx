'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

export default function AdminProductNewPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
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

  const loadData = useCallback(async () => {
    try {
      const [categoriesRes, brandsRes, warehousesRes, tagsRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/brands'),
        fetch('/api/admin/warehouses'),
        fetch('/api/admin/tags?popular=true&limit=20'),
      ]);

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        const flatCategories = Array.isArray(data) ? data : data.tree || data.list || [];
        // Строим дерево из плоского списка
        setCategories(buildCategoryTree(flatCategories));
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (data: ProductFormData) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/admin/products');
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error || 'Не удалось создать товар'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Произошла ошибка при сохранении товара');
    }
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
    <div className="w-full">
      <ProductForm
        categories={categories}
        brands={brands}
        warehouses={warehouses}
        popularTags={popularTags}
        onSave={handleSave}
      />
    </div>
  );
}
