import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/actions/catalog';
import { getWarehousesWithStock } from '@/lib/actions/warehouse';
import { ProductPageClient } from './product-client';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import type { Review } from './product-client';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Генерация метаданных для SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true, isDraft: false },
    select: {
      name: true,
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
      price: true,
      discountValue: true,
      discountType: true,
      images: {
        where: { isMain: true },
        take: 1,
      },
      category: {
        select: { name: true },
      },
      brand: {
        select: { name: true },
      },
    },
  });

  if (!product) {
    return {
      title: 'Товар не найден',
    };
  }

  // Вычисляем цену со скидкой
  const price = Number(product.price);
  const discountValue = Number(product.discountValue);
  let finalPrice = price;

  if (discountValue > 0) {
    if (product.discountType === 'PERCENT') {
      finalPrice = price * (1 - discountValue / 100);
    } else {
      finalPrice = Math.max(0, price - discountValue);
    }
  }

  const image = product.images[0]?.url;
  const brandName = product.brand?.name;
  const categoryName = product.category?.name;

  return {
    title: product.metaTitle || `${product.name} — купить в интернет-магазине 1000FPS`,
    description: product.metaDescription || `${brandName ? brandName + ' ' : ''}${product.name} в категории ${categoryName}. Цена: ${Math.round(finalPrice).toLocaleString('ru-RU')} ₽.`,
    keywords: product.metaKeywords ? product.metaKeywords.split(',').map(k => k.trim()) : undefined,
    openGraph: {
      title: product.metaTitle || product.name,
      description: product.metaDescription || `${brandName ? brandName + ' ' : ''}${product.name} — ${Math.round(finalPrice).toLocaleString('ru-RU')} ₽`,
      images: image ? [image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.metaTitle || product.name,
      description: product.metaDescription || `${brandName ? brandName + ' ' : ''}${product.name} — ${Math.round(finalPrice).toLocaleString('ru-RU')} ₽`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Загружаем товар с связями напрямую через Prisma
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true, isDraft: false },
    include: {
      category: {
        include: {
          parent: true,
        },
      },
      brand: true,
      images: {
        orderBy: { order: 'asc' },
      },
      specs: {
        orderBy: { order: 'asc' },
      },
      variants: {
        orderBy: { order: 'asc' },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      reviewItems: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Загружаем похожие товары (из той же категории)
  const relatedProductsData = await getProducts({
    categoryId: product.categoryId,
    limit: 5,
    sortBy: 'popular',
  });

  // Форматируем похожие товары
  const relatedProducts = relatedProductsData.products
    .filter(p => p.id !== product.id)
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.discountedPrice,
      oldPrice: p.oldPrice || undefined,
      image: p.image || undefined,
      rating: p.rating,
      reviewCount: p.reviewCount,
      specs: p.specs,
      badges: p.badges,
      href: p.href,
    }));

  // Вычисляем цену со скидкой
  const price = Number(product.price);
  const discountValue = Number(product.discountValue);
  let discountedPrice = price;

  if (discountValue > 0) {
    if (product.discountType === 'PERCENT') {
      discountedPrice = price * (1 - discountValue / 100);
    } else {
      discountedPrice = Math.max(0, price - discountValue);
    }
  }

  // Форматируем товар для клиентского компонента
  const formattedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    fullDescription: product.fullDescription,
    price: price,
    discountedPrice: Math.round(discountedPrice),
    oldPrice: discountedPrice !== price ? price : null,
    discountValue: discountValue,
    discountType: product.discountType,
    rating: product.rating,
    reviewCount: product.reviewCount,
    salesCount: product.salesCount,
    stock: product.stock,
    warrantyPeriod: product.warrantyPeriod,
    warrantyType: product.warrantyType,

    // Габариты и вес
    weight: product.weight ? Number(product.weight) : null,
    length: product.length ? Number(product.length) : null,
    width: product.width ? Number(product.width) : null,
    height: product.height ? Number(product.height) : null,

    // SEO поля
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    metaKeywords: product.metaKeywords,

    // Статусы
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isHit: product.isHit,
    isActive: product.isActive,

    image: product.images.find(img => img.isMain)?.url || product.images[0]?.url || null,
    images: product.images.map(img => img.url),
    specs: product.specs.map(spec => ({
      name: spec.name,
      value: spec.value,
      unit: spec.unit,
    })),
    variants: product.variants.map(variant => ({
      id: variant.id,
      name: variant.name,
      value: variant.value,
      priceMod: Number(variant.priceMod),
      stock: variant.stock,
      sku: variant.sku,
      order: variant.order,
    })),
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
    brand: product.brand ? {
      id: product.brand.id,
      name: product.brand.name,
      slug: product.brand.slug,
    } : null,
    badges: [] as Array<{ text: string; variant: 'orange' | 'green' | 'blue' | 'gray' | 'yellow' }>,
    warehouses: undefined as Array<{
      id: string;
      name: string;
      address: string;
      city: string;
      phone: string | null;
      inStock: boolean;
      quantity: number;
      price: number;
      formattedPrice: string;
    }> | undefined,
  };

  // Добавляем бейджи
  if (discountedPrice < price) {
    const discountPercent = product.discountType === 'PERCENT'
      ? discountValue
      : Math.round((discountValue / price) * 100);
    formattedProduct.badges.push({ text: `-${discountPercent}%`, variant: 'orange' });
  }

  if (product.isHit) {
    formattedProduct.badges.push({ text: 'Хит', variant: 'gray' });
  }

  if (product.isNew) {
    formattedProduct.badges.push({ text: 'NEW', variant: 'orange' });
  }

  if (product.isFeatured) {
    formattedProduct.badges.push({ text: 'Рекомендуем', variant: 'blue' });
  }

  if (product.stock > 0) {
    formattedProduct.badges.push({ text: 'В наличии', variant: 'green' });
  }

  // Загружаем данные о складах с наличием
  const warehousesData = await getWarehousesWithStock(product.id);
  if (warehousesData && warehousesData.warehouses.length > 0) {
    formattedProduct.warehouses = warehousesData.warehouses;
  }

  // Загружаем отзывы из API
  const reviewsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/reviews?productId=${product.id}&limit=10&sortBy=newest`,
    { next: { revalidate: 60 } } // Кэшируем на 1 минуту
  );
  
  let reviews: Review[] = [];
  
  if (reviewsResponse.ok) {
    const reviewsData = await reviewsResponse.json();
    reviews = reviewsData.reviews || [];
  }

  // Собираем breadcrumb
  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { label: product.category.name, href: `/catalog?categoryId=${product.categoryId}` },
    { label: product.name },
  ];

  return (
    <ProductPageClient
      product={formattedProduct}
      breadcrumbItems={breadcrumbItems}
      reviews={reviews}
      relatedProducts={relatedProducts}
    />
  );
}
