interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * JSON-LD разметка для организации
 */
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '1000FPS',
    url: 'https://1000fps.ru',
    logo: 'https://1000fps.ru/logo.png',
    description: 'Интернет-магазин компьютерной техники в Волгограде. Более 50 000 товаров в наличии.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Волгоград',
      addressCountry: 'RU',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+7-902-650-05-11',
      contactType: 'customer service',
      availableLanguage: 'Russian',
    },
    sameAs: [
      'https://vk.com/1000fps',
      'https://t.me/1000fps',
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '08:00',
      closes: '22:00',
    },
    priceRange: '₽₽',
  };

  return <JsonLd data={data} />;
}

/**
 * JSON-LD разметка для интернет-магазина
 */
export function WebSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '1000FPS',
    url: 'https://1000fps.ru',
    description: 'Интернет-магазин компьютерной техники',
    inLanguage: 'ru',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://1000fps.ru/catalog?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    } as Record<string, unknown>,
  };

  return <JsonLd data={data} />;
}

/**
 * JSON-LD разметка для товара
 */
export function ProductJsonLd(product: {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  oldPrice?: number | null;
  description?: string | null;
  fullDescription?: string | null;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  images?: Array<{ url: string }>;
  brand?: { name: string } | null;
  category?: { name: string } | null;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.fullDescription || '',
    image: product.images?.map(img => `https://1000fps.ru${img.url}`) || [],
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || '1000FPS',
    },
    sku: product.sku,
    mpn: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'RUB',
      availability: (product.stock || 0) > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: '1000FPS',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      bestRating: 5,
      worstRating: 1,
    },
  };

  return <JsonLd data={data} />;
}

/**
 * JSON-LD разметка для хлебных крошек
 */
export function BreadcrumbJsonLd(items: Array<{
  name: string;
  url: string;
}>) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={data} />;
}

/**
 * JSON-LD разметка для статьи
 */
export function ArticleJsonLd(article: {
  headline: string;
  description: string;
  image: string[];
  datePublished: string;
  dateModified: string;
  author: { name: string };
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      '@type': 'Person',
      name: article.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: '1000FPS',
      logo: {
        '@type': 'ImageObject',
        url: 'https://1000fps.ru/logo.png',
      },
    },
  };

  return <JsonLd data={data} />;
}
