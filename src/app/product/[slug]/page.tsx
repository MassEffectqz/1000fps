/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation';
import { getProducts, getProductBySlug } from '@/lib/actions/catalog';
import { getWarehousesWithStock } from '@/lib/actions/warehouse';
import { getSession } from '@/lib/auth-helpers';
import { ProductPageClient } from './product-client';
import type { Product } from './product-client';
import { Metadata } from 'next';
import type { Review } from './product-client';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Генерация метаданных для SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const { prisma } = await import('@/lib/prisma');
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
      images: { where: { isMain: true }, take: 1 },
      category: { select: { name: true } },
      brand: { select: { name: true } },
    },
  });

  if (!product) {
    return { title: 'Товар не найден' };
  }

  const price = Number(product.price);
  const discountValue = Number(product.discountValue);
  let finalPrice = price;
  if (discountValue > 0) {
    finalPrice = product.discountType === 'PERCENT'
      ? price * (1 - discountValue / 100)
      : Math.max(0, price - discountValue);
  }

  const image = product.images[0]?.url;
  return {
    title: product.metaTitle || `${product.name} — купить в интернет-магазине 1000FPS`,
    description: product.metaDescription || `${product.name} — ${Math.round(finalPrice).toLocaleString('ru-RU')} ₽`,
    keywords: product.metaKeywords ? product.metaKeywords.split(',').map(k => k.trim()) : undefined,
    openGraph: {
      title: product.metaTitle || product.name,
      description: product.metaDescription || `${product.name} — ${Math.round(finalPrice).toLocaleString('ru-RU')} ₽`,
      images: image ? [image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.metaTitle || product.name,
      description: product.metaDescription || `${product.name} — ${Math.round(finalPrice).toLocaleString('ru-RU')} ₽`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const { prisma } = await import('@/lib/prisma');

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true, isDraft: false },
    include: {
      category: { include: { parent: true } },
      brand: true,
      images: { orderBy: { order: 'asc' } },
      specs: { orderBy: { order: 'asc' } },
      variants: { orderBy: { order: 'asc' } },
      tags: { include: { tag: true } },
      reviewItems: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, avatar: true } } },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const relatedProductsData = await getProducts({
    categoryId: product.categoryId,
    limit: 5,
    sortBy: 'popular',
  });

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

  const price = Number(product.price);
  const discountValue = Number(product.discountValue);
  let discountedPrice = price;
  if (discountValue > 0) {
    discountedPrice = product.discountType === 'PERCENT'
      ? price * (1 - discountValue / 100)
      : Math.max(0, price - discountValue);
  }

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
    weight: product.weight ? Number(product.weight) : null,
    length: product.length ? Number(product.length) : null,
    width: product.width ? Number(product.width) : null,
    height: product.height ? Number(product.height) : null,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    metaKeywords: product.metaKeywords,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isHit: product.isHit,
    isActive: product.isActive,
    image: product.images.find(img => img.isMain)?.url || product.images[0]?.url || null,
    images: product.images.map(img => img.url),
    specs: product.specs.map(spec => ({ name: spec.name, value: spec.value, unit: spec.unit })),
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
    warehouses: undefined,
  };

  if (discountedPrice < price) {
    const pct = product.discountType === 'PERCENT' ? discountValue : Math.round((discountValue / price) * 100);
    formattedProduct.badges.push({ text: `-${pct}%`, variant: 'orange' });
  }
  if (product.isHit) formattedProduct.badges.push({ text: 'Хит', variant: 'gray' });
  if (product.isNew) formattedProduct.badges.push({ text: 'NEW', variant: 'orange' });
  if (product.isFeatured) formattedProduct.badges.push({ text: 'Рекомендуем', variant: 'blue' });
  if (product.stock > 0) formattedProduct.badges.push({ text: 'В наличии', variant: 'green' });

  const warehousesData = await getWarehousesWithStock(product.id);
  if (warehousesData && warehousesData.warehouses.length > 0) {
    formattedProduct.warehouses = warehousesData.warehouses;
  }

  const reviewsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/reviews?productId=${product.id}&limit=10&sortBy=newest`,
    { next: { revalidate: 60 } }
  );
  let reviews: Review[] = [];
  if (reviewsResponse.ok) {
    const reviewsData = await reviewsResponse.json();
    reviews = reviewsData.reviews || [];
  }

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { label: product.category.name, href: `/catalog?categoryId=${product.categoryId}` },
    { label: product.name },
  ];

  const session = await getSession();
  const userRole = session?.role || null;

  return (
    <ProductPageClient
      product={formattedProduct}
      breadcrumbItems={breadcrumbItems}
      reviews={reviews}
      relatedProducts={relatedProducts}
      userRole={userRole}
    />
  );
}