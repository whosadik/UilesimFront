import { useState } from "react";
import { Search, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Button } from "../components/Button";
import { useI18n } from "../../shared/i18n/LanguageContext";

const helpPageCopy = {
  ru: {
    breadcrumb: "Помощь",
    title: "Центр помощи",
    subtitle: "Найдите ответы на часто задаваемые вопросы",
    searchPlaceholder: "Поиск по вопросам...",
    allQuestions: "Все вопросы",
    nothingFound: "По вашему запросу ничего не найдено. Попробуйте изменить запрос или обратитесь в службу поддержки.",
    contactTitle: "Не нашли ответ?",
    contactDescription: "Свяжитесь с нашей службой поддержки, и мы поможем вам решить любой вопрос",
    writeSupport: "Написать в поддержку",
    categories: [
      { id: "orders", label: "Заказы и доставка" },
      { id: "returns", label: "Возвраты и обмены" },
      { id: "payment", label: "Оплата" },
      { id: "account", label: "Аккаунт и профиль" },
      { id: "loyalty", label: "Программа лояльности" },
      { id: "products", label: "Товары и наличие" },
    ],
    faq: [
      { id: 1, category: "orders", question: "Как отследить мой заказ?", answer: "После оформления заказа вы получите email с трек-номером. Отследить статус можно в разделе 'Мои заказы' в личном кабинете или по ссылке из письма." },
      { id: 2, category: "orders", question: "Какие способы доставки доступны?", answer: "Мы предлагаем курьерскую доставку по Алматы (1-2 дня), экспресс-доставку (в день заказа), и доставку по Казахстану через транспортные компании (3-7 дней)." },
      { id: 3, category: "returns", question: "Как вернуть товар?", answer: "Вы можете вернуть товар в течение 14 дней с момента получения. Товар должен быть в оригинальной упаковке, без следов использования. Оформите возврат в разделе 'Мои заказы'." },
      { id: 4, category: "payment", question: "Какие способы оплаты принимаются?", answer: "Мы принимаем все основные банковские карты (Visa, Mastercard, МИР), Kaspi QR, а также рассрочку через Kaspi Red и оплату при получении." },
      { id: 5, category: "loyalty", question: "Как работает программа лояльности?", answer: "За каждую покупку вы получаете баллы (1% от суммы заказа). Баллы можно использовать для оплаты следующих покупок. Чем больше покупаете, тем выше ваш уровень и больше привилегий." },
      { id: 6, category: "account", question: "Как изменить данные профиля?", answer: "Перейдите в раздел 'Профиль' и нажмите 'Редактировать'. Вы можете изменить имя, email, телефон и адреса доставки." },
    ],
  },
  kk: {
    breadcrumb: "Көмек",
    title: "Көмек орталығы",
    subtitle: "Жиі қойылатын сұрақтарға жауаптарды табыңыз",
    searchPlaceholder: "Сұрақтар бойынша іздеу...",
    allQuestions: "Барлық сұрақтар",
    nothingFound: "Сұрауыңыз бойынша ештеңе табылмады. Сұрауды өзгертіп көріңіз немесе қолдау қызметіне жүгініңіз.",
    contactTitle: "Жауап табылмады ма?",
    contactDescription: "Қолдау қызметіне жазыңыз, біз кез келген сұрақты шешуге көмектесеміз",
    writeSupport: "Қолдауға жазу",
    categories: [
      { id: "orders", label: "Тапсырыстар және жеткізу" },
      { id: "returns", label: "Қайтару және айырбастау" },
      { id: "payment", label: "Төлем" },
      { id: "account", label: "Аккаунт және профиль" },
      { id: "loyalty", label: "Лоялдылық бағдарламасы" },
      { id: "products", label: "Тауарлар және қолжетімділік" },
    ],
    faq: [
      { id: 1, category: "orders", question: "Тапсырысымды қалай қадағалаймын?", answer: "Тапсырысты рәсімдегеннен кейін сізге трек-нөмірі бар email келеді. Күйін жеке кабинеттегі 'Менің тапсырыстарым' бөлімінен немесе хаттағы сілтеме арқылы қадағалауға болады." },
      { id: 2, category: "orders", question: "Қандай жеткізу тәсілдері бар?", answer: "Біз Алматы бойынша курьерлік жеткізуді (1-2 күн), экспресс жеткізуді (тапсырыс күні), және Қазақстан бойынша көлік компаниялары арқылы жеткізуді (3-7 күн) ұсынамыз." },
      { id: 3, category: "returns", question: "Тауарды қалай қайтаруға болады?", answer: "Тауарды алған күннен бастап 14 күн ішінде қайтара аласыз. Ол бастапқы қаптамада және қолданылу ізінсіз болуы керек. Қайтаруды 'Менің тапсырыстарым' бөлімінде рәсімдеңіз." },
      { id: 4, category: "payment", question: "Қандай төлем тәсілдері қабылданады?", answer: "Біз негізгі банк карталарын (Visa, Mastercard, МИР), Kaspi QR, Kaspi Red бөліп төлеуді және қолма-қол төлемді қабылдаймыз." },
      { id: 5, category: "loyalty", question: "Лоялдылық бағдарламасы қалай жұмыс істейді?", answer: "Әр сатып алу үшін сіз ұпай аласыз (тапсырыс сомасының 1%-ы). Ұпайларды келесі сатып алуларды төлеуге пайдалануға болады. Көбірек сатып алған сайын деңгейіңіз жоғарылап, артықшылықтар көбейеді." },
      { id: 6, category: "account", question: "Профиль деректерін қалай өзгертуге болады?", answer: "'Профиль' бөліміне өтіп, 'Өңдеу' түймесін басыңыз. Атыңызды, email, телефон нөмірін және жеткізу мекенжайларын өзгерте аласыз." },
    ],
  },
  en: {
    breadcrumb: "Help",
    title: "Help center",
    subtitle: "Find answers to frequently asked questions",
    searchPlaceholder: "Search questions...",
    allQuestions: "All questions",
    nothingFound: "Nothing was found for your request. Try changing the query or contact support.",
    contactTitle: "Did not find the answer?",
    contactDescription: "Contact our support team and we will help you resolve any issue",
    writeSupport: "Write to support",
    categories: [
      { id: "orders", label: "Orders and delivery" },
      { id: "returns", label: "Returns and exchanges" },
      { id: "payment", label: "Payment" },
      { id: "account", label: "Account and profile" },
      { id: "loyalty", label: "Loyalty program" },
      { id: "products", label: "Products and stock" },
    ],
    faq: [
      { id: 1, category: "orders", question: "How can I track my order?", answer: "After placing an order, you will receive an email with a tracking number. You can check the status in the 'My orders' section or via the link in the email." },
      { id: 2, category: "orders", question: "What delivery options are available?", answer: "We offer courier delivery in Almaty (1-2 days), express delivery (same day), and delivery across Kazakhstan via transport companies (3-7 days)." },
      { id: 3, category: "returns", question: "How do I return a product?", answer: "You can return a product within 14 days from receipt. The product must remain in its original packaging with no signs of use. Create a return in the 'My orders' section." },
      { id: 4, category: "payment", question: "Which payment methods do you accept?", answer: "We accept major bank cards (Visa, Mastercard, MIR), Kaspi QR, installments via Kaspi Red, and payment on delivery." },
      { id: 5, category: "loyalty", question: "How does the loyalty program work?", answer: "You earn points for every purchase (1% of the order amount). Points can be used to pay for future purchases. The more you buy, the higher your level and the more benefits you get." },
      { id: 6, category: "account", question: "How can I change my profile details?", answer: "Go to the 'Profile' section and click 'Edit'. You can update your name, email, phone number, and delivery addresses." },
    ],
  },
} as const;

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  const { language, messages } = useI18n();
  const copy = helpPageCopy[language];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFAQ = copy.faq.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="app-page-container py-8">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: messages.common.home, href: "/" }, { label: copy.breadcrumb }]} />
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-3">{copy.title}</h1>
          <p className="text-gray-600">{copy.subtitle}</p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === null
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {copy.allQuestions}
            </button>
            {copy.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-12 space-y-3">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((item) => (
              <FAQItem key={item.id} question={item.question} answer={item.answer} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">{copy.nothingFound}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <MessageCircle className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{copy.contactTitle}</h3>
          <p className="text-gray-600 mb-6">{copy.contactDescription}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" size="md">
              {copy.writeSupport}
            </Button>
            <Button variant="secondary" size="md">
              Email: support@uilesim.kz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
