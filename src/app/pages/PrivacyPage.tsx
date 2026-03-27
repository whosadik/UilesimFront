import { Breadcrumbs } from "../components/Breadcrumbs";
import { useI18n } from "../../shared/i18n/LanguageContext";

const privacyPageCopy = {
  ru: {
    breadcrumb: "Политика конфиденциальности",
    toc: "Содержание",
    title: "Политика конфиденциальности",
    updated: "Последнее обновление: 3 марта 2026",
    standardsTitle: "Соответствие стандартам",
    standardsText: "Наша политика конфиденциальности соответствует требованиям законодательства Республики Казахстан и международным стандартам защиты данных.",
    termsTitle: "Условия использования",
    termsText: "Правила использования платформы",
    helpTitle: "Центр помощи",
    helpText: "Ответы на частые вопросы",
    sections: [
      {
        id: "intro",
        title: "1. Введение",
        content: `Настоящая Политика конфиденциальности описывает, как Uilesim собирает, использует, хранит и защищает персональную информацию пользователей платформы.

Мы уважаем вашу конфиденциальность и стремимся обеспечить безопасность данных в соответствии с законодательством Республики Казахстан.`,
      },
      {
        id: "collection",
        title: "2. Какие данные мы собираем",
        content: `Мы можем собирать следующие категории данных:

• имя, email, номер телефона и дату рождения
• адреса доставки и предпочтительное время получения
• данные о профиле кожи, целях ухода и предпочтениях
• историю покупок, просмотров, корзины и избранного
• технические данные: IP-адрес, устройство, браузер, cookies`,
      },
      {
        id: "usage",
        title: "3. Как мы используем данные",
        content: `Мы используем данные для:

• обработки заказов и доставки
• персонализации рекомендаций и офферов
• начисления баллов и работы программы лояльности
• улучшения сервиса и пользовательского опыта
• отправки важных уведомлений и маркетинговых материалов при наличии согласия
• обеспечения безопасности и предотвращения мошенничества`,
      },
      {
        id: "sharing",
        title: "4. Передача третьим лицам",
        content: `Мы не продаем ваши персональные данные. Информация может передаваться только:

• партнерам по доставке
• платежным провайдерам
• сервисам аналитики в обезличенном виде
• государственным органам при наличии законного требования`,
      },
      {
        id: "cookies",
        title: "5. Cookies",
        content: `Мы используем cookies и схожие технологии для сохранения настроек, анализа использования платформы, персонализации контента и обеспечения безопасности сеансов.

Вы можете управлять cookies в настройках браузера, но это может ограничить часть функциональности.`,
      },
      {
        id: "security",
        title: "6. Безопасность",
        content: `Мы применяем шифрование при передаче данных, ограничиваем доступ к персональной информации, проводим регулярные проверки и используем защищенную инфраструктуру хранения.

Несмотря на это, абсолютная безопасность в интернете не может быть гарантирована.`,
      },
      {
        id: "rights",
        title: "7. Ваши права",
        content: `Вы можете:

• запросить доступ к своим данным
• исправить неточные данные
• удалить учетную запись
• ограничить обработку
• отозвать согласие
• запросить копию данных

По вопросам реализации прав пишите на privacy@uilesim.kz.`,
      },
      {
        id: "retention",
        title: "8. Сроки хранения",
        content: `Мы храним данные только столько, сколько необходимо для оказания услуг, выполнения обязательств и соблюдения требований законодательства.

После истечения сроков данные удаляются или анонимизируются.`,
      },
      {
        id: "children",
        title: "9. Несовершеннолетние",
        content: `Платформа не предназначена для лиц младше 18 лет. Мы сознательно не собираем данные детей.

Если вы считаете, что ребенок передал нам данные, свяжитесь с нами для их удаления.`,
      },
      {
        id: "changes",
        title: "10. Изменения политики",
        content: `Мы можем обновлять Политику конфиденциальности. О существенных изменениях сообщим по email или через интерфейс платформы.

Рекомендуем периодически проверять актуальную версию документа.`,
      },
      {
        id: "contact",
        title: "11. Контакты",
        content: `По вопросам конфиденциальности обращайтесь:

Email: privacy@uilesim.kz
Почтовый адрес: г. Алматы, ул. Примерная, д. 123
Телефон: +7 (727) 123-45-67`,
      },
    ],
  },
  kk: {
    breadcrumb: "Құпиялық саясаты",
    toc: "Мазмұны",
    title: "Құпиялық саясаты",
    updated: "Соңғы жаңарту: 2026 жылғы 3 наурыз",
    standardsTitle: "Стандарттарға сәйкестік",
    standardsText: "Біздің құпиялық саясатымыз Қазақстан Республикасының заңнамасы мен деректерді қорғаудың халықаралық стандарттарына сәйкес келеді.",
    termsTitle: "Пайдалану шарттары",
    termsText: "Платформаны пайдалану ережелері",
    helpTitle: "Көмек орталығы",
    helpText: "Жиі қойылатын сұрақтарға жауаптар",
    sections: [
      {
        id: "intro",
        title: "1. Кіріспе",
        content: `Осы Құпиялық саясаты Uilesim платформасы пайдаланушыларының жеке деректерін қалай жинайтынын, пайдаланатынын, сақтайтынын және қорғайтынын сипаттайды.

Біз сіздің құпиялығыңызды құрметтейміз және деректер қауіпсіздігін Қазақстан Республикасының заңнамасына сәйкес қамтамасыз етуге тырысамыз.`,
      },
      {
        id: "collection",
        title: "2. Қандай деректер жиналады",
        content: `Біз келесі деректер санаттарын жинауымыз мүмкін:

• аты-жөні, email, телефон нөмірі және туған күні
• жеткізу мекенжайы мен ыңғайлы уақыт
• тері профилі, күтім мақсаттары және қалаулар
• сатып алу, қарау, себет және таңдаулылар тарихы
• техникалық деректер: IP, құрылғы, браузер, cookies`,
      },
      {
        id: "usage",
        title: "3. Деректер қалай пайдаланылады",
        content: `Біз деректерді мыналар үшін қолданамыз:

• тапсырыстарды өңдеу және жеткізу
• ұсыныстар мен офферлерді жекелендіру
• ұпай есептеу және лоялдылық бағдарламасын жүргізу
• сервисті және қолданушы тәжірибесін жақсарту
• маңызды хабарламалар мен келісім берілген маркетингтік материалдарды жіберу
• қауіпсіздікті қамтамасыз ету және алаяқтықтың алдын алу`,
      },
      {
        id: "sharing",
        title: "4. Үшінші тараптарға беру",
        content: `Біз жеке деректерді сатпаймыз. Ақпарат тек келесі тараптарға берілуі мүмкін:

• жеткізу серіктестері
• төлем провайдерлері
• аналитика сервистері, тек анонимді түрде
• заңды талап болған жағдайда мемлекеттік органдар`,
      },
      {
        id: "cookies",
        title: "5. Cookies",
        content: `Біз cookies және ұқсас технологияларды баптауларды сақтау, платформаны талдау, контентті жекелендіру және сеанс қауіпсіздігін қамтамасыз ету үшін қолданамыз.

Сіз cookies параметрлерін браузерде басқара аласыз, бірақ бұл функционалдың бір бөлігін шектеуі мүмкін.`,
      },
      {
        id: "security",
        title: "6. Қауіпсіздік",
        content: `Біз деректерді беру кезінде шифрлауды қолданамыз, жеке ақпаратқа қолжетімділікті шектейміз, тұрақты тексерулер жүргіземіз және қорғалған инфрақұрылымды пайдаланамыз.

Соған қарамастан, интернеттегі абсолютті қауіпсіздікке кепілдік беру мүмкін емес.`,
      },
      {
        id: "rights",
        title: "7. Сіздің құқықтарыңыз",
        content: `Сіз:

• өз деректеріңізге қолжетімділік сұрай аласыз
• нақты емес деректерді түзете аласыз
• аккаунтты жоя аласыз
• өңдеуді шектей аласыз
• келісімді қайтарып ала аласыз
• деректер көшірмесін сұрай аласыз

Құқықтарды іске асыру үшін privacy@uilesim.kz адресіне жазыңыз.`,
      },
      {
        id: "retention",
        title: "8. Сақтау мерзімі",
        content: `Біз деректерді тек қызмет көрсетуге, міндеттемелерді орындауға және заң талаптарын сақтауға қажетті мерзімде сақтаймыз.

Мерзім аяқталғаннан кейін деректер жойылады немесе анонимдендіріледі.`,
      },
      {
        id: "children",
        title: "9. Кәмелетке толмағандар",
        content: `Платформа 18 жасқа толмаған тұлғаларға арналмаған. Біз балалар деректерін саналы түрде жинамаймыз.

Егер бала бізге дерек берген деп ойласаңыз, жою үшін бізге хабарласыңыз.`,
      },
      {
        id: "changes",
        title: "10. Саясат өзгерістері",
        content: `Біз Құпиялық саясатын жаңарта аламыз. Маңызды өзгерістер туралы email немесе платформа интерфейсі арқылы хабарлаймыз.

Құжаттың өзекті нұсқасын мезгіл-мезгіл қарап тұруды ұсынамыз.`,
      },
      {
        id: "contact",
        title: "11. Байланыс",
        content: `Құпиялық мәселелері бойынша хабарласыңыз:

Email: privacy@uilesim.kz
Пошта мекенжайы: Алматы қ., Үлгі көшесі, 123
Телефон: +7 (727) 123-45-67`,
      },
    ],
  },
  en: {
    breadcrumb: "Privacy policy",
    toc: "Contents",
    title: "Privacy policy",
    updated: "Last updated: March 3, 2026",
    standardsTitle: "Standards compliance",
    standardsText: "Our privacy policy complies with the laws of the Republic of Kazakhstan and international data protection standards.",
    termsTitle: "Terms of use",
    termsText: "Rules for using the platform",
    helpTitle: "Help center",
    helpText: "Answers to frequent questions",
    sections: [
      {
        id: "intro",
        title: "1. Introduction",
        content: `This Privacy Policy describes how Uilesim collects, uses, stores, and protects the personal information of platform users.

We respect your privacy and aim to keep your data secure in accordance with the laws of the Republic of Kazakhstan.`,
      },
      {
        id: "collection",
        title: "2. What data we collect",
        content: `We may collect the following categories of data:

• name, email, phone number, and date of birth
• delivery addresses and preferred delivery times
• skin profile data, care goals, and preferences
• purchase, browsing, cart, and wishlist history
• technical data: IP address, device, browser, cookies`,
      },
      {
        id: "usage",
        title: "3. How we use data",
        content: `We use data to:

• process orders and deliveries
• personalize recommendations and offers
• manage reward points and the loyalty program
• improve service quality and user experience
• send important notifications and consent-based marketing materials
• ensure security and prevent fraud`,
      },
      {
        id: "sharing",
        title: "4. Sharing with third parties",
        content: `We do not sell personal data. Information may be shared only with:

• delivery partners
• payment providers
• analytics services in anonymized form
• public authorities when legally required`,
      },
      {
        id: "cookies",
        title: "5. Cookies",
        content: `We use cookies and similar technologies to save preferences, analyze platform usage, personalize content, and secure sessions.

You can manage cookies in your browser settings, but this may limit some functionality.`,
      },
      {
        id: "security",
        title: "6. Security",
        content: `We use encryption during data transfer, restrict access to personal information, run regular reviews, and rely on secure infrastructure.

Even so, absolute security on the internet cannot be guaranteed.`,
      },
      {
        id: "rights",
        title: "7. Your rights",
        content: `You can:

• request access to your data
• correct inaccurate data
• delete your account
• restrict processing
• withdraw consent
• request a copy of your data

For privacy rights requests, email privacy@uilesim.kz.`,
      },
      {
        id: "retention",
        title: "8. Retention period",
        content: `We keep data only as long as necessary to provide services, fulfill obligations, and comply with legal requirements.

After retention periods expire, data is deleted or anonymized.`,
      },
      {
        id: "children",
        title: "9. Minors",
        content: `The platform is not intended for persons under 18. We do not knowingly collect children's data.

If you believe a child has submitted data to us, contact us so we can remove it.`,
      },
      {
        id: "changes",
        title: "10. Policy changes",
        content: `We may update this Privacy Policy. Material changes will be communicated by email or through the platform interface.

We recommend reviewing the latest version of this document from time to time.`,
      },
      {
        id: "contact",
        title: "11. Contact",
        content: `For privacy-related questions contact us:

Email: privacy@uilesim.kz
Postal address: Almaty, Example street, 123
Phone: +7 (727) 123-45-67`,
      },
    ],
  },
} as const;

export default function PrivacyPage() {
  const { language, messages } = useI18n();
  const copy = privacyPageCopy[language];

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

              <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{copy.standardsTitle}</h3>
                <p className="text-sm text-gray-600">{copy.standardsText}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="/terms" className="block p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="font-semibold text-gray-900 mb-1">{copy.termsTitle}</div>
                <div className="text-sm text-gray-600">{copy.termsText}</div>
              </a>
              <a href="/help" className="block p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="font-semibold text-gray-900 mb-1">{copy.helpTitle}</div>
                <div className="text-sm text-gray-600">{copy.helpText}</div>
              </a>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
