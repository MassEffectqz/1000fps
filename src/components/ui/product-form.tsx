'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Label, Button } from './form';

export interface ProductImageItem {
  id?: string;
  url: string;
  alt?: string;
  order: number;
  isMain: boolean;
  file?: File;
  preview?: string;
}

interface ProductImageUploaderProps {
  images: ProductImageItem[];
  onChange: (images: ProductImageItem[]) => void;
  productId?: string;
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  images,
  onChange,
  productId,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Cleanup blob URLs при размонтировании или изменении списка изображений
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.preview?.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
        if (img.url?.startsWith('blob:') && img.url !== img.preview) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [images]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    if (!productId) {
      // Если товара ещё нет (новый товар), используем локальные URL
      const newImages: ProductImageItem[] = Array.from(files)
        .filter(file => file.type.startsWith('image/'))
        .map((file, index) => ({
          url: URL.createObjectURL(file),
          preview: URL.createObjectURL(file),
          alt: file.name,
          order: images.length + index,
          isMain: images.length === 0 && index === 0,
          file,
        }));

      onChange([...images, ...newImages]);
      return;
    }

    setIsUploading(true);
    try {
      // Загружаем каждый файл на сервер
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('productId', productId);

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          const newImage: ProductImageItem = {
            url: result.url,
            preview: result.url,
            alt: file.name,
            order: images.length,
            isMain: images.length === 0,
          };
          onChange([...images, newImage]);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }, [images, onChange, productId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  }, [handleFiles]);

  const setMainImage = useCallback((index: number) => {
    onChange(images.map((img, i) => ({
      ...img,
      isMain: i === index,
    })));
  }, [images, onChange]);

  const removeImage = useCallback(async (index: number) => {
    const imageToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);

    // Очищаем blob URL для удаляемого изображения
    if (imageToRemove.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    if (imageToRemove.url?.startsWith('blob:') && imageToRemove.url !== imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    // Если изображение было загружено на сервер (не blob и не /images/), удаляем его
    if (productId && imageToRemove.url &&
        !imageToRemove.url.startsWith('blob:') &&
        !imageToRemove.url.startsWith('/images/')) {
      try {
        await fetch(`/api/admin/upload?url=${encodeURIComponent(imageToRemove.url)}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Delete image error:', error);
      }
    }

    // Обновляем порядковые номера и главное изображение
    onChange(newImages.map((img, i) => ({
      ...img,
      order: i,
      isMain: i === 0 || img.isMain,
    })));
  }, [images, onChange, productId]);

  const mainImageIndex = images.findIndex(img => img.isMain);

  return (
    <div className="space-y-4">
      {/* Drag & Drop зона */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-[var(--radius)] p-8 text-center transition-colors cursor-pointer',
          isDragging
            ? 'border-orange bg-orange/5'
            : 'border-gray1 hover:border-gray2 bg-black3',
          isUploading && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="image-upload"
          disabled={isUploading}
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          {isUploading ? (
            <>
              <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <div className="text-[13px] text-gray4">
                Загрузка изображений...
              </div>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 mx-auto mb-4 text-gray4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <div className="text-[13px] text-gray4 mb-2">
                Перетащите изображения сюда или <span className="text-orange">выберите файлы</span>
              </div>
              <div className="text-[11px] text-gray5">
                PNG, JPG, WEBP до 10MB
              </div>
            </>
          )}
        </label>
      </div>

      {/* Предпросмотр */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.preview || image.url || index}
              className={cn(
                'relative aspect-square rounded-[var(--radius)] overflow-hidden border-2 transition-colors group',
                image.isMain ? 'border-orange' : 'border-gray1'
              )}
            >
              <div className="relative w-full h-full">
                <Image
                  src={image.preview || image.url}
                  alt={image.alt || 'Product image'}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Бейдж главного изображения */}
              {image.isMain && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-orange text-white text-[10px] font-bold rounded-[var(--radius)]">
                  Главное
                </div>
              )}

              {/* Действия */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!image.isMain && (
                  <button
                    onClick={() => setMainImage(index)}
                    className="px-3 py-2 bg-orange text-white text-[11px] font-semibold rounded-[var(--radius)] hover:bg-orange2 transition-colors"
                    title="Сделать главным"
                  >
                    Главная
                  </button>
                )}
                <button
                  onClick={() => removeImage(index)}
                  className="px-3 py-2 bg-red-500 text-white text-[11px] font-semibold rounded-[var(--radius)] hover:bg-red-600 transition-colors"
                  title="Удалить"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>

              {/* Порядок */}
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-black/80 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Инфо */}
      {images.length > 0 && (
        <div className="flex items-center justify-between text-[12px] text-gray4">
          <span>
            Загружено: <strong className="text-white">{images.length}</strong> изображений
          </span>
          <span>
            Главное: <strong className="text-orange">#{mainImageIndex + 1}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

interface TagInputProps {
  tags: Array<{ tagId: string; name?: string; slug?: string; color?: string }>;
  onChange: (tags: Array<{ tagId: string; name?: string; slug?: string; color?: string }>) => void;
  popularTags?: Array<{ id: string; name: string; slug: string; color?: string; usageCount: number }>;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  popularTags = [],
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = popularTags.filter(
    tag =>
      tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.find(t => t.tagId === tag.id)
  );

  const addTag = (tagId: string, name: string, slug?: string, color?: string) => {
    if (!tags.find(t => t.tagId === tagId)) {
      onChange([...tags, { tagId, name, slug, color }]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagId: string) => {
    onChange(tags.filter(t => t.tagId !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      // Создаем новый тег с временным ID
      const tempId = `temp-${Date.now()}`;
      addTag(tempId, inputValue.trim());
    }
  };

  return (
    <div className="space-y-3">
      {/* Ввод тега */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Введите название тега и нажмите Enter"
          className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-[8px] text-white text-[13px] outline-none focus:border-orange transition-colors"
        />

        {/* Подсказки */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-black2 border border-gray1 rounded-[var(--radius)] shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((tag) => (
              <button
                key={tag.id}
                onClick={() => addTag(tag.id, tag.name, tag.slug, tag.color)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-black3 transition-colors border-b border-gray1 last:border-b-0"
              >
                <span className="text-[13px] text-white">{tag.name}</span>
                <span className="text-[11px] text-gray4">
                  {tag.usageCount} использований
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Список тегов */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={tag.tagId || index}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] text-[12px] font-semibold',
                tag.color
                  ? 'text-white'
                  : 'bg-orange/10 text-orange border border-orange/20'
              )}
              style={{
                backgroundColor: tag.color ? `${tag.color}20` : undefined,
                borderColor: tag.color ? tag.color : undefined,
              }}
            >
              {tag.name || 'Новый тег'}
              <button
                onClick={() => removeTag(tag.tagId)}
                className="hover:opacity-70"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

interface ProductVariantEditorProps {
  variants: Array<{
    id?: string;
    name: string;
    value: string;
    priceMod: number;
    stock: number;
    sku?: string;
    order: number;
  }>;
  onChange: (variants: Array<{
    id?: string;
    name: string;
    value: string;
    priceMod: number;
    stock: number;
    sku?: string;
    order: number;
  }>) => void;
}

export const ProductVariantEditor: React.FC<ProductVariantEditorProps> = ({
  variants,
  onChange,
}) => {
  const addVariant = () => {
    onChange([
      ...variants,
      {
        name: 'Цвет',
        value: '',
        priceMod: 0,
        stock: 0,
        order: variants.length,
      },
    ]);
  };

  const updateVariant = (index: number, field: string, value: unknown) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onChange(newVariants);
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const variantNames = ['Цвет', 'Размер', 'Материал', 'Другое'];

  return (
    <div className="space-y-4">
      {variants.map((variant, index) => (
        <div
          key={variant.id || index}
          className="bg-black3 border border-gray1 rounded-[var(--radius)] p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-orange/20 text-orange text-[11px] font-bold rounded-full flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-[13px] font-bold text-white">Вариант</span>
            </div>
            <button
              onClick={() => removeVariant(index)}
              className="text-gray4 hover:text-red-500 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Тип варианта</Label>
              <select
                value={variant.name}
                onChange={(e) => updateVariant(index, 'name', e.target.value)}
                className="w-full bg-black2 border border-gray1 rounded-[var(--radius)] px-3 py-[6px] text-white text-[13px] outline-none focus:border-orange"
              >
                {variantNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Значение</Label>
              <input
                type="text"
                value={variant.value}
                onChange={(e) => updateVariant(index, 'value', e.target.value)}
                placeholder="Например: Черный"
                className="w-full bg-black2 border border-gray1 rounded-[var(--radius)] px-3 py-[6px] text-white text-[13px] outline-none focus:border-orange"
              />
            </div>

            <div>
              <Label>Наценка (₽)</Label>
              <input
                type="number"
                value={variant.priceMod}
                onChange={(e) => updateVariant(index, 'priceMod', parseFloat(e.target.value) || 0)}
                className="w-full bg-black2 border border-gray1 rounded-[var(--radius)] px-3 py-[6px] text-white text-[13px] outline-none focus:border-orange"
              />
            </div>

            <div>
              <Label>Остаток (шт)</Label>
              <input
                type="number"
                value={variant.stock}
                onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                className="w-full bg-black2 border border-gray1 rounded-[var(--radius)] px-3 py-[6px] text-white text-[13px] outline-none focus:border-orange"
              />
            </div>

            <div className="col-span-2">
              <Label>Артикул</Label>
              <input
                type="text"
                value={variant.sku || ''}
                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                placeholder="Оставьте пустым для автогенерации"
                className="w-full bg-black2 border border-gray1 rounded-[var(--radius)] px-3 py-[6px] text-white text-[13px] outline-none focus:border-orange"
              />
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="secondary" onClick={addVariant} className="w-full">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Добавить вариант
      </Button>
    </div>
  );
};

interface SpecificationEditorProps {
  specifications: Array<{
    id?: string;
    name: string;
    value: string;
    unit?: string;
    isVariant: boolean;
    order: number;
  }>;
  onChange: (specs: Array<{
    id?: string;
    name: string;
    value: string;
    unit?: string;
    isVariant: boolean;
    order: number;
  }>) => void;
  categorySpecs?: Array<{
    id: string;
    name: string;
    type: string;
    unit?: string;
    required: boolean;
    options?: string;
  }>;
}

export const SpecificationEditor: React.FC<SpecificationEditorProps> = ({
  specifications,
  onChange,
  categorySpecs = [],
}) => {
  const addSpecification = () => {
    onChange([
      ...specifications,
      {
        name: '',
        value: '',
        unit: '',
        isVariant: false,
        order: specifications.length,
      },
    ]);
  };

  const updateSpecification = (index: number, field: string, value: unknown) => {
    const newSpecs = [...specifications];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    onChange(newSpecs);
  };

  const removeSpecification = (index: number) => {
    onChange(specifications.filter((_, i) => i !== index));
  };

  const fillFromCategory = () => {
    const newSpecs = categorySpecs.map((spec, index) => ({
      name: spec.name,
      value: '',
      unit: spec.unit || '',
      isVariant: false,
      order: specifications.length + index,
    }));
    onChange([...specifications, ...newSpecs]);
  };

  return (
    <div className="space-y-4">
      {categorySpecs.length > 0 && (
        <Button
          type="button"
          variant="secondary"
          onClick={fillFromCategory}
          className="w-full"
        >
          Заполнить из категории
        </Button>
      )}

      {specifications.map((spec, index) => (
        <div
          key={spec.id || index}
          className="bg-black3 border border-gray1 rounded-[var(--radius)] p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-orange/20 text-orange text-[11px] font-bold rounded-full flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-[13px] font-bold text-white">Характеристика</span>
            </div>
            <button
              onClick={() => removeSpecification(index)}
              className="text-gray4 hover:text-red-500 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <Label>Название</Label>
              <input
                type="text"
                value={spec.name}
                onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                placeholder="Например: Вес"
                className="w-full bg-black2 border border-gray1 rounded-[var(--radius)] px-3 py-[6px] text-white text-[13px] outline-none focus:border-orange"
              />
            </div>

            <div className="col-span-1">
              <Label>Значение</Label>
              <input
                type="text"
                value={spec.value}
                onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                placeholder="Например: 1.5"
                className="w-full bg-black2 border border-gray1 rounded-[var(--radius)] px-3 py-[6px] text-white text-[13px] outline-none focus:border-orange"
              />
            </div>

            <div className="col-span-1">
              <Label>Ед. измерения</Label>
              <input
                type="text"
                value={spec.unit || ''}
                onChange={(e) => updateSpecification(index, 'unit', e.target.value)}
                placeholder="Например: кг"
                className="w-full bg-black2 border border-gray1 rounded-[var(--radius)] px-3 py-[6px] text-white text-[13px] outline-none focus:border-orange"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="flex items-center gap-2 text-[12px] text-gray4">
              <input
                type="checkbox"
                checked={spec.isVariant}
                onChange={(e) => updateSpecification(index, 'isVariant', e.target.checked)}
                className="w-4 h-4 accent-orange"
              />
              Это вариант товара (влияет на цену/остаток)
            </label>
          </div>
        </div>
      ))}

      <Button type="button" variant="secondary" onClick={addSpecification} className="w-full">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Добавить характеристику
      </Button>
    </div>
  );
};
