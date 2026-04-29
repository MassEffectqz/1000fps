import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata = {
  title: 'Пользовательское соглашение — 1000fps',
};

export default function AgreementPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Пользовательское соглашение' },
          ]}
        />
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-[32px] font-display font-bold text-white2 mb-8">
            Пользовательское соглашение
          </h1>
          <div className="prose prose-invert prose-sm max-w-none text-gray3 space-y-6">
            <p>
              Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между интернет-магазином 1000fps.ru и пользователем сайта.
            </p>
            <h2 className="text-white2 font-semibold text-lg">1. Общие условия</h2>
            <p>
              Используя сайт 1000fps.ru, вы подтверждаете, что ознакомлены и согласны с условиями настоящего Соглашения. Если вы не согласны с каким-либо условием, вы не должны использовать сайт.
            </p>
            <h2 className="text-white2 font-semibold text-lg">2. Права и обязанности сторон</h2>
            <h3 className="text-white2 font-medium">2.1. Пользователь обязуется:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Предоставлять достоверную информацию при регистрации и оформлении заказов</li>
              <li>Не использовать сайт для противоправных целей</li>
              <li>Не нарушать работу сайта</li>
              <li>Соблюдать нормы законодательства РФ</li>
            </ul>
            <h3 className="text-white2 font-medium">2.2. Продавец обязуется:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Обеспечивать работоспособность сайта</li>
              <li>Обрабатывать заказы в установленные сроки</li>
              <li>Обеспечивать конфиденциальность персональных данных</li>
              <li>Предоставлять достоверную информацию о товарах</li>
            </ul>
            <h2 className="text-white2 font-semibold text-lg">3. Интеллектуальная собственность</h2>
            <p>
              Все материалы сайта, включая тексты, изображения, логотипы и дизайн, являются собственностью 1000fps.ru и защищены законодательством об интеллектуальной собственности. Копирование и использование материалов без разрешения запрещено.
            </p>
            <h2 className="text-white2 font-semibold text-lg">4. Ограничение ответственности</h2>
            <p>
              Продавец не несёт ответственности за убытки, возникшие в результате использования или невозможности использования сайта, включая упущенную выгоду.
            </p>
            <h2 className="text-white2 font-semibold text-lg">5. Изменение условий</h2>
            <p>
              Продавец оставляет за собой право изменять условия Соглашения в любое время. Изменения вступают в силу с момента публикации на сайте.
            </p>
            <h2 className="text-white2 font-semibold text-lg">6. Контакты</h2>
            <p>
              По вопросам, связанным с настоящим Соглашением, обращайтесь: info@1000fps.ru
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}