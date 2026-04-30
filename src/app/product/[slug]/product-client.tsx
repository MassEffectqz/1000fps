'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Breadcrumbs, Badge, Button } from '@/components/ui';
import { ProductCard } from '@/components/ui/product-card';
import { WarehouseSelector } from '@/components/ui/warehouse-selector';
import { SupplierSelector, type SupplierData } from '@/components/ui/supplier-selector';
import { AddToCartButton, AddToWishlistButton } from '@/components/layout';
import { ReviewsList, ReviewForm } from '@/components/reviews';
import { useCompare } from '@/lib/context/compare-context';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  fullDescription: string | null;
  price: number;
  discountedPrice: number;
  oldPrice: number | null;
  discountValue: number;
  discountType: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
  stock: number;
  image: string | null;
  images: string[];
  specs: Array<{ name: string; value: string; unit: string | null }>;
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string; slug: string } | null;
  badges: Array<{ text: string; variant: 'orange' | 'green' | 'blue' | 'gray' | 'yellow' }>;
  warrantyPeriod: number;
  warrantyType: string;
  
  // Габариты и вес
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  
  // SEO поля
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  
  // Статусы
  isFeatured: boolean;
  isNew: boolean;
  isHit: boolean;
  isActive: boolean;
  
  // Варианты товара
  variants?: Array<{
    id: string;
    name: string;
    value: string;
    priceMod: number;
    stock: number;
    sku?: string | null;
    order: number;
  }>;
  
  warehouses?: Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string | null;
    inStock: boolean;
    quantity: number;
    price: number;
    formattedPrice: string;
  }>;
}

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  text: string;
  pros: string | null;
  cons: string | null;
  isVerified: boolean;
  helpful: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ProductPageClientProps {
  product: Product;
  breadcrumbItems: Array<{ label: string; href?: string }>;
  reviews: Review[];
  relatedProducts: Array<{
    id: string;
    name: string;
    price: number;
    oldPrice?: number;
    image?: string;
    rating: number;
    reviewCount: number;
    specs: string;
    badges: Array<{ text: string; variant: 'orange' | 'green' | 'blue' | 'gray' | 'yellow' }>;
    href: string;
  }>;
  userRole: 'ADMIN' | 'MANAGER' | 'CUSTOMER' | null;
}

export function ProductPageClient({
  product,
  breadcrumbItems,
  reviews,
  relatedProducts,
  userRole,
}: ProductPageClientProps) {
  const { addToCompare, isInCompare } = useCompare();
  const [activeTab, setActiveTab] = useState('specs');
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<{ transform: string; transformOrigin: string }>({ transform: 'none', transformOrigin: 'center' });
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const inCompare = isInCompare(product.id);

  // Загрузка данных о поставщиках
  const loadSuppliers = useCallback(async () => {
    setIsLoadingSuppliers(true);
    try {
      // Используем публичный endpoint
      const response = await fetch(`/api/public/products/${product.id}/suppliers`);
      if (response.ok) {
        const result = await response.json();
        const suppliersData = result.data || [];
        const supplierList: SupplierData[] = suppliersData.map((s: { id: string; name: string; url: string; price: number; oldPrice: number | null; deliveryTime: string | null; inStock: boolean; rating: number | null; reviewsCount: number | null }) => ({
          id: s.id,
          source: s.name,
          price: s.price,
          oldPrice: s.oldPrice,
          deliveryTime: s.deliveryTime || 'Не указан',
          inStock: s.inStock,
          rating: s.rating,
          reviewsCount: s.reviewsCount,
          url: s.url,
        }));
        setSuppliers(supplierList);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setIsLoadingSuppliers(false);
    }
  }, [product.id]);

  useEffect(() => {
    loadSuppliers();
  }, [product.id, loadSuppliers]);

  // Обработка движения мыши для зума
  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({
      transform: 'scale(2)',
      transformOrigin: `${x}% ${y}%`,
    });
  };

  const handleImageMouseLeave = () => {
    setZoomStyle({ transform: 'none', transformOrigin: 'center' });
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-black2 border-b border-gray1">
        <div className="container">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>

      <div className="container">
        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-6 lg:gap-8 py-4 lg:py-7 items-start">
          {/* Gallery */}
          <div className="sticky top-4">
            <div
              className="bg-black2 border border-gray1 rounded-[var(--radius)] p-8 mb-[10px] relative min-h-[400px] flex items-center justify-center overflow-hidden cursor-crosshair"
              onMouseMove={handleImageMouseMove}
              onMouseLeave={handleImageMouseLeave}
            >
              {product.badges.length > 0 && (
                <div className="absolute top-[14px] left-[14px] flex flex-col gap-[5px] z-10">
                  {product.badges.map((badge, idx) => (
                    <Badge key={idx} variant={badge.variant}>{badge.text}</Badge>
                  ))}
                </div>
              )}
              <div
                className="w-full h-full flex items-center justify-center cursor-zoom-in"
                onClick={() => setIsImageModalOpen(true)}
              >
                {product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="w-full h-full object-contain max-h-[500px] transition-transform duration-200 ease-out"
                    style={zoomStyle}
                    unoptimized
                  />
                ) : (
                  <svg viewBox="0 0 400 300" fill="none" className="w-full">
                    <rect x="20" y="60" width="360" height="180" rx="4" stroke="var(--gray2)" strokeWidth="2" />
                    <rect x="40" y="80" width="100" height="140" rx="2" stroke="var(--orange)" strokeWidth="2" />
                  </svg>
                )}
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.slice(0, 5).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      'w-20 h-[60px] bg-black2 border border-gray1 rounded-[var(--radius)] flex items-center justify-center cursor-pointer transition-colors p-[6px] flex-shrink-0',
                      selectedImage === idx ? 'border-orange' : 'hover:border-gray2'
                    )}
                  >
                    <div className="w-full h-full relative">
                      <Image
                        src={img}
                        alt=""
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            {product.brand && (
              <div className="text-[11px] text-gray3 uppercase tracking-wider mb-[6px]">
                Бренд: <Link href="#" className="text-orange">{product.brand.name}</Link>
              </div>
            )}

            <h1 className="font-display text-[clamp(18px,2vw,24px)] font-extrabold uppercase text-white2 mb-3 leading-[1.15]">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {(product.rating > 0 || product.reviewCount > 0) && (
                <div className="flex items-center gap-[6px]">
                  <span className="text-orange text-[13px]">
                    {'★'.repeat(Math.floor(product.rating))}
                    {'☆'.repeat(5 - Math.floor(product.rating))}
                  </span>
                  <a href="#reviews" className="text-[12px] text-orange hover:underline">
                    {product.reviewCount} отзывов
                  </a>
                </div>
              )}
              <span className="text-[12px] text-gray3">
                Арт: <span className="text-gray4">{product.sku}</span>
              </span>
              <span className="flex items-center gap-[5px] text-[12px] font-semibold text-green-500">
                <span className="w-[6px] h-[6px] bg-green-500 rounded-full inline-block"></span>
                В наличии ({product.stock} шт.)
              </span>
            </div>

            {/* Price */}
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-[18px] mb-4">
              <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                <span className="font-display text-[clamp(24px,5vw,36px)] font-extrabold text-white2 leading-none whitespace-nowrap">
                  {product.discountedPrice.toLocaleString('ru-RU')} руб.
                </span>
                {product.oldPrice && (
                  <>
                    <span className="text-[clamp(13px,3vw,16px)] text-gray3 line-through whitespace-nowrap">
                      {product.oldPrice.toLocaleString('ru-RU')} руб.
                    </span>
                    <span className="text-[clamp(10px,2.5vw,12px)] text-orange font-bold bg-orange/10 px-2 py-[2px] rounded-[var(--radius)] whitespace-nowrap">
                      -{(product.oldPrice - product.discountedPrice).toLocaleString('ru-RU')} руб.
                    </span>
                  </>
                )}
              </div>
              <div className="text-[11px] text-gray3 mt-[6px]">Цена действительна при заказе на сайте</div>
            </div>

