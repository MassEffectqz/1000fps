import Link from 'next/link';

const articles = [
  {
    category: 'Обзор',
    date: '15 марта 2024',
    title: 'NVIDIA GeForce RTX 4070 Ti Super — тесты в 15 играх',
    desc: 'Детальное тестирование новой видеокарты в разрешении 2K и 4K. Стоит ли переплачивать?',
  },
  {
    category: 'Сравнение',
    date: '12 марта 2024',
    title: 'AMD Ryzen 7 7800X3D vs Intel Core i7-14700K',
    desc: 'Сравниваем лучшие игровые процессоры. Кто победит в играх и рабочих задачах?',
  },
  {
    category: 'Гайд',
    date: '8 марта 2024',
    title: 'Как выбрать блок питания для игрового ПК',
    desc: 'Рассказываем про мощность, сертификацию 80 Plus и другие важные параметры.',
  },
];

export function ArticlesSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="flex items-baseline gap-4 mb-6">
          <h2 className="text-[clamp(22px,3vw,34px)]">Последние статьи</h2>
          <Link href="/blog" className="text-[12px] text-orange hover:text-orange3">
            Все статьи &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {articles.map((article, index) => (
            <article
              key={index}
              className="bg-black2 border border-gray1 rounded-[var(--radius)] overflow-hidden transition-colors hover:border-orange group"
            >
              <div className="h-[160px] bg-black3 border-b border-gray1 flex items-center justify-center font-display text-[52px] font-extrabold text-gray2 uppercase tracking-tighter relative overflow-hidden">
                {article.category}
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.015) 10px, rgba(255,255,255,0.015) 11px)',
                  }}
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-orange">
                    {article.category}
                  </span>
                  <span className="text-[11px] text-gray3">{article.date}</span>
                </div>
                <Link href="#" className="block font-display text-[15px] font-extrabold uppercase text-white2 leading-[1.3] mb-2 group-hover:text-orange transition-colors">
                  {article.title}
                </Link>
                <p className="text-[12px] text-gray3 leading-[1.5]">{article.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
