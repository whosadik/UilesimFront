import { Breadcrumbs } from "../components/Breadcrumbs";
import { useI18n } from "../../shared/i18n/LanguageContext";

const termsPageCopy = {
  ru: {
    breadcrumb: "Условия использования",
    toc: "Содержание",
    title: "Условия использования",
    updated: "Последнее обновление: 3 марта 2026",
    footer: "Эти условия вступают в силу с момента их публикации на сайте. Регулярно проверяйте актуальную версию документа.",
    privacyTitle: "Политика конфиденциальности",
    privacyText: "Узнайте, как мы обрабатываем ваши данные",
    deliveryTitle: "Доставка и возврат",
    deliveryText: "Условия доставки и возврата товаров",
    sections: [
      {
        id: "general",
        title: "1. Общие положения",
        content: `Настоящие Условия использования регулируют доступ и использование платформы Uilesim, включая сервисы, функции и контент, доступные через сайт и приложения.

Используя платформу, вы соглашаетесь с этими условиями.`,
      },
      {
        id: "account",
        title: "2. Учетная запись",
        content: `Для части функций требуется учетная запись. Вы обязуетесь предоставлять точную информацию и поддерживать ее актуальность.

Вы отвечаете за сохранность данных для входа и за действия, совершенные под вашей учетной записью.`,
      },
      {
        id: "orders",
        title: "3. Заказы и оплата",
        content: `После оформления заказа вы получаете подтверждение по электронной почте. Мы принимаем банковские карты, электронные платежи и иные доступные способы оплаты.

Все цены указываются в тенге и включают применимые налоги, если иное не указано.`,
      },
      {
        id: "delivery",
        title: "4. Доставка",
        content: `Сроки доставки зависят от региона и выбранного способа получения. Мы стремимся соблюдать заявленные сроки, но не отвечаем за задержки вне разумного контроля.

При получении заказа проверьте комплектность и состояние товара.`,
      },
      {
        id: "returns",
        title: "5. Возврат и обмен",
        content: `Вы можете вернуть товар надлежащего качества в течение 14 дней с момента получения, если сохранены товарный вид и упаковка.

Возврат денежных средств производится после получения и проверки возвращенного товара.`,
      },
      {
        id: "loyalty",
        title: "6. Программа лояльности",
        content: `Участие в программе лояльности бесплатно. Баллы начисляются по правилам программы и могут использоваться в будущих заказах.

Мы можем изменять условия программы с предварительным уведомлением.`,
      },
      {
        id: "content",
        title: "7. Контент и интеллектуальная собственность",
        content: `Материалы платформы, включая тексты, изображения, логотипы и программное обеспечение, защищены законодательством об интеллектуальной собственности.

Использование контента допускается только в личных некоммерческих целях, если иное не согласовано письменно.`,
      },
      {
        id: "liability",
        title: "8. Ограничение ответственности",
        content: `Платформа предоставляется по принципу «как есть». Мы стараемся поддерживать актуальность информации, но не гарантируем отсутствие ошибок или непрерывную доступность сервиса.

Мы не несем ответственности за косвенные убытки и упущенную выгоду, связанные с использованием платформы.`,
      },
      {
        id: "changes",
        title: "9. Изменение условий",
        content: `Мы можем обновлять условия использования. Существенные изменения публикуются на сайте с датой вступления в силу.

Продолжение использования платформы означает согласие с обновленными условиями.`,
      },
      {
        id: "contact",
        title: "10. Контакты",
        content: `По вопросам, связанным с условиями использования, обращайтесь:

Email: legal@uilesim.kz
Телефон: +7 (727) 123-45-67
Адрес: г. Алматы, ул. Примерная, д. 123`,
      },
    ],
  },
  kk: {
    breadcrumb: "Пайдалану шарттары",
    toc: "Мазмұны",
    title: "Пайдалану шарттары",
    updated: "Соңғы жаңарту: 2026 жылғы 3 наурыз",
    footer: "Бұл шарттар сайтта жарияланған сәттен бастап күшіне енеді. Құжаттың өзекті нұсқасын жүйелі түрде тексеріп тұрыңыз.",
    privacyTitle: "Құпиялық саясаты",
    privacyText: "Деректеріңіз қалай өңделетінін біліңіз",
    deliveryTitle: "Жеткізу және қайтару",
    deliveryText: "Тауарларды жеткізу және қайтару шарттары",
    sections: [
      {
        id: "general",
        title: "1. Жалпы ережелер",
        content: `Осы Пайдалану шарттары Uilesim платформасына қолжетімділікті және оны пайдалануды, соның ішінде сайт пен қосымшалар арқылы қолжетімді сервистерді, функцияларды және контентті реттейді.

Платформаны пайдалану арқылы сіз осы шарттармен келісесіз.`,
      },
      {
        id: "account",
        title: "2. Аккаунт",
        content: `Кейбір функциялар үшін аккаунт қажет. Сіз нақты деректер беруге және оларды өзекті күйде ұстауға міндеттенесіз.

Кіру деректерінің қауіпсіздігі мен аккаунт арқылы жасалған әрекеттер үшін жауапкершілік өзіңізде болады.`,
      },
      {
        id: "orders",
        title: "3. Тапсырыстар және төлем",
        content: `Тапсырысты рәсімдегеннен кейін сіз email арқылы растау аласыз. Біз банк карталарын, электрондық төлемдерді және өзге қолжетімді төлем тәсілдерін қабылдаймыз.

Барлық бағалар теңгемен көрсетіледі және егер өзгеше көрсетілмесе, қолданылатын салықтарды қамтиды.`,
      },
      {
        id: "delivery",
        title: "4. Жеткізу",
        content: `Жеткізу мерзімі өңірге және алынатын тәсілге байланысты. Біз көрсетілген мерзімдерді сақтауға тырысамыз, бірақ бақылауымыздан тыс кешігулер үшін жауап бермейміз.

Тапсырысты алған кезде оның толықтығы мен күйін тексеріңіз.`,
      },
      {
        id: "returns",
        title: "5. Қайтару және айырбастау",
        content: `Сапасы тиісті тауарды алған сәттен бастап 14 күн ішінде, егер тауардың түрі мен қаптамасы сақталса, қайтара аласыз.

Ақша қайтару тауар қабылданып, тексерілгеннен кейін жүзеге асырылады.`,
      },
      {
        id: "loyalty",
        title: "6. Лоялдылық бағдарламасы",
        content: `Лоялдылық бағдарламасына қатысу тегін. Ұпайлар бағдарлама ережелері бойынша есептеледі және келесі тапсырыстарда қолданылуы мүмкін.

Бағдарлама шарттарын алдын ала хабарлай отырып өзгерте аламыз.`,
      },
      {
        id: "content",
        title: "7. Контент және зияткерлік меншік",
        content: `Платформа материалдары, соның ішінде мәтіндер, суреттер, логотиптер және бағдарламалық жасақтама зияткерлік меншік туралы заңнамамен қорғалған.

Контентті тек жеке коммерциялық емес мақсатта пайдалануға болады, егер жазбаша түрде өзгеше келісілмесе.`,
      },
      {
        id: "liability",
        title: "8. Жауапкершілікті шектеу",
        content: `Платформа «бар күйінде» ұсынылады. Біз ақпараттың өзектілігін қолдауға тырысамыз, бірақ қателердің болмауына немесе сервистің үздіксіз жұмысына кепілдік бермейміз.

Платформаны пайдалануға байланысты жанама шығындар мен жіберілген пайданы өтемейміз.`,
      },
      {
        id: "changes",
        title: "9. Шарттарды өзгерту",
        content: `Біз пайдалану шарттарын жаңарта аламыз. Маңызды өзгерістер күшіне ену күнімен сайтта жарияланады.

Платформаны әрі қарай пайдалану жаңартылған шарттармен келісуді білдіреді.`,
      },
      {
        id: "contact",
        title: "10. Байланыс",
        content: `Пайдалану шарттарына қатысты сұрақтар бойынша хабарласыңыз:

Email: legal@uilesim.kz
Телефон: +7 (727) 123-45-67
Мекенжай: Алматы қ., Үлгі көшесі, 123`,
      },
    ],
  },
  en: {
    breadcrumb: "Terms of use",
    toc: "Contents",
    title: "Terms of use",
    updated: "Last updated: March 3, 2026",
    footer: "These terms take effect from the moment they are published on the website. Please review the latest version regularly.",
    privacyTitle: "Privacy policy",
    privacyText: "Learn how we process your data",
    deliveryTitle: "Delivery and returns",
    deliveryText: "Conditions for product delivery and returns",
    sections: [
      {
        id: "general",
        title: "1. General provisions",
        content: `These Terms of Use govern access to and use of the Uilesim platform, including services, features, and content available through the website and applications.

By using the platform, you agree to these terms.`,
      },
      {
        id: "account",
        title: "2. Account",
        content: `Some functions require an account. You agree to provide accurate information and keep it up to date.

You are responsible for keeping your login credentials secure and for actions performed through your account.`,
      },
      {
        id: "orders",
        title: "3. Orders and payment",
        content: `After placing an order, you receive an email confirmation. We accept bank cards, electronic payments, and other available payment methods.

All prices are listed in tenge and include applicable taxes unless stated otherwise.`,
      },
      {
        id: "delivery",
        title: "4. Delivery",
        content: `Delivery times depend on the region and selected receiving method. We aim to meet stated timelines but are not responsible for delays outside our reasonable control.

Please check the order contents and condition upon receipt.`,
      },
      {
        id: "returns",
        title: "5. Returns and exchanges",
        content: `You may return a product of proper quality within 14 days of receipt if its marketable condition and packaging are preserved.

Refunds are processed after the returned product is received and inspected.`,
      },
      {
        id: "loyalty",
        title: "6. Loyalty program",
        content: `Participation in the loyalty program is free. Points are accrued according to program rules and may be used in future orders.

We may change the program terms with prior notice.`,
      },
      {
        id: "content",
        title: "7. Content and intellectual property",
        content: `Platform materials, including text, images, logos, and software, are protected by intellectual property laws.

Content may only be used for personal non-commercial purposes unless otherwise agreed in writing.`,
      },
      {
        id: "liability",
        title: "8. Limitation of liability",
        content: `The platform is provided on an “as is” basis. We strive to keep information current but do not guarantee the absence of errors or uninterrupted service availability.

We are not liable for indirect losses or lost profits related to the use of the platform.`,
      },
      {
        id: "changes",
        title: "9. Changes to terms",
        content: `We may update the terms of use. Material changes are published on the website with an effective date.

Continued use of the platform means acceptance of the updated terms.`,
      },
      {
        id: "contact",
        title: "10. Contact",
        content: `For questions related to these terms, contact us:

Email: legal@uilesim.kz
Phone: +7 (727) 123-45-67
Address: Almaty, Example street, 123`,
      },
    ],
  },
} as const;

export default function TermsPage() {
  const { language, messages } = useI18n();
  const copy = termsPageCopy[language];

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: messages.common.home, href: "/" }, { label: copy.breadcrumb }]} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-28 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{copy.toc}</h3>
              <nav className="space-y-2">
                {copy.sections.map((section) => (
                  <a key={section.id} href={`#${section.id}`} className="block text-sm text-gray-600 hover:text-pink-500 transition-colors">
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-3">{copy.title}</h1>
                <p className="text-gray-600">{copy.updated}</p>
              </div>

              <div className="space-y-8">
                {copy.sections.map((section) => (
                  <section key={section.id} id={section.id}>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</div>
                  </section>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600">{copy.footer}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="/privacy" className="block p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="font-semibold text-gray-900 mb-1">{copy.privacyTitle}</div>
                <div className="text-sm text-gray-600">{copy.privacyText}</div>
              </a>
              <a href="/delivery-returns" className="block p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="font-semibold text-gray-900 mb-1">{copy.deliveryTitle}</div>
                <div className="text-sm text-gray-600">{copy.deliveryText}</div>
              </a>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
