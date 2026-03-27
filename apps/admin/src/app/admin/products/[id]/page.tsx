'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

// Mock product data
const mockProduct = {
  id: 1,
  name: 'NVIDIA GeForce RTX 4070 Ti Super OC 16 ГБ',
  sku: 'TUF-RTX4070TIS-O16G',
  description: 'Мощная видеокарта для игр и профессиональной работы',
  fullDescription: '<p>ASUS TUF Gaming GeForce RTX 4070 Ti Super OC 16 ГБ — это...</p>',
  price: 79990,
  oldPrice: 97500,
  stock: 47,
  categoryId: 3,
  brandId: 12,
  mainImageUrl: 'https://example.com/image.jpg',
  images: [],
  specifications: {
    gpu: 'NVIDIA GeForce RTX 4070 Ti Super',
    memory: '16 ГБ GDDR6X',
    busWidth: '256 бит',
    boostClock: '2640 МГц',
  },
  metaTitle: 'ASUS TUF Gaming GeForce RTX 4070 Ti Super',
  metaDescription: 'Купить видеокарту ASUS по выгодной цене',
};

const categories = [
  { id: 1, name: 'Процессоры' },
  { id: 2, name: 'Материнские платы' },
  { id: 3, name: 'Видеокарты' },
  { id: 4, name: 'Оперативная память' },
  { id: 5, name: 'Накопители' },
];

const brands = [
  { id: 1, name: 'AMD' },
  { id: 2, name: 'Intel' },
  { id: 12, name: 'ASUS' },
  { id: 13, name: 'MSI' },
  { id: 14, name: 'Gigabyte' },
];

export default function AdminProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'specs' | 'seo'>('general');

  const [formData, setFormData] = useState({
    name: isNew ? '' : mockProduct.name,
    sku: isNew ? '' : mockProduct.sku,
    description: isNew ? '' : mockProduct.description,
    fullDescription: isNew ? '' : mockProduct.fullDescription,
    price: isNew ? 0 : mockProduct.price,
    oldPrice: isNew ? null : mockProduct.oldPrice,
    stock: isNew ? 0 : mockProduct.stock,
    categoryId: isNew ? 0 : mockProduct.categoryId,
    brandId: isNew ? 0 : mockProduct.brandId,
    mainImageUrl: isNew ? '' : mockProduct.mainImageUrl,
    metaTitle: isNew ? '' : mockProduct.metaTitle,
    metaDescription: isNew ? '' : mockProduct.metaDescription,
  });

  const [specs, setSpecs] = useState<Record<string, string>>(
    isNew ? {} : mockProduct.specifications
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push('/admin/products');
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecChange = (key: string, value: string) => {
    setSpecs((prev) => ({ ...prev, [key]: value }));
  };

  const addSpecField = () => {
    const key = prompt('Название характеристики:');
    if (key) {
      setSpecs((prev) => ({ ...prev, [key]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Link href="/admin/products" className="hover:text-white transition">
              Товары
            </Link>
            <span>/</span>
            <span className="text-white">{isNew ? 'Новый товар' : formData.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-white uppercase font-display">
            {isNew ? 'Добавить товар' : 'Редактирование товара'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-[var(--black2)] border border-[var(--gray1)] rounded text-sm font-medium text-gray-400 hover:text-white transition"
          >
            Отмена
          </Link>
          <button
            onClick={() => document.querySelector('form')?.requestSubmit()}
            disabled={loading}
            className="px-6 py-2 bg-[var(--orange)] hover:bg-[var(--orange2)] disabled:bg-gray-600 text-white text-sm font-display font-bold uppercase tracking-wide rounded transition"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--gray1)]">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 text-sm font-medium transition relative ${
              activeTab === 'general' ? 'text-[var(--orange)]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Основное
            {activeTab === 'general' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--orange)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-sm font-medium transition relative ${
              activeTab === 'specs' ? 'text-[var(--orange)]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Характеристики
            {activeTab === 'specs' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--orange)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`pb-3 text-sm font-medium transition relative ${
              activeTab === 'seo' ? 'text-[var(--orange)]' : 'text-gray-400 hover:text-white'
            }`}
          >
            SEO
            {activeTab === 'seo' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--orange)]" />
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                  Название *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-[var(--black3)] border border-[var(--gray1)] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[var(--orange)] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                  Артикул (SKU) *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-[var(--black3)] border border-[var(--gray1)] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[var(--orange)] transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                  Категория *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                  required
                  className="w-full px-4 py-3 bg-[var(--black3)] border border-[var(--gray1)] rounded text-white focus:outline-none focus:border-[var(--orange)] transition"
                >
                  <option value={0}>Выберите категорию</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                  Бренд *
                </label>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: Number(e.target.value) })}
                  required
                  className="w-full px-4 py-3 bg-[var(--black3)] border border-[var(--gray1)] rounded text-white focus:outline-none focus:border-[var(--orange)] transition"
                >
                  <option value={0}>Выберите бренд</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                  Цена (₽) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-[var(--black3)] border border-[var(--gray1)] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[var(--orange)] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                  Старая цена (₽)
                </label>
                <input
                  type="number"
                  value={formData.oldPrice || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      oldPrice: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-[var(--black3)] border border-[var(--gray1)] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[var(--orange)] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                  Остаток на складе *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  required
                  min="0"
                  className="w-full px-4 py-3 bg-[var(--black3)] border border-[var(--gray1)] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[var(--orange)] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                  URL главного изображения
                </label>
                <input
                  type="url"
                  value={formData.mainImageUrl}
                  onChange={(e) => setFormData({ ...formData, mainImageUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--black3)] border border-[var(--gray1)] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[var(--orange)] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                Краткое описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-[var(--black3)] border border-[var(--gray1)] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[var(--orange)] transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                Полное описание (HTML)
              </label>
              <textarea
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 bg-[var(--black3)] border border-[var(--gray1)] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[var(--orange)] transition resize-none font-mono text-sm"
              />
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Характеристики</h3>
              <button
                type="button"
                onClick={addSpecField}
                className="px-3 py-1.5 bg-[var(--orange)] hover:bg-[var(--orange2)] text-white text-xs font-display font-bold uppercase rounded transition inline-flex items-center gap-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path d="M12 4v16m8-8H4" />
                </svg>
                Добавить
              </button>
            </div>

            {Object.entries(specs).map(([key, value]) => (
              <div key={key} className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    const newKey = e.target.value;
                    const newValue = specs[key];
                    delete specs[key];
                    setSpecs({ ...specs, [newKey]: newValue });
                  }}
                  className="px-4 py-3 bg-[var(--black3)] border border-[var(--gray1)] rounded text-white focus:outline-none focus:border-[var(--orange)] transition"
                  placeholder="Название"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleSpecChange(key, e.target.value)}
                    className="flex-1 px-4 py-3 bg-[var(--black3)] border border-[var(--gray1)] rounded text-white focus:outline-none focus:border-[var(--orange)] transition"
                    placeholder="Значение"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newSpecs = { ...specs };
                      delete newSpecs[key];
                      setSpecs(newSpecs);
                    }}
                    className="p-3 text-gray-400 hover:text-red-500 transition"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-5 h-5"
                    >
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {Object.keys(specs).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">Характеристики не добавлены</p>
            )}
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                maxLength={60}
                className="w-full px-4 py-3 bg-[var(--black3)] border border-[var(--gray1)] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[var(--orange)] transition"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.metaTitle.length}/60 символов</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                maxLength={160}
                rows={4}
                className="w-full px-4 py-3 bg-[var(--black3)] border border-[var(--gray1)] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[var(--orange)] transition resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.metaDescription.length}/160 символов
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
