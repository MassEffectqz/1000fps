import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { getProducts } from '@/lib/actions/catalog';
import { ProductCard } from '@/components/ui/product-card';

export const metadata = {
  title: 'Акции и скидки | 1000fps',
  description: 'Товары со скидками и акциями. Выгодные предложения на видеокарты, процессоры и комплектующие.',
};

export default async function StocksPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');

  const productsData = await getProducts({
    page,
    limit: 20,
    hasDiscount: true,
    sortBy: 'sales',
  });

  const products = productsData.products;
  const pagination = productsData.pagination;

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-black2 border-b border-gray1">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Акции' },
            ]}
            className="py-4"
          />
        </div>
      </div>

      <div className="container py-10">
        <div className="mb-8">
          <h1 className="font-display text-[32px] font-extrabold uppercase text-white2 mb-2">
            Акции и скидки
          </h1>
          <p className="text-gray3">
            Выгодные предложения на все товары со скидками
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-gray2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <h2 className="font-display text-[20px] font-bold text-white2 mb-2">
              Акций пока нет
            </h2>
            <p className="text-gray3">
              Скоро появятся интересные предложения
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 bg-orange/10 border border-orange/20 rounded-[var(--radius)]">
              <p className="text-orange text-[14px]">
                Найдено {pagination.total} товаров со скидками
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  oldPrice={product.oldPrice || undefined}
                  image={product.image || undefined}
                  rating={product.rating || undefined}
                  reviewCount={product.reviewCount || undefined}
                  specs={product.specs || undefined}
                  badges={product.badges}
                  href={product.href}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                  <a
                    key={i}
                    href={`/stocks?page=${i + 1}`}
                    className={`px-4 py-2 rounded-[var(--radius)] border ${
                      page === i + 1
                        ? 'bg-orange text-white border-orange'
                        : 'bg-black2 border-gray1 text-gray3 hover:border-orange'
                    }`}
                  >
                    {i + 1}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}