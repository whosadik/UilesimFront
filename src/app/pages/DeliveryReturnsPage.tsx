import { Package, Truck, RefreshCw, MapPin, Clock } from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useI18n } from "../../shared/i18n/LanguageContext";

const deliveryReturnsPageCopy = {
  ru: {
    breadcrumb: "Доставка и возврат",
    title: "Доставка и возврат",
    subtitle: "Вся информация о способах доставки и условиях возврата товаров",
    methodsTitle: "Способы доставки",
    methods: [
      { title: "Курьерская доставка по Алматы", description: "Доставка в течение 1-2 рабочих дней", price: "Бесплатно от 20 000 ₸", details: ["Доставка с 9:00 до 21:00", "Оплата при получении возможна"] },
      { title: "Экспресс-доставка", description: "Доставка в день заказа", price: "1 500 ₸", details: ["Заказ до 12:00 — доставка в тот же день", "Только для Алматы"] },
      { title: "Доставка по Казахстану", description: "Через транспортные компании", price: "От 1 000 ₸", details: ["Срок доставки 3-7 дней", "Отслеживание груза онлайн"] },
      { title: "Самовывоз", description: "Забрать из пункта выдачи", price: "Бесплатно", details: ["Готов к выдаче через 2-4 часа", "8 пунктов выдачи в Алматы"] },
    ],
    tableTitle: "Стоимость и сроки доставки",
    region: "Регион",
    period: "Срок",
    price: "Стоимость",
    rows: [
      ["Алматы", "1-2 дня", "Бесплатно от 20 000 ₸"],
      ["Астана", "2-3 дня", "От 1 500 ₸"],
      ["Шымкент, Караганда", "3-5 дней", "От 2 000 ₸"],
      ["Другие города", "5-7 дней", "От 2 500 ₸"],
    ],
    returnsTitle: "Возврат товара",
    conditionsTitle: "Условия возврата",
    conditions: [
      { title: "Срок возврата", description: "14 дней с момента получения товара" },
      { title: "Состояние товара", description: "Товар должен быть в оригинальной упаковке, без следов использования" },
      { title: "Документы", description: "Чек или электронная квитанция об оплате" },
      { title: "Возврат денег", description: "В течение 7-14 рабочих дней на карту или счет" },
    ],
    processTitle: "Как вернуть товар",
    process: [
      { step: 1, title: "Оформите возврат", description: "В разделе 'Мои заказы' выберите товар и нажмите 'Вернуть'" },
      { step: 2, title: "Упакуйте товар", description: "Поместите товар в оригинальную упаковку вместе с чеком" },
      { step: 3, title: "Передайте курьеру", description: "Курьер заберет товар в удобное для вас время бесплатно" },
      { step: 4, title: "Получите деньги", description: "После проверки товара деньги вернутся на вашу карту" },
    ],
    questionsTitle: "Остались вопросы?",
    questionsDescription: "Свяжитесь с нашей службой поддержки",
    helpButton: "Перейти в центр помощи",
  },
  kk: {
    breadcrumb: "Жеткізу және қайтару",
    title: "Жеткізу және қайтару",
    subtitle: "Жеткізу тәсілдері мен тауарларды қайтару шарттары туралы толық ақпарат",
    methodsTitle: "Жеткізу тәсілдері",
    methods: [
      { title: "Алматы бойынша курьерлік жеткізу", description: "1-2 жұмыс күні ішінде жеткізу", price: "20 000 ₸ бастап тегін", details: ["Жеткізу 9:00-ден 21:00-ге дейін", "Алу кезінде төлеуге болады"] },
      { title: "Экспресс жеткізу", description: "Тапсырыс күні жеткізу", price: "1 500 ₸", details: ["12:00-ге дейінгі тапсырыс сол күні жеткізіледі", "Тек Алматы үшін"] },
      { title: "Қазақстан бойынша жеткізу", description: "Көлік компаниялары арқылы", price: "1 000 ₸ бастап", details: ["Жеткізу мерзімі 3-7 күн", "Жүктi онлайн бақылау"] },
      { title: "Өзі алып кету", description: "Берілген жерден алып кету", price: "Тегін", details: ["2-4 сағатта беруге дайын", "Алматыда 8 беру нүктесі"] },
    ],
    tableTitle: "Жеткізу құны мен мерзімі",
    region: "Өңір",
    period: "Мерзім",
    price: "Құны",
    rows: [
      ["Алматы", "1-2 күн", "20 000 ₸ бастап тегін"],
      ["Астана", "2-3 күн", "1 500 ₸ бастап"],
      ["Шымкент, Қарағанды", "3-5 күн", "2 000 ₸ бастап"],
      ["Басқа қалалар", "5-7 күн", "2 500 ₸ бастап"],
    ],
    returnsTitle: "Тауарды қайтару",
    conditionsTitle: "Қайтару шарттары",
    conditions: [
      { title: "Қайтару мерзімі", description: "Тауарды алған сәттен бастап 14 күн" },
      { title: "Тауардың күйі", description: "Тауар бастапқы қаптамада және қолданылу ізісіз болуы керек" },
      { title: "Құжаттар", description: "Чек немесе электронды төлем түбіртегі" },
      { title: "Ақшаны қайтару", description: "7-14 жұмыс күні ішінде картаға немесе шотқа" },
    ],
    processTitle: "Тауарды қалай қайтаруға болады",
    process: [
      { step: 1, title: "Қайтаруды рәсімдеңіз", description: "'Менің тапсырыстарым' бөлімінде тауарды таңдап, 'Қайтару' түймесін басыңыз" },
      { step: 2, title: "Тауарды ораңыз", description: "Тауарды чекпен бірге бастапқы қаптамаға салыңыз" },
      { step: 3, title: "Курьерге беріңіз", description: "Курьер тауарды сізге ыңғайлы уақытта тегін алып кетеді" },
      { step: 4, title: "Ақшаны алыңыз", description: "Тауар тексерілгеннен кейін ақша картаңызға қайтарылады" },
    ],
    questionsTitle: "Сұрақтарыңыз қалды ма?",
    questionsDescription: "Біздің қолдау қызметіне хабарласыңыз",
    helpButton: "Көмек орталығына өту",
  },
  en: {
    breadcrumb: "Delivery and returns",
    title: "Delivery and returns",
    subtitle: "All information about delivery methods and product return conditions",
    methodsTitle: "Delivery methods",
    methods: [
      { title: "Courier delivery in Almaty", description: "Delivered within 1-2 business days", price: "Free from 20 000 ₸", details: ["Delivery from 9:00 to 21:00", "Pay on delivery is available"] },
      { title: "Express delivery", description: "Delivered on the order day", price: "1 500 ₸", details: ["Orders before 12:00 are delivered the same day", "Available in Almaty only"] },
      { title: "Delivery across Kazakhstan", description: "Via transport companies", price: "From 1 000 ₸", details: ["Delivery takes 3-7 days", "Online tracking available"] },
      { title: "Pickup", description: "Collect from a pickup point", price: "Free", details: ["Ready for pickup in 2-4 hours", "8 pickup points in Almaty"] },
    ],
    tableTitle: "Delivery cost and timing",
    region: "Region",
    period: "Time",
    price: "Cost",
    rows: [
      ["Almaty", "1-2 days", "Free from 20 000 ₸"],
      ["Astana", "2-3 days", "From 1 500 ₸"],
      ["Shymkent, Karaganda", "3-5 days", "From 2 000 ₸"],
      ["Other cities", "5-7 days", "From 2 500 ₸"],
    ],
    returnsTitle: "Returns",
    conditionsTitle: "Return conditions",
    conditions: [
      { title: "Return period", description: "14 days from receiving the product" },
      { title: "Product condition", description: "The product must be in original packaging with no signs of use" },
      { title: "Documents", description: "Receipt or electronic payment confirmation" },
      { title: "Refund", description: "Within 7-14 business days to your card or account" },
    ],
    processTitle: "How to return a product",
    process: [
      { step: 1, title: "Create a return", description: "In the 'My orders' section select the item and click 'Return'" },
      { step: 2, title: "Pack the product", description: "Place the product in its original packaging together with the receipt" },
      { step: 3, title: "Hand it to the courier", description: "The courier will pick up the product at a convenient time for free" },
      { step: 4, title: "Receive your refund", description: "After inspection the money will be returned to your card" },
    ],
    questionsTitle: "Still have questions?",
    questionsDescription: "Contact our support team",
    helpButton: "Go to help center",
  },
} as const;

