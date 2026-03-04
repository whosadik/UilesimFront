import { Breadcrumbs } from "../components/Breadcrumbs";

const TERMS_SECTIONS = [
  {
    id: "general",
    title: "1. Общие положения",
    content: `Настоящие Условия использования (далее — «Условия») регулируют доступ и использование платформы Uilesim (далее — «Платформа»), включая все сервисы, функции и контент, предоставляемые через веб-сайт и мобильные приложения.

Используя Платформу, вы соглашаетесь с настоящими Условиями. Если вы не согласны с какими-либо условиями, пожалуйста, не используйте Платформу.`,
  },
  {
    id: "account",
    title: "2. Учетная запись",
    content: `Для использования некоторых функций Платформы вам необходимо создать учетную запись. Вы обязуетесь предоставить точную и полную информацию при регистрации и поддерживать актуальность данных.

Вы несете ответственность за сохранность данных для входа в учетную запись и за все действия, совершенные под вашей учетной записью.`,
  },
  {
    id: "orders",
    title: "3. Заказы и оплата",
    content: `При оформлении заказа вы получаете подтверждение по электронной почте. Договор купли-продажи считается заключенным с момента отправки подтверждения.

Мы принимаем оплату банковскими картами, через электронные платежные системы и при получении (если доступно). Все цены указаны в тенге (₸) и включают НДС, если применимо.`,
  },
  {
    id: "delivery",
    title: "4. Доставка",
    content: `Сроки доставки зависят от вашего местоположения и выбранного способа доставки. Мы стремимся доставить заказы в указанные сроки, но не несем ответственности за задержки, вызванные обстоятельствами вне нашего контроля.

При получении заказа проверьте его целостность и комплектность. О любых проблемах необходимо сообщить в течение 24 часов.`,
  },
  {
    id: "returns",
    title: "5. Возврат и обмен",
    content: `Вы можете вернуть товар надлежащего качества в течение 14 дней с момента получения. Товар должен сохранять товарный вид, потребительские свойства и быть в оригинальной упаковке.

Возврат денежных средств осуществляется в течение 7-14 рабочих дней после получения и проверки возвращенного товара.`,
  },
  {
    id: "loyalty",
    title: "6. Программа лояльности",
    content: `Участие в программе лояльности бесплатно. Баллы начисляются за покупки и могут быть использованы для оплаты будущих заказов согласно условиям программы.

Мы оставляем за собой право изменять условия программы лояльности с предварительным уведомлением участников.`,
  },
  {
    id: "content",
    title: "7. Контент и интеллектуальная собственность",
    content: `Все материалы на Платформе, включая текст, изображения, логотипы и программное обеспечение, защищены авторским правом и являются собственностью Uilesim или наших партнеров.

Вы можете использовать контент исключительно в личных некоммерческих целях. Копирование, распространение или иное использование контента без письменного разрешения запрещено.`,
  },
  {
    id: "liability",
    title: "8. Ограничение ответственности",
    content: `Платформа предоставляется «как есть». Мы прилагаем все усилия для обеспечения точности информации, но не гарантируем отсутствие ошибок или непрерывную работу сервиса.

Мы не несем ответственности за косвенные убытки, упущенную выгоду или иные последствия, связанные с использованием или невозможностью использования Платформы.`,
  },
  {
    id: "changes",
    title: "9. Изменения условий",
    content: `Мы оставляем за собой право изменять настоящие Условия в любое время. Существенные изменения будут опубликованы на сайте с указанием даты вступления в силу.

Продолжение использования Платформы после внесения изменений означает ваше согласие с новыми Условиями.`,
  },
  {
    id: "contact",
    title: "10. Контактная информация",
    content: `По вопросам, связанным с настоящими Условиями, вы можете связаться с нами:

Email: legal@uilesim.kz
Телефон: +7 (727) 123-45-67
Адрес: г. Алматы, ул. Примерная, д. 123`,
  },
];

export default function TermsPage() {
  return (
    <div className="pt-20 lg:pt-28 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Условия использования" },
            ]}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Table of Contents */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-28 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Содержание</h3>
              <nav className="space-y-2">
                {TERMS_SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block text-sm text-gray-600 hover:text-pink-500 transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              {/* Header */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-3">
                  Условия использования
                </h1>
                <p className="text-gray-600">Последнее обновление: 3 марта 2026</p>
              </div>

              {/* Sections */}
              <div className="space-y-8">
                {TERMS_SECTIONS.map((section) => (
                  <section key={section.id} id={section.id}>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {section.title}
                    </h2>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </section>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Эти условия вступают в силу с момента их публикации на сайте.
                  Регулярно проверяйте актуальную версию документа.
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="/privacy"
                className="block p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="font-semibold text-gray-900 mb-1">
                  Политика конфиденциальности
                </div>
                <div className="text-sm text-gray-600">
                  Узнайте, как мы обрабатываем ваши данные
                </div>
              </a>
              <a
                href="/delivery-returns"
                className="block p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="font-semibold text-gray-900 mb-1">
                  Доставка и возврат
                </div>
                <div className="text-sm text-gray-600">
                  Условия доставки и возврата товаров
                </div>
              </a>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
