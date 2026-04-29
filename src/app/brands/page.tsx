'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  _count: {
    products: number;
  };
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => {
        setBrands(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(search.toLowerCase())
  );

  const letters = [...new Set(filteredBrands.map(b => b.name[0].toUpperCase()))].sort();
  const groupedBrands = letters.reduce((acc, letter) => {
    acc[letter] = filteredBrands.filter(b => b.name[0].toUpperCase() === letter);
    return acc;
  }, {} as Record<string, Brand[]>);

  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Бренды' },
          ]}
          className="mb-6"
        />

        <div className="text-center mb-10">
          <h1 className="font-display text-[32px] font-extrabold uppercase text-white2 mb-3">
            Бренды
          </h1>
          <p className="text-gray3 text-[14px]">
            Выберите бренд для просмотра товаров
          </p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Поиск бренда..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md mx-auto block px-4 py-3 bg-black2 border border-gray1 rounded-[var(--radius)] text-white placeholder-gray3 focus:border-orange focus:outline-none"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray3">Бренды не найдены</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedBrands).map(([letter, letterBrands]) => (
              <div key={letter}>
                <div className="text-[24px] font-display font-bold text-orange mb-4 border-b border-gray1 pb-2">
                  {letter}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {letterBrands.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/catalog?brand=${brand.slug}`}
                      className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4 hover:border-orange transition-colors group"
                    >
                      {brand.logo ? (
                        <div className="h-16 flex items-center justify-center mb-3">
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            width={100}
                            height={60}
                            className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all"
                          />
                        </div>
                      ) : (
                        <div className="h-16 flex items-center justify-center mb-3">
                          <span className="text-[32px] font-display font-bold text-gray2 group-hover:text-orange transition-colors">
                            {brand.name[0]}
                          </span>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-[14px] font-medium text-white2 group-hover:text-orange transition-colors">
                          {brand.name}
                        </div>
                        <div className="text-[11px] text-gray3 mt-1">
                          {brand._count.products} товаров
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}