export default function DeliveryReturnsPage() {
  const { language, messages } = useI18n();
  const copy = deliveryReturnsPageCopy[language];
  const deliveryMethods = [
    { icon: <Truck className="w-6 h-6" />, ...copy.methods[0] },
    { icon: <Package className="w-6 h-6" />, ...copy.methods[1] },
    { icon: <MapPin className="w-6 h-6" />, ...copy.methods[2] },
    { icon: <Clock className="w-6 h-6" />, ...copy.methods[3] },
  ];

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="app-page-container py-8">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: messages.common.home, href: "/" }, { label: copy.breadcrumb }]} />
        </div>

        <div className="mb-12 text-center">
          <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-3">{copy.title}</h1>
          <p className="text-gray-600">{copy.subtitle}</p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">{copy.methodsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deliveryMethods.map((method) => (
              <div key={method.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-900">{method.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="text-lg font-semibold text-gray-900">{method.price}</span>
                </div>
                <ul className="space-y-2">
                  {method.details.map((detail) => (
                    <li key={detail} className="text-sm text-gray-600 flex items-start">
                      <span className="text-pink-500 mr-2">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">{copy.tableTitle}</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{copy.region}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{copy.period}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{copy.price}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {copy.rows.map((row) => (
                    <tr key={row.join("-")}>
                      <td className="px-6 py-4 text-sm text-gray-900">{row[0]}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row[1]}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <RefreshCw className="w-8 h-8 text-pink-500" />
            <h2 className="text-2xl font-semibold text-gray-900">{copy.returnsTitle}</h2>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">{copy.conditionsTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {copy.conditions.map((condition) => (
                <div key={condition.title}>
                  <div className="font-medium text-gray-900 mb-1">{condition.title}</div>
                  <div className="text-sm text-gray-600">{condition.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-6">{copy.processTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {copy.process.map((item) => (
                <div key={item.step} className="bg-white rounded-xl border border-gray-200 p-6">
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

        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{copy.questionsTitle}</h3>
          <p className="text-gray-600 mb-4">{copy.questionsDescription}</p>
          <a href="/help" className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            {copy.helpButton}
          </a>
        </div>
      </div>
    </div>
  );
}
