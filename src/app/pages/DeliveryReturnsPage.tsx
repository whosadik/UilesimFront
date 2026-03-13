import { Package, Truck, RefreshCw, CreditCard, MapPin, Clock } from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";

/**
 * DEV NOTES:
 * Endpoint: GET /api/delivery-info/
 * Response: { ok: true, zones: [...], methods: [...], return_policy: {...} }
 */

const DELIVERY_METHODS = [
  {
    icon: <Truck className="w-6 h-6" />,
    title: "Курьерская доставка по Алматы",
    description: "Доставка в течение 1-2 рабочих дней",
    price: "Бесплатно от 20 000 ₸",
    details: ["Доставка с 9:00 до 21:00", "Оплата при получении возможна"],
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: "Экспресс-доставка",
    description: "Доставка в день заказа",
    price: "1 500 ₸",
    details: ["Заказ до 12:00 — доставка в тот же день", "Только для Алматы"],
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Доставка по Казахстану",
    description: "Через транспортные компании",
    price: "От 1 000 ₸",
    details: ["Срок доставки 3-7 дней", "Отслеживание груза онлайн"],
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Самовывоз",
    description: "Забрать из пункта выдачи",
    price: "Бесплатно",
    details: ["Готов к выдаче через 2-4 часа", "8 пунктов выдачи в Алматы"],
  },
];

const RETURN_CONDITIONS = [
  {
    title: "Срок возврата",
    description: "14 дней с момента получения товара",
  },
  {
    title: "Состояние товара",
    description: "Товар должен быть в оригинальной упаковке, без следов использования",
  },
  {
    title: "Документы",
    description: "Чек или электронная квитанция об оплате",
  },
  {
    title: "Возврат денег",
    description: "В течение 7-14 рабочих дней на карту или счет",
  },
];

const RETURN_PROCESS = [
  {
    step: 1,
    title: "Оформите возврат",
    description: "В разделе 'Мои заказы' выберите товар и нажмите 'Вернуть'",
  },
  {
    step: 2,
    title: "Упакуйте товар",
    description: "Поместите товар в оригинальную упаковку вместе с чеком",
  },
  {
    step: 3,
    title: "Передайте курьеру",
    description: "Курьер заберет товар в удобное для вас время бесплатно",
  },
  {
    step: 4,
    title: "Получите деньги",
    description: "После проверки товара деньги вернутся на вашу карту",
  },
];

export default function DeliveryReturnsPage() {
  return (
    <div className="page-with-navbar-offset min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Доставка и возврат" },
            ]}
          />
        </div>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-3">
            Доставка и возврат
          </h1>
          <p className="text-gray-600">
            Вся информация о способах доставки и условиях возврата товаров
          </p>
        </div>

        {/* Delivery Methods */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Способы доставки
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DELIVERY_METHODS.map((method, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {method.title}
                    </h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="text-lg font-semibold text-gray-900">
                    {method.price}
                  </span>
                </div>
                <ul className="space-y-2">
                  {method.details.map((detail, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start">
                      <span className="text-pink-500 mr-2">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Table */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Стоимость и сроки доставки
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Регион
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Срок
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Стоимость
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Алматы</td>
                    <td className="px-6 py-4 text-sm text-gray-600">1-2 дня</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      Бесплатно от 20 000 ₸
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Астана</td>
                    <td className="px-6 py-4 text-sm text-gray-600">2-3 дня</td>
                    <td className="px-6 py-4 text-sm text-gray-900">От 1 500 ₸</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      Шымкент, Караганда
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">3-5 дней</td>
                    <td className="px-6 py-4 text-sm text-gray-900">От 2 000 ₸</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Другие города</td>
                    <td className="px-6 py-4 text-sm text-gray-600">5-7 дней</td>
                    <td className="px-6 py-4 text-sm text-gray-900">От 2 500 ₸</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Returns Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <RefreshCw className="w-8 h-8 text-pink-500" />
            <h2 className="text-2xl font-semibold text-gray-900">Возврат товара</h2>
          </div>

          {/* Return Conditions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Условия возврата</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {RETURN_CONDITIONS.map((condition, index) => (
                <div key={index}>
                  <div className="font-medium text-gray-900 mb-1">
                    {condition.title}
                  </div>
                  <div className="text-sm text-gray-600">{condition.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Return Process */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-6">Как вернуть товар</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {RETURN_PROCESS.map((item) => (
                <div
                  key={item.step}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center font-semibold mb-4">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Остались вопросы?
          </h3>
          <p className="text-gray-600 mb-4">
            Свяжитесь с нашей службой поддержки
          </p>
          <a
            href="/help"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Перейти в центр помощи
          </a>
        </div>
      </div>
    </div>
  );
}

