import { useState } from "react";
import { Search, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Button } from "../components/Button";

/**
 * DEV NOTES:
 * Endpoint: GET /api/help/faq/?category=&search=
 * Response: { ok: true, items: [{ id, question, answer, category }] }
 * 
 * Support: POST /api/help/support-request/
 * Body: { subject: string, message: string, email?: string }
 */

const FAQ_CATEGORIES = [
  { id: "orders", label: "Заказы и доставка" },
  { id: "returns", label: "Возвраты и обмены" },
  { id: "payment", label: "Оплата" },
  { id: "account", label: "Аккаунт и профиль" },
  { id: "loyalty", label: "Программа лояльности" },
  { id: "products", label: "Товары и наличие" },
];

const MOCK_FAQ = [
  {
    id: 1,
    category: "orders",
    question: "Как отследить мой заказ?",
    answer:
      "После оформления заказа вы получите email с трек-номером. Отследить статус можно в разделе 'Мои заказы' в личном кабинете или по ссылке из письма.",
  },
  {
    id: 2,
    category: "orders",
    question: "Какие способы доставки доступны?",
    answer:
      "Мы предлагаем курьерскую доставку по Алматы (1-2 дня), экспресс-доставку (в день заказа), и доставку по Казахстану через транспортные компании (3-7 дней).",
  },
  {
    id: 3,
    category: "returns",
    question: "Как вернуть товар?",
    answer:
      "Вы можете вернуть товар в течение 14 дней с момента получения. Товар должен быть в оригинальной упаковке, без следов использования. Оформите возврат в разделе 'Мои заказы'.",
  },
  {
    id: 4,
    category: "payment",
    question: "Какие способы оплаты принимаются?",
    answer:
      "Мы принимаем все основные банковские карты (Visa, Mastercard, МИР), Kaspi QR, а также рассрочку через Kaspi Red и оплату при получении.",
  },
  {
    id: 5,
    category: "loyalty",
    question: "Как работает программа лояльности?",
    answer:
      "За каждую покупку вы получаете баллы (5% от суммы заказа). Баллы можно использовать для оплаты следующих покупок. Чем больше покупаете, тем выше ваш уровень и больше привилегий.",
  },
  {
    id: 6,
    category: "account",
    question: "Как изменить данные профиля?",
    answer:
      "Перейдите в раздел 'Профиль' и нажмите 'Редактировать'. Вы можете изменить имя, email, телефон и адреса доставки.",
  },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFAQ = MOCK_FAQ.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[{ label: "Главная", href: "/" }, { label: "Помощь" }]}
          />
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-3">
            Центр помощи
          </h1>
          <p className="text-gray-600">
            Найдите ответы на часто задаваемые вопросы
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по вопросам..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
            />
          </div>
        </div>

        {/* Categories */}
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
              Все вопросы
            </button>
            {FAQ_CATEGORIES.map((category) => (
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

        {/* FAQ List */}
        <div className="mb-12 space-y-3">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((item) => (
              <FAQItem key={item.id} question={item.question} answer={item.answer} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">
                По вашему запросу ничего не найдено. Попробуйте изменить запрос или
                обратитесь в службу поддержки.
              </p>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <MessageCircle className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Не нашли ответ?
          </h3>
          <p className="text-gray-600 mb-6">
            Свяжитесь с нашей службой поддержки, и мы поможем вам решить любой вопрос
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" size="md">
              Написать в поддержку
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

