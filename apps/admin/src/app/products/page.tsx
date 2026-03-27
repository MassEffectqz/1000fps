'use client';

import { useState } from 'react';
import { productsApi, categoriesApi, brandsApi } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================
// Types
// ============================================

interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string | { id: number; name: string };
  brand: string | { id: number; name: string };
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'low_stock' | 'out_of_stock';
  categoryId?: number;
  brandId?: number;
  description?: string;
}

// Mock данные (пока API не интегрировано)
const mockProducts: Product[] = [
  {
    id: 1,
    sku: 'RTX-4070-TI-S',
    name: 'NVIDIA GeForce RTX 4070 Ti Super',
    category: 'Видеокарты',
    brand: 'NVIDIA',
    price: 79990,
    stock: 47,
    status: 'active',
  },
  {
    id: 2,
    sku: 'R7-7800X3D',
    name: 'AMD Ryzen 7 7800X3D AM5',
    category: 'Процессоры',
    brand: 'AMD',
    price: 34990,
    stock: 23,
    status: 'active',
  },
  {
    id: 3,
    sku: 'TUF-B650-PLUS',
    name: 'ASUS TUF Gaming B650-PLUS',
    category: 'Материнские платы',
    brand: 'ASUS',
    price: 18990,
    stock: 3,
    status: 'low_stock',
  },
  {
    id: 4,
    sku: 'F5-6400J32',
    name: 'G.Skill Trident Z5 RGB 32GB',
    category: 'Оперативная память',
    brand: 'G.Skill',
    price: 12490,
    stock: 0,
    status: 'out_of_stock',
  },
  {
    id: 5,
    sku: 'MZ-V9P2T0',
    name: 'Samsung 990 Pro 2TB',
    category: 'Накопители',
    brand: 'Samsung',
    price: 14990,
    stock: 15,
    status: 'active',
  },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  active: { label: 'Активен', class: 'green' },
  inactive: { label: 'Неактивен', class: 'muted' },
  low_stock: { label: 'Мало', class: 'yellow' },
  out_of_stock: { label: 'Нет', class: 'red' },
};

