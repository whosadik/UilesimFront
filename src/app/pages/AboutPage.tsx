import { Sparkles, Award, Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Button } from "../components/Button";

const BRAND_VALUES = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Инновации",
    description:
      "Используем AI и современные технологии для персонализированного подхода к каждому клиенту",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Качество",
    description:
      "Работаем только с проверенными премиум брендами и гарантируем подлинность продукции",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Забота",
    description:
      "Помогаем вам найти идеальные продукты для вашего типа кожи и потребностей",
  },
];

const STATS = [
  { value: "50 000+", label: "Довольных клиентов" },
  { value: "500+", label: "Премиум брендов" },
  { value: "10 000+", label: "Товаров в каталоге" },
  { value: "98%", label: "Рейтинг удовлетворенности" },
];

export default function AboutPage() {
  return (
    <div className="pt-20 lg:pt-28 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[{ label: "Главная", href: "/" }, { label: "О нас" }]}
          />
        </div>

        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-500 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Премиум косметика с персональным подходом
          </div>
          <h1 className="text-4xl lg:text-5xl font-semibold text-gray-900 mb-6">
            О бренде Uilesim
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Мы создаём уникальный опыт покупки косметики, сочетая премиальное
            качество с персонализированным подходом на основе искусственного
            интеллекта.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 lg:p-12 text-white">
            <h2 className="text-2xl lg:text-3xl font-semibold mb-4">
              Наша миссия
            </h2>
            <p className="text-lg text-gray-200 leading-relaxed mb-6">
              Мы верим, что каждый человек уникален, и уход за кожей должен быть
              таким же индивидуальным. Наша цель — помочь вам найти идеальные
              продукты, которые действительно работают для вашего типа кожи и
              образа жизни.
            </p>
            <p className="text-lg text-gray-200 leading-relaxed">
              Используя передовые технологии машинного обучения, мы анализируем ваши
              предпочтения, тип кожи и цели, чтобы предложить продукты, которые
              принесут максимальную пользу.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-8 text-center">
            Наши ценности
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BRAND_VALUES.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center text-pink-500 mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 lg:p-12">
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-8 text-center">
              Uilesim в цифрах
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {STATS.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-semibold text-pink-500 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl border border-pink-100 p-8 lg:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900">
                Технология персонализации
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              Наша система ProfileWizard анализирует 7 ключевых параметров: тип кожи,
              основные проблемы, цели ухода, бюджет, предпочтения по брендам и
              текстурам, а также образ жизни. На основе этих данных мы создаём
              персональные рекомендации и адаптивные предложения.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Система постоянно учится на основе ваших покупок, оценок и
              взаимодействий, делая рекомендации всё более точными со временем.
            </p>
          </div>
        </div>

        {/* Loyalty Program Highlight */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 lg:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-pink-500" />
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900">
                Программа лояльности
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              Мы ценим каждого клиента и разработали уникальную многоуровневую
              программу лояльности с 4 статусами: Bronze, Silver, Gold и Platinum.
              Каждый уровень открывает дополнительные привилегии и эксклюзивные
              предложения.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">
                    Накопительные баллы
                  </div>
                  <div className="text-sm text-gray-600">
                    5% от суммы каждой покупки возвращается баллами
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">
                    Персональные офферы
                  </div>
                  <div className="text-sm text-gray-600">
                    Эксклюзивные предложения на основе ваших предпочтений
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">
                    Ранний доступ
                  </div>
                  <div className="text-sm text-gray-600">
                    Первыми узнавайте о новинках и распродажах
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">
                    Бесплатная доставка
                  </div>
                  <div className="text-sm text-gray-600">
                    Для Silver+ доставка всегда бесплатна
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 lg:p-12 text-white">
            <ShoppingBag className="w-12 h-12 mx-auto mb-6 text-pink-500" />
            <h2 className="text-2xl lg:text-3xl font-semibold mb-4">
              Готовы начать свой путь к идеальной коже?
            </h2>
            <p className="text-gray-200 mb-8 max-w-2xl mx-auto">
              Пройдите быстрый тест ProfileWizard и получите персональные
              рекомендации, подобранные специально для вас
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg">
                Перейти в каталог
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="secondary" size="lg">
                Пройти ProfileWizard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
