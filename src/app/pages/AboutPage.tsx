import { Sparkles, Award, Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Button } from "../components/Button";
import { useI18n } from "../../shared/i18n/LanguageContext";

const aboutPageCopy = {
  ru: {
    breadcrumb: "О нас",
    eyebrow: "Премиум косметика с персональным подходом",
    title: "О бренде Uilesim",
    intro: "Мы создаём уникальный опыт покупки косметики, сочетая премиальное качество с персонализированным подходом на основе искусственного интеллекта.",
    missionTitle: "Наша миссия",
    missionFirst: "Мы верим, что каждый человек уникален, и уход за кожей должен быть таким же индивидуальным. Наша цель — помочь вам найти идеальные продукты, которые действительно работают для вашего типа кожи и образа жизни.",
    missionSecond: "Используя передовые технологии машинного обучения, мы анализируем ваши предпочтения, тип кожи и цели, чтобы предложить продукты, которые принесут максимальную пользу.",
    valuesTitle: "Наши ценности",
    values: [
      { title: "Инновации", description: "Используем AI и современные технологии для персонализированного подхода к каждому клиенту" },
      { title: "Качество", description: "Работаем только с проверенными премиум брендами и гарантируем подлинность продукции" },
      { title: "Забота", description: "Помогаем вам найти идеальные продукты для вашего типа кожи и потребностей" },
    ],
    statsTitle: "Uilesim в цифрах",
    stats: [
      { value: "50 000+", label: "Довольных клиентов" },
      { value: "500+", label: "Премиум брендов" },
      { value: "10 000+", label: "Товаров в каталоге" },
      { value: "98%", label: "Рейтинг удовлетворенности" },
    ],
    technologyTitle: "Технология персонализации",
    technologyFirst: "Наша система ProfileWizard анализирует 7 ключевых параметров: тип кожи, основные проблемы, цели ухода, бюджет, предпочтения по брендам и текстурам, а также образ жизни. На основе этих данных мы создаём персональные рекомендации и адаптивные предложения.",
    technologySecond: "Система постоянно учится на основе ваших покупок, оценок и взаимодействий, делая рекомендации всё более точными со временем.",
    loyaltyTitle: "Программа лояльности",
    loyaltyIntro: "Мы ценим каждого клиента и разработали уникальную многоуровневую программу лояльности с 3 статусами: Bronze, Silver и Gold. Каждый уровень открывает дополнительные привилегии и эксклюзивные предложения.",
    loyaltyItems: [
      { title: "Накопительные баллы", description: "1% от суммы каждой покупки возвращается баллами" },
      { title: "Персональные офферы", description: "Эксклюзивные предложения на основе ваших предпочтений" },
      { title: "Ранний доступ", description: "Первыми узнавайте о новинках и распродажах" },
      { title: "Бесплатная доставка", description: "Для Silver+ доставка всегда бесплатна" },
    ],
    ctaTitle: "Готовы начать свой путь к идеальной коже?",
    ctaDescription: "Пройдите быстрый тест ProfileWizard и получите персональные рекомендации, подобранные специально для вас",
    catalogButton: "Перейти в каталог",
    wizardButton: "Пройти ProfileWizard",
  },
  kk: {
    breadcrumb: "Біз туралы",
    eyebrow: "Жеке тәсілі бар премиум косметика",
    title: "Uilesim бренді туралы",
    intro: "Біз жасанды интеллектке негізделген жекелендірілген тәсіл мен премиум сапаны біріктіріп, косметика сатып алудың бірегей тәжірибесін жасаймыз.",
    missionTitle: "Біздің миссиямыз",
    missionFirst: "Біз әр адам ерекше деп сенеміз, сондықтан тері күтімі де сондай жеке болуы керек. Біздің мақсатымыз — сіздің тері түріңізге және өмір салтыңызға шынымен сай келетін өнімдерді табуға көмектесу.",
    missionSecond: "Озық машиналық оқыту технологияларын қолдана отырып, біз сіздің қалауыңызды, тері түріңізді және мақсаттарыңызды талдап, ең жоғары пайда әкелетін өнімдерді ұсынамыз.",
    valuesTitle: "Біздің құндылықтарымыз",
    values: [
      { title: "Инновация", description: "Әр клиентке жеке тәсіл ұсыну үшін AI мен заманауи технологияларды қолданамыз" },
      { title: "Сапа", description: "Тек сенімді премиум брендтермен жұмыс істейміз және өнімнің түпнұсқалығына кепіл береміз" },
      { title: "Қамқорлық", description: "Тері түріңіз бен қажеттіліктеріңізге сай мінсіз өнімдерді табуға көмектесеміз" },
    ],
    statsTitle: "Uilesim сандарда",
    stats: [
      { value: "50 000+", label: "Риза клиент" },
      { value: "500+", label: "Премиум бренд" },
      { value: "10 000+", label: "Каталогтағы тауар" },
      { value: "98%", label: "Қанағаттану рейтингі" },
    ],
    technologyTitle: "Жекелендіру технологиясы",
    technologyFirst: "Біздің ProfileWizard жүйесі 7 негізгі параметрді талдайды: тері түрі, басты мәселелер, күтім мақсаттары, бюджет, брендтер мен текстуралар бойынша қалау, сондай-ақ өмір салты. Осы деректер негізінде біз жеке ұсыныстар мен бейімделетін офферлер құрамыз.",
    technologySecond: "Жүйе сатып алуларыңыз, бағалауларыңыз және әрекеттеріңіз негізінде үнемі үйреніп, уақыт өте ұсыныстарды дәлірек етеді.",
    loyaltyTitle: "Лоялдылық бағдарламасы",
    loyaltyIntro: "Біз әр клиентті бағалаймыз және Bronze, Silver және Gold атты 3 мәртебеден тұратын көпдеңгейлі лоялдылық бағдарламасын жасадық. Әр деңгей жаңа артықшылықтар мен эксклюзивті ұсыныстар ашады.",
    loyaltyItems: [
      { title: "Жиналатын ұпайлар", description: "Әр сатып алудың 1%-ы ұпаймен қайтарылады" },
      { title: "Жеке офферлер", description: "Қалауыңызға негізделген эксклюзивті ұсыныстар" },
      { title: "Ерте қолжетімділік", description: "Жаңалықтар мен сатылымдар туралы бірінші болып біліңіз" },
      { title: "Тегін жеткізу", description: "Silver+ деңгейінде жеткізу әрқашан тегін" },
    ],
    ctaTitle: "Мінсіз теріге апарар жолды бастауға дайынсыз ба?",
    ctaDescription: "Жылдам ProfileWizard тестінен өтіп, дәл сізге лайық жеке ұсыныстар алыңыз",
    catalogButton: "Каталогқа өту",
    wizardButton: "ProfileWizard өту",
  },
  en: {
    breadcrumb: "About us",
    eyebrow: "Premium beauty with a personal approach",
    title: "About Uilesim",
    intro: "We create a unique beauty shopping experience by combining premium quality with a personalized approach powered by artificial intelligence.",
    missionTitle: "Our mission",
    missionFirst: "We believe every person is unique, and skincare should be just as individual. Our goal is to help you find products that truly work for your skin type and lifestyle.",
    missionSecond: "Using advanced machine learning, we analyze your preferences, skin type, and goals to recommend products that bring the most value.",
    valuesTitle: "Our values",
    values: [
      { title: "Innovation", description: "We use AI and modern technology to deliver a personalized approach for every customer" },
      { title: "Quality", description: "We work only with trusted premium brands and guarantee product authenticity" },
      { title: "Care", description: "We help you find the ideal products for your skin type and needs" },
    ],
    statsTitle: "Uilesim in numbers",
    stats: [
      { value: "50 000+", label: "Happy customers" },
      { value: "500+", label: "Premium brands" },
      { value: "10 000+", label: "Products in the catalog" },
      { value: "98%", label: "Satisfaction rating" },
    ],
    technologyTitle: "Personalization technology",
    technologyFirst: "Our ProfileWizard system analyzes 7 key parameters: skin type, main concerns, care goals, budget, brand and texture preferences, and lifestyle. Based on this data, we create personal recommendations and adaptive offers.",
    technologySecond: "The system keeps learning from your purchases, ratings, and interactions, making recommendations more accurate over time.",
    loyaltyTitle: "Loyalty program",
    loyaltyIntro: "We value every customer and designed a multi-level loyalty program with 3 statuses: Bronze, Silver, and Gold. Each level unlocks extra benefits and exclusive offers.",
    loyaltyItems: [
      { title: "Reward points", description: "1% of every purchase comes back as points" },
      { title: "Personal offers", description: "Exclusive offers based on your preferences" },
      { title: "Early access", description: "Be the first to hear about launches and sales" },
      { title: "Free delivery", description: "Delivery is always free for Silver+ tiers" },
    ],
    ctaTitle: "Ready to start your journey to ideal skin?",
    ctaDescription: "Take a quick ProfileWizard test and get personal recommendations tailored specifically to you",
    catalogButton: "Go to catalog",
    wizardButton: "Take ProfileWizard",
  },
} as const;