export default function ProductsPanel() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const itemsPerPage = 20;

  // Загрузка товаров (API)
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', { page: currentPage, limit: itemsPerPage }],
    queryFn: () => productsApi.list({ page: currentPage, limit: itemsPerPage }),
  });

  // Загрузка категорий и брендов
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsApi.list(),
  });

  // Мутация для удаления
  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelectedProducts([]);
    },
  });

  // Используем данные API или fallback
  const products: Product[] = (productsData as ApiResponse<Product[]>)?.data || mockProducts;
  const categories = (categoriesData as ApiResponse<{ id: number; name: string; slug?: string }[]>)?.data || [];
  const brands = (brandsData as ApiResponse<{ id: number; name: string; slug?: string }[]>)?.data || [];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a: Product, b: Product) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'stock':
        comparison = a.stock - b.stock;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginatedProducts.map((p) => p.id as number));
    }
  };

  const toggleSelectProduct = (id: number) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((pid) => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const deleteSelected = async () => {
    if (!confirm(`Удалить ${selectedProducts.length} товаров?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedProducts.map((id) => productsApi.delete(id))
      );
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelectedProducts([]);
    } catch (error) {
      console.error('Failed to delete products:', error);
      alert('Ошибка при удалении товаров');
    }
  };

  const openCreate = () => {
    setEditingProduct(null);
    setSelectedImages([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setSelectedImages([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setSelectedImages((prev) => [...prev, ...newFiles]);

    // Создаем preview для всех изображений батчем, чтобы избежать race condition
    const previewPromises = newFiles.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises)
      .then((newPreviews) => {
        setImagePreviews((prev) => [...prev, ...newPreviews]);
      })
      .catch((error) => {
        console.error('Failed to create image previews:', error);
      });
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Валидация данных формы
    const categoryId = Number(formData.get('categoryId'));
    const brandId = Number(formData.get('brandId'));
    const price = Number(formData.get('price'));
    const stock = Number(formData.get('stock'));
    const name = formData.get('name')?.toString().trim() || '';
    const sku = formData.get('sku')?.toString().trim() || '';

    // Проверка категории
    if (!categoryId || categoryId <= 0) {
      alert('Выберите корректную категорию');
      return;
    }

    // Проверка бренда
    if (!brandId || brandId <= 0) {
      alert('Выберите корректный бренд');
      return;
    }

    // Проверка цены
    if (price <= 0) {
      alert('Цена должна быть больше 0');
      return;
    }

    // Проверка остатка
    if (stock < 0) {
      alert('Остаток не может быть отрицательным');
      return;
    }

    // Проверка названия
    if (name.length < 3) {
      alert('Название должно содержать минимум 3 символа');
      return;
    }

    const data: Record<string, unknown> = {
      name,
      sku,
      categoryId,
      brandId,
      price,
      stock,
      status: formData.get('status'),
      description: formData.get('description')?.toString().trim(),
    };

    try {
      // Сначала загружаем изображения
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        const uploadResult = await productsApi.uploadImages(selectedImages);
        imageUrls = uploadResult.urls || [];
      }

      if (editingProduct) {
        // Редактирование
        await productsApi.update(editingProduct.id as number, {
          ...data,
          images: imageUrls.length > 0 ? imageUrls : undefined,
        });
      } else {
        // Создание
        await productsApi.create({
          ...data,
          images: imageUrls,
        });
      }

      setShowModal(false);
      setSelectedImages([]);
      setImagePreviews([]);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Ошибка при сохранении товара');
    }
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-c gap-10 mb-16" style={{ justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Товары
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Управление каталогом товаров</p>
        </div>
        <div className="flex flex-c gap-8">
          <button className="btn btn--ghost">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="14"
              height="14"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Экспорт
          </button>
          <button className="btn btn--ghost">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="14"
              height="14"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m7-5v10l5-5-5-5z" />
            </svg>
            Импорт
          </button>
          <button className="btn btn--primary" onClick={openCreate}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="14"
              height="14"
            >
              <path d="M12 4v16m8-8H4" />
            </svg>
            Добавить товар
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card mb-16">
        <div className="card__body" style={{ padding: '14px 18px' }}>
          <div className="flex flex-c gap-10" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div className="header-search" style={{ width: '100%' }}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: '13px', height: '13px' }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Поиск по названию или SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div style={{ width: '180px' }}>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Все категории</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ width: '150px' }}>
              <select
                className="form-select"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="all">Все бренды</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id.toString()}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ width: '180px' }}>
              <select
                className="form-select"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
              >
                <option value="name-asc">Название (А-Я)</option>
                <option value="name-desc">Название (Я-А)</option>
                <option value="price-asc">Цена (возрастание)</option>
                <option value="price-desc">Цена (убывание)</option>
                <option value="stock-asc">Остаток (возрастание)</option>
                <option value="stock-desc">Остаток (убывание)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="card__head">
          <span className="card__title">
            Товары ({filteredProducts.length})
            {selectedProducts.length > 0 && (
              <span className="badge badge--orange ml-auto">
                Выбрано: {selectedProducts.length}
              </span>
            )}
          </span>
          {selectedProducts.length > 0 && (
            <button className="btn btn--ghost btn--sm tbl-btn--danger" onClick={deleteSelected}>
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
              Удалить
            </button>
          )}
        </div>
        <div className="card__body card__body--flush">
          {productsLoading ? (
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
              Загрузка...
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === paginatedProducts.length}
                      onChange={toggleSelectAll}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: 'var(--accent)',
                        cursor: 'pointer',
                      }}
                    />
                  </th>
                  <th>SKU</th>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Бренд</th>
                  <th style={{ textAlign: 'right' }}>Цена</th>
                  <th style={{ textAlign: 'center' }}>Остаток</th>
                  <th>Статус</th>
                  <th style={{ width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        style={{
                          width: '16px',
                          height: '16px',
                          accentColor: 'var(--accent)',
                          cursor: 'pointer',
                        }}
                      />
                    </td>
                    <td className="mono f11 text-white fw700">{product.sku}</td>
                    <td>
                      <div>
                        <div className="text-white fw700" style={{ marginBottom: '2px' }}>
                          {product.name}
                        </div>
                      </div>
                    </td>
                    <td>{typeof product.category === 'object' && product.category !== null ? product.category.name : product.category}</td>
                    <td>{typeof product.brand === 'object' && product.brand !== null ? product.brand.name : product.brand}</td>
                    <td className="text-right text-white fw700">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="text-center">
                      <span className={`badge badge--${product.stock < 5 ? 'yellow' : 'blue'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge badge--${statusConfig[product.status]?.class || 'muted'}`}
                      >
                        <span className="badge-dot" />
                        {statusConfig[product.status]?.label || product.status}
                      </span>
                    </td>
                    <td>
                      <div className="tbl-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="tbl-btn" onClick={() => openEdit(product)}>
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
                        <button
                          className="tbl-btn tbl-btn--danger"
                          onClick={() => deleteMutation.mutate(product.id)}
                        >
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL */}
      <div
        className={`modal-overlay ${showModal ? 'is-active' : ''}`}
        onClick={() => setShowModal(false)}
      >
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal__head">
            <span className="modal__title">
              {editingProduct ? 'Редактирование товара' : 'Новый товар'}
            </span>
            <button className="modal__close" onClick={() => setShowModal(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal__body">
            <div 
              className="upload-zone"
              onClick={() => document.getElementById('product-images')?.click()}
              style={{ cursor: 'pointer', marginBottom: '20px' }}
            >
              <div className="upload-zone__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </div>
              <div className="upload-zone__title">Перетащите изображения сюда</div>
              <div className="upload-zone__sub">или кликните для выбора файлов</div>
              <input
                id="product-images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageSelect(e.target.files)}
                style={{ display: 'none' }}
              />
            </div>

            {/* Preview изображений */}
            {imagePreviews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {imagePreviews.map((preview, index) => (
                  <div key={`${index}-${preview.slice(0, 30)}`} style={{ position: 'relative' }}>
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius)' }}
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.7)',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Название <span className="req">*</span>
                </label>
                <input type="text" name="name" className="form-input" defaultValue={editingProduct?.name} required />
              </div>
              <div className="form-group">
                <label className="form-label">
                  SKU <span className="req">*</span>
                </label>
                <input type="text" name="sku" className="form-input" defaultValue={editingProduct?.sku} required />
              </div>
            </div>

            <div className="form-row--3">
              <div className="form-group">
                <label className="form-label">
                  Категория <span className="req">*</span>
                </label>
                <select name="categoryId" className="form-select" defaultValue={editingProduct?.categoryId} required>
                  <option value="">Выберите категорию</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Бренд <span className="req">*</span>
                </label>
                <select name="brandId" className="form-select" defaultValue={editingProduct?.brandId} required>
                  <option value="">Выберите бренд</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Цена (₽) <span className="req">*</span>
                </label>
                <input type="number" name="price" className="form-input" defaultValue={editingProduct?.price} required />
              </div>
            </div>

            <div className="form-row--3">
              <div className="form-group">
                <label className="form-label">
                  Остаток <span className="req">*</span>
                </label>
                <input type="number" name="stock" className="form-input" defaultValue={editingProduct?.stock} required />
              </div>
              <div className="form-group">
                <label className="form-label">Статус</label>
                <select name="status" className="form-select" defaultValue={editingProduct?.status}>
                  <option value="active">Активен</option>
                  <option value="inactive">Неактивен</option>
                  <option value="low_stock">Мало</option>
                  <option value="out_of_stock">Нет в наличии</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Описание</label>
              <textarea
                name="description"
                className="form-textarea"
                rows={4}
                defaultValue={editingProduct?.description}
              ></textarea>
            </div>
          </div>
          <div className="modal__foot">
            <button type="button" className="btn btn--ghost" onClick={() => setShowModal(false)}>
              Отмена
            </button>
            <button type="submit" className="btn btn--primary">{editingProduct ? 'Сохранить' : 'Создать'}</button>
          </div>
          </form>
        </div>
      </div>
    </>
  );
}
