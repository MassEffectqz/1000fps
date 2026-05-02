import Link from 'next/link';

const brands = [
  { name: 'ASUS', slug: 'asus' },
  { name: 'MSI', slug: 'msi' },
  { name: 'Gigabyte', slug: 'gigabyte' },
  { name: 'NVIDIA', slug: 'nvidia' },
  { name: 'AMD', slug: 'amd' },
  { name: 'Intel', slug: 'intel' },
  { name: 'Corsair', slug: 'corsair' },
  { name: 'Samsung', slug: 'samsung' },
];

export function BrandsSection() {
  return (
    <section className="py-4 sm:py-6 lg:py-10">
      <div className="container">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/catalog?brand=${brand.slug}`}
              className="h-[58px] flex items-center justify-center bg-black2 border border-gray1 rounded-[var(--radius)] font-display text-[13px] font-bold uppercase text-gray3 cursor-pointer transition-colors hover:border-orange hover:text-white"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
