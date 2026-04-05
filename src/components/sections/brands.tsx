const brands = [
  'ASUS', 'MSI', 'Gigabyte', 'NVIDIA', 'AMD', 'Intel', 'Corsair', 'Samsung',
];

export function BrandsSection() {
  return (
    <section className="py-4 sm:py-6 lg:py-10">
      <div className="container">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {brands.map((brand) => (
            <div
              key={brand}
              className="h-[58px] flex items-center justify-center bg-black2 border border-gray1 rounded-[var(--radius)] font-display text-[13px] font-bold uppercase text-gray3 cursor-pointer transition-colors hover:border-orange hover:text-white"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
