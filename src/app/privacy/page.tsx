import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Политика конфиденциальности — 1000fps',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Политика конфиденциальности' },
          ]}
        />
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">
            Политика конфиденциальности
          </h1>
          <div className="prose prose-invert prose-sm max-w-none text-gray3 space-y-6">
            <p>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей интернет-магазина 1000fps.ru.
            </p>
            <h2 className="text-white2 font-semibold text-lg">1. Общие положения</h2>
            <p>
              Мы ценим вашу конфиденциальность и прилагаем все усилия для защиты ваших персональных данных. Используя наш сайт, вы соглашаетесь с условиями данной политики.
            </p>
            <h2 className="text-white2 font-semibold text-lg">2. Какие данные мы собираем</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Имя и контактные данные при оформлении заказа</li>
              <li>Адрес доставки</li>
              <li>История заказов</li>
              <li>Cookies и данные о использовании сайта</li>
            </ul>
            <h2 className="text-white2 font-semibold text-lg">3. Как мы используем данные</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Обработка и доставка заказов</li>
              <li>Связь с клиентами</li>
              <li>Улучшение качества обслуживания</li>
              <li>Отправка информационных рассылок (с согласия)</li>
            </ul>
            <h2 className="text-white2 font-semibold text-lg">4. Защита данных</h2>
            <p>
              Мы применяем современные методы защиты данных от несанкционированного доступа, включая SSL-шифрование и защищённые серверы.
            </p>
            <h2 className="text-white2 font-semibold text-lg">5. Контакты</h2>
            <p>
              По вопросам о политике конфиденциальности обращайтесь: info@1000fps.ru
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}