export default function AboutPage() {
  const { language, messages } = useI18n();
  const copy = aboutPageCopy[language];
  const brandValues = [
    { icon: <Sparkles className="w-6 h-6" />, ...copy.values[0] },
    { icon: <Award className="w-6 h-6" />, ...copy.values[1] },
    { icon: <Heart className="w-6 h-6" />, ...copy.values[2] },
  ];

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="app-page-container py-8">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: messages.common.home, href: "/" }, { label: copy.breadcrumb }]} />
        </div>

        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-500 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            {copy.eyebrow}
          </div>
          <h1 className="text-4xl lg:text-5xl font-semibold text-gray-900 mb-6">{copy.title}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{copy.intro}</p>
        </div>

        <div className="mb-16">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 lg:p-12 text-white">
            <h2 className="text-2xl lg:text-3xl font-semibold mb-4">{copy.missionTitle}</h2>
            <p className="text-lg text-gray-200 leading-relaxed mb-6">{copy.missionFirst}</p>
            <p className="text-lg text-gray-200 leading-relaxed">{copy.missionSecond}</p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-8 text-center">{copy.valuesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {brandValues.map((value) => (
              <div key={value.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center text-pink-500 mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 lg:p-12">
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-8 text-center">{copy.statsTitle}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {copy.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl lg:text-4xl font-semibold text-pink-500 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl border border-pink-100 p-8 lg:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900">{copy.technologyTitle}</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">{copy.technologyFirst}</p>
            <p className="text-gray-600 leading-relaxed">{copy.technologySecond}</p>
          </div>
        </div>

        <div className="mb-16">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 lg:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-pink-500" />
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900">{copy.loyaltyTitle}</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">{copy.loyaltyIntro}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {copy.loyaltyItems.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">{item.title}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 lg:p-12 text-white">
            <ShoppingBag className="w-12 h-12 mx-auto mb-6 text-pink-500" />
            <h2 className="text-2xl lg:text-3xl font-semibold mb-4">{copy.ctaTitle}</h2>
            <p className="text-gray-200 mb-8 max-w-2xl mx-auto">{copy.ctaDescription}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg">
                {copy.catalogButton}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="secondary" size="lg">
                {copy.wizardButton}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
