// ============================================
// Моковые данные для 1000FPS
// Только статичные данные (промо, бренды, статьи, футер)
// ============================================

export interface FooterLink {
  label: string;
  href: string;
  badge?: string;
}

// Промо блоки
export const promoBlocks = [
  {
    badge: 'Акция',
    badgeClass: 'badge-orange',
    title: 'Скидки до 30%',
    sub: 'на видеокарты',
    subtext: 'Только до конца месяца',
    decor: 'GPU',
  },
  {
    badge: 'Новинки',
    badgeClass: 'badge-white',
    title: 'Intel Core Ultra',
    sub: 'серия 200',
    subtext: 'Новое поколение уже в наличии',
    decor: 'CPU',
  },
  {
    badge: 'Готовые сборки',
    badgeClass: 'badge-gray',
    title: 'ПК от 45 000',
    sub: 'с гарантией 2 года',
    subtext: 'Протестированы перед отправкой',
    decor: 'PC',
  },
  {
    badge: 'Б/У',
    badgeClass: 'badge-orange',
    title: 'Техника б/у',
    sub: 'с проверкой',
    subtext: 'Гарантия 6 месяцев на всё',
    decor: 'B/U',
  },
];

// Бренды
export const brands = [
  'ASUS',
  'MSI',
  'Gigabyte',
  'NVIDIA',
  'AMD',
  'Intel',
  'Samsung',
  'Kingston',
  'Corsair',
  'G.Skill',
  'be quiet!',
  'DeepCool',
  'ZOTAC',
  'Palit',
  'PowerColor',
  'Sapphire',
  'ASRock',
  'Biostar',
  'Western Digital',
  'Seagate',
  'Crucial',
  'ADATA',
  'Team Group',
  'HyperX',
  'Logitech',
  'Razer',
  'Roccat',
];

// Статьи
export const articles = [
  {
    title: 'Как выбрать видеокарту',
    date: '2026-03-25',
    image: '/articles/gpu-guide.jpg',
  },
  {
    title: 'Сравнение процессоров AMD и Intel',
    date: '2026-03-20',
    image: '/articles/cpu-compare.jpg',
  },
  {
    title: 'Обзор новых RTX 5090',
    date: '2026-03-15',
    image: '/articles/rtx-5090.jpg',
  },
];

// Характеристики
export const features = [
  {
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    title: 'Официальная гарантия',
    desc: 'От 1 до 3 лет на все товары',
  },
  {
    icon: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',
    title: 'Безопасная оплата',
    desc: 'Картой онлайн или при получении',
  },
  {
    icon: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
    title: 'Быстрая доставка',
    desc: 'По всей России от 1 дня',
  },
  {
    icon: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14 21 3',
    title: 'Техподдержка 24/7',
    desc: 'Поможем с выбором и настройкой',
  },
];

// Footer данные
export const footerLinks: {
  catalog: FooterLink[];
  services: FooterLink[];
  about: FooterLink[];
  customers: FooterLink[];
} = {
  catalog: [
    { label: 'Видеокарты', href: '/catalog/gpu', badge: 'HIT' },
    { label: 'Процессоры', href: '/catalog/cpu' },
    { label: 'Материнские платы', href: '/catalog/motherboard' },
    { label: 'Оперативная память', href: '/catalog/ram' },
    { label: 'Накопители', href: '/catalog/storage' },
    { label: 'Мониторы', href: '/catalog/monitors' },
    { label: 'Ноутбуки', href: '/catalog/laptops' },
    { label: 'Блоки питания', href: '/catalog/psu' },
    { label: 'Охлаждение', href: '/catalog/cooling' },
    { label: 'Периферия', href: '/catalog/periph' },
  ],
  services: [
    { label: 'Конфигуратор ПК', href: '/configurator', badge: 'NEW' },
    { label: 'Сборка ПК', href: '/services/build' },
    { label: 'Трейд-ин', href: '/services/trade-in' },
    { label: 'Рассрочка 0%', href: '/services/credit' },
    { label: 'Гарантия', href: '/services/warranty' },
  ],
  about: [
    { label: 'О компании', href: '/about' },
    { label: 'Контакты', href: '/contacts' },
    { label: 'Магазины', href: '/stores' },
    { label: 'Вакансии', href: '/careers' },
    { label: 'Реквизиты', href: '/details' },
  ],
  customers: [
    { label: 'Доставка и оплата', href: '/delivery' },
    { label: 'Возврат', href: '/return' },
    { label: 'Пункты выдачи', href: '/pickup-points' },
    { label: 'Отзывы', href: '/reviews' },
    { label: 'Блог', href: '/blog' },
  ],
};

export const contacts = {
  phone: '8-800-555-35-35',
  phone2: '+7 (999) 123-45-67',
  email: 'info@1000fps.ru',
  address: 'г. Волгоград, ул. Еременко, 126',
  address2: 'г. Волжский, пр. Ленина, 14',
  schedule: 'Ежедневно 9:00–20:00',
};

export const socials = [
  { name: 'VK', href: 'https://vk.com/1000fps', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z' },
  { name: 'Telegram', href: 'https://t.me/1000fps', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' },
  { name: 'YouTube', href: 'https://youtube.com/1000fps', icon: 'M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z' },
];

export const payments = [
  { name: 'Visa', icon: '💳' },
  { name: 'Mastercard', icon: '💳' },
  { name: 'Мир', icon: '💳' },
  { name: 'СБП', icon: '📱' },
];

export const apps = [
  { name: 'App Store', href: '#', icon: '🍎' },
  { name: 'Google Play', href: '#', icon: '▶️' },
];

export const navLinks = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Конфигуратор', href: '/configurator' },
  { label: 'Доставка', href: '/delivery' },
  { label: 'Гарантия', href: '/warranty' },
  { label: 'Контакты', href: '/contacts' },
];