{/* CTA */}
            <div className="mb-4">
              {/* Main button - В корзину */}
              <AddToCartButton
                productId={product.id}
                variant="primary"
                size="lg"
                fullWidth
                inStock={product.stock > 0}
              >
                В корзину
              </AddToCartButton>

              {/* Secondary actions row */}
              <div className="flex flex-wrap gap-2 mt-2">
                <AddToWishlistButton
                  productId={product.id}
                  variant="icon"
                  size="md"
                />
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-2 h-10 px-3 rounded-[var(--radius)] border text-[12px] font-medium transition-colors',
                    inCompare
                      ? 'bg-orange text-white border-orange'
                      : 'bg-black3 text-gray3 border-gray1 hover:border-orange hover:text-orange'
                  )}
                  onClick={() => {
                    if (inCompare) {
                      toast.info('Для удаления откройте страницу сравнения');
                    } else {
                      addToCompare(product.id);
                    }
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M18 20V10M12 20V4M6 20v-6" />
                  </svg>
                  <span className="hidden sm:inline">{inCompare ? 'В сравнении' : 'Сравнить'}</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 h-10 px-3 rounded-[var(--radius)] border border-gray1 bg-black3 text-gray3 text-[12px] font-medium hover:border-orange hover:text-orange transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M9 3h6M12 3v4M9 12h6M12 9v6" />
                  </svg>
                  <span className="hidden sm:inline">В конфигуратор</span>
                </button>
                {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="flex items-center gap-2 h-10 px-3 rounded-[var(--radius)] border border-orange bg-orange text-white text-[12px] font-medium hover:bg-orange/90 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span className="hidden md:inline">Редактировать</span>
                  </Link>
                )}
              </div>
            </div>
            </div>

            {/* Warehouse Selector */}
            {product.warehouses && product.warehouses.length > 0 && (
              <div className="mb-4">
                <WarehouseSelector
                  productId={product.id}
                  warehouses={product.warehouses}
                />
              </div>
            )}

            {/* Supplier Selector */}
            {suppliers.length > 0 && (
              <div className="mb-4">
                <SupplierSelector
                  productId={product.id}
                  suppliers={suppliers}
                  onRefresh={loadSuppliers}
                  isLoading={isLoadingSuppliers}
                />
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="flex items-center gap-2 border-b border-gray1 mb-6 overflow-x-auto scrollbar-none">
            {[
              { id: 'specs', label: 'Характеристики' },
              { id: 'dimensions', label: 'Габариты', show: product.weight || product.length || product.width || product.height },
              { id: 'variants', label: 'Варианты', show: product.variants && product.variants.length > 0 },
              { id: 'description', label: 'Описание' },
              { id: 'reviews', label: `Отзывы (${reviews.length})` },
            ].filter(tab => !tab.show || tab.show).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

          {activeTab === 'specs' && (
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] overflow-hidden">
              <div className="px-4 py-[14px] border-b border-gray1 text-[11px] font-bold tracking-wider uppercase text-orange">
                Все характеристики
              </div>
              <div className="divide-y divide-gray1">
                {product.specs.map((spec, idx) => (
                  <div key={idx} className="flex items-center px-4 py-3 text-[13px]">
                    <span className="text-gray3 w-48 flex-shrink-0">{spec.name}</span>
                    <span className="text-white2 font-medium">{spec.value}{spec.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dimensions' && (product.weight || product.length || product.width || product.height) && (
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] overflow-hidden">
              <div className="px-4 py-[14px] border-b border-gray1 text-[11px] font-bold tracking-wider uppercase text-orange">
                Габариты и вес
              </div>
              <div className="divide-y divide-gray1">
                {product.weight && (
                  <div className="flex items-center px-4 py-3 text-[13px]">
                    <span className="text-gray3 w-48 flex-shrink-0">Вес</span>
                    <span className="text-white2 font-medium">{Number(product.weight).toFixed(3)} кг</span>
                  </div>
                )}
                {product.length && (
                  <div className="flex items-center px-4 py-3 text-[13px]">
                    <span className="text-gray3 w-48 flex-shrink-0">Длина</span>
                    <span className="text-white2 font-medium">{Number(product.length).toFixed(2)} мм</span>
                  </div>
                )}
                {product.width && (
                  <div className="flex items-center px-4 py-3 text-[13px]">
                    <span className="text-gray3 w-48 flex-shrink-0">Ширина</span>
                    <span className="text-white2 font-medium">{Number(product.width).toFixed(2)} мм</span>
                  </div>
                )}
                {product.height && (
                  <div className="flex items-center px-4 py-3 text-[13px]">
                    <span className="text-gray3 w-48 flex-shrink-0">Высота</span>
                    <span className="text-white2 font-medium">{Number(product.height).toFixed(2)} мм</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'variants' && product.variants && product.variants.length > 0 && (
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] overflow-hidden">
              <div className="px-4 py-[14px] border-b border-gray1 text-[11px] font-bold tracking-wider uppercase text-orange">
                Доступные варианты
              </div>
              <div className="divide-y divide-gray1">
                {product.variants.map((variant, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-3 text-[13px]">
                    <div className="flex-1">
                      <div className="text-white2 font-medium">{variant.name}: {variant.value}</div>
                      {variant.sku && (
                        <div className="text-[11px] text-gray3 mt-1">Артикул: {variant.sku}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-white2 font-bold">
                        {(variant.priceMod !== 0 && variant.priceMod > 0 ? '+' : '') + variant.priceMod} ₽
                      </div>
                      <div className="text-[11px] text-gray3">
                        {variant.stock > 0 ? (
                          <span className="text-green-500">В наличии ({variant.stock} шт.)</span>
                        ) : (
                          <span className="text-red-500">Нет в наличии</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'description' && (
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6">
              <div 
                className="text-[14px] text-gray4 leading-relaxed prose prose-invert max-w-none
                  prose-p:mb-3 prose-p:last:mb-0
                  prose-strong:text-white2
                  prose-a:text-orange prose-a:no-underline hover:prose-a:underline
                  prose-ul:list-disc prose-ul:pl-5
                  prose-ol:list-decimal prose-ol:pl-5
                  prose-li:mb-1
                  prose-h3:text-white2 prose-h3:font-bold prose-h3:mt-4 prose-h3:mb-2
                  prose-h4:text-white2 prose-h4:font-semibold prose-h4:mt-3 prose-h4:mb-2"
                dangerouslySetInnerHTML={{ __html: product.fullDescription || product.description || '<p>Описание отсутствует</p>' }}
              />
            </div>
          )}

          {activeTab === 'reviews' && (
            <div id="reviews" className="space-y-8">
              {/* Форма отзыва */}
              <ReviewForm productId={product.id} />
              
              {/* Список отзывов */}
              <ReviewsList
                reviews={reviews}
                averageRating={product.rating}
                totalReviews={product.reviewCount}
                ratingDistribution={{
                  5: reviews.filter(r => r.rating === 5).length,
                  4: reviews.filter(r => r.rating === 4).length,
                  3: reviews.filter(r => r.rating === 3).length,
                  2: reviews.filter(r => r.rating === 2).length,
                  1: reviews.filter(r => r.rating === 1).length,
                }}
              />
            </div>
          )}
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-[clamp(18px,2.5vw,24px)] font-extrabold uppercase text-white2 mb-4">
              С этим товаром покупают
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  oldPrice={p.oldPrice}
                  image={p.image}
                  rating={p.rating}
                  reviewCount={p.reviewCount}
                  specs={p.specs}
                  badges={p.badges}
                  href={p.href}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center cursor-zoom-out"
          onClick={() => setIsImageModalOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-orange z-50 p-2"
            onClick={() => setIsImageModalOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation Left */}
          {product.images.length > 1 && (
            <button
              className="absolute left-4 text-white hover:text-orange z-50 p-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((prev) => (prev > 0 ? prev - 1 : product.images.length - 1));
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Navigation Right */}
          {product.images.length > 1 && (
            <button
              className="absolute right-4 text-white hover:text-orange z-50 p-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((prev) => (prev < product.images.length - 1 ? prev + 1 : 0));
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}

          {/* Main Image */}
          <div
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              width={1200}
              height={900}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-[var(--radius)]">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(idx);
                  }}
                  className={cn(
                    'w-16 h-12 bg-black2 border border-gray1 rounded-[var(--radius)] flex items-center justify-center cursor-pointer transition-colors p-[2px] flex-shrink-0',
                    selectedImage === idx ? 'border-orange' : 'hover:border-gray2'
                  )}
                >
                  <Image
                    src={img}
                    alt=""
                    width={60}
                    height={45}
                    className="w-full h-full object-contain"
                    sizes="60px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
