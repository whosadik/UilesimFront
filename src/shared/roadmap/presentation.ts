export type RoadmapLanguage = 'ru' | 'kk' | 'en';

export type RoadmapCategoryOption = {
  id: string;
  label: string;
  icon: string;
};

export type RoadmapStepMeta = {
  points: number;
  why: string;
  improves: string;
  benefit: string;
};

const roadmapCategories = {
  ru: [
    { id: 'skincare', label: 'Уход за кожей', icon: '✨' },
    { id: 'makeup', label: 'Макияж', icon: '💄' },
    { id: 'haircare', label: 'Уход за волосами', icon: '💇' },
    { id: 'fragrance', label: 'Ароматы', icon: '🌸' },
  ],
  kk: [
    { id: 'skincare', label: 'Тері күтімі', icon: '✨' },
    { id: 'makeup', label: 'Макияж', icon: '💄' },
    { id: 'haircare', label: 'Шаш күтімі', icon: '💇' },
    { id: 'fragrance', label: 'Хош иіс', icon: '🌸' },
  ],
  en: [
    { id: 'skincare', label: 'Skincare', icon: '✨' },
    { id: 'makeup', label: 'Makeup', icon: '💄' },
    { id: 'haircare', label: 'Haircare', icon: '💇' },
    { id: 'fragrance', label: 'Fragrance', icon: '🌸' },
  ],
} satisfies Record<RoadmapLanguage, RoadmapCategoryOption[]>;

const roadmapStepText = {
  ru: {
    cleanser: { title: 'Очищение', description: 'Начните с мягкого очищающего средства для вашего типа кожи.' },
    toner: { title: 'Тонизирование', description: 'Восстановите баланс кожи с помощью подходящего тоника.' },
    serum: { title: 'Сыворотка', description: 'Добавьте активный этап для решения текущей задачи кожи.' },
    moisturizer: { title: 'Увлажнение', description: 'Закрепите уход увлажняющим средством для поддержки кожного барьера.' },
    spf: { title: 'SPF-защита', description: 'Завершите дневной уход средством с солнцезащитой.' },
    shampoo: { title: 'Очищение кожи головы', description: 'Подберите шампунь по типу кожи головы и частоте мытья.' },
    conditioner: { title: 'Кондиционирование', description: 'Используйте кондиционер для защиты длины и гладкости волос.' },
    hair_mask: { title: 'Маска для волос', description: 'Добавьте еженедельный восстанавливающий этап ухода.' },
    hair_oil: { title: 'Масло для волос', description: 'Используйте масло для защиты длины, гладкости и блеска.' },
    scalp_serum: { title: 'Сыворотка для кожи головы', description: 'Добавьте целевой уход для кожи головы и корней волос.' },
    foundation: { title: 'Тон', description: 'Подберите основу, подходящую по тону и типу кожи.' },
    eyeshadow: { title: 'Акцент для глаз', description: 'Добавьте продукт для акцента и завершения макияжа глаз.' },
    lipstick: { title: 'Акцент для губ', description: 'Завершите образ подходящим оттенком для губ.' },
    perfume: { title: 'Парфюмерная база', description: 'Подберите аромат, который соответствует вашим предпочтениям.' },
    fallbackTitle: 'Шаг ухода',
    fallbackDescription: 'Персональный шаг, добавленный в ваш roadmap.',
  },
  kk: {
    cleanser: { title: 'Тазарту', description: 'Тері түріңізге сай жұмсақ тазартқыштан бастаңыз.' },
    toner: { title: 'Тонерлеу', description: 'Терінің тепе-теңдігін лайықты тонермен қалпына келтіріңіз.' },
    serum: { title: 'Сарысу', description: 'Ағымдағы тері мақсатыңызға арналған белсенді қадам қосыңыз.' },
    moisturizer: { title: 'Ылғалдандыру', description: 'Тері тосқауылын қолдау үшін күтімді ылғалдандырғышпен бекітіңіз.' },
    spf: { title: 'SPF қорғаныс', description: 'Күндізгі күтімді күннен қорғайтын құралмен аяқтаңыз.' },
    shampoo: { title: 'Бас терісін тазарту', description: 'Бас терісінің түрі мен жуу жиілігіне сай сусабын таңдаңыз.' },
    conditioner: { title: 'Кондиционерлеу', description: 'Шаш ұзындығын қорғап, тегістік беру үшін кондиционер қолданыңыз.' },
    hair_mask: { title: 'Шашқа арналған маска', description: 'Апталық қалпына келтіретін күтім қадамын қосыңыз.' },
    hair_oil: { title: 'Шаш майы', description: 'Ұзындықты қорғап, тегістік пен жылтыр беру үшін май қолданыңыз.' },
    scalp_serum: { title: 'Бас терісіне арналған сарысу', description: 'Бас терісі мен түпке бағытталған күтім қадамын қосыңыз.' },
    foundation: { title: 'Тон', description: 'Теріңіздің реңкі мен түріне сай негіз таңдаңыз.' },
    eyeshadow: { title: 'Көзге акцент', description: 'Көз макияжын толықтыратын акценттік өнім қосыңыз.' },
    lipstick: { title: 'Ерінге акцент', description: 'Бейнеңізді лайықты ерін реңкімен аяқтаңыз.' },
    perfume: { title: 'Хош иіс негізі', description: 'Қалауыңызға сай келетін хош иісті таңдаңыз.' },
    fallbackTitle: 'Күтім қадамы',
    fallbackDescription: 'Roadmap-қа қосылған жеке қадам.',
  },
  en: {
    cleanser: { title: 'Cleanse', description: 'Start with a gentle cleanser for your skin type.' },
    toner: { title: 'Tone', description: 'Restore skin balance with a suitable toner.' },
    serum: { title: 'Serum', description: 'Add an active step to address your current skin goal.' },
    moisturizer: { title: 'Moisturize', description: 'Seal in the routine with a moisturizer that supports the skin barrier.' },
    spf: { title: 'SPF protection', description: 'Finish your daytime routine with sun protection.' },
    shampoo: { title: 'Scalp cleanse', description: 'Choose a shampoo based on your scalp type and wash frequency.' },
    conditioner: { title: 'Condition', description: 'Use conditioner to protect your lengths and add smoothness.' },
    hair_mask: { title: 'Hair mask', description: 'Add a weekly restorative care step.' },
    hair_oil: { title: 'Hair oil', description: 'Use oil to protect the lengths, smooth frizz, and add shine.' },
    scalp_serum: { title: 'Scalp serum', description: 'Add targeted care for the scalp and roots.' },
    foundation: { title: 'Foundation', description: 'Choose a base that matches your tone and skin type.' },
    eyeshadow: { title: 'Eye accent', description: 'Add a product that defines and finishes your eye makeup.' },
    lipstick: { title: 'Lip accent', description: 'Finish the look with a lip shade that suits you.' },
    perfume: { title: 'Fragrance base', description: 'Choose a fragrance that matches your preferences.' },
    fallbackTitle: 'Care step',
    fallbackDescription: 'A personal step added to your roadmap.',
  },
} as const;

const roadmapStepMeta = {
  ru: {
    cleanser: { points: 120, why: 'Базовый шаг для стабильной рутины.', improves: 'Очищение и подготовку кожи.', benefit: 'Первые изменения обычно заметны в течение недели.' },
    toner: { points: 90, why: 'Помогает выровнять баланс после очищения.', improves: 'Комфорт и текстуру кожи.', benefit: 'Кожа выглядит более ровной и спокойной.' },
    serum: { points: 140, why: 'Целевой шаг под вашу текущую задачу.', improves: 'Выраженность ключевой проблемы.', benefit: 'Результат обычно проявляется через 2-4 недели.' },
    moisturizer: { points: 130, why: 'Закрепляет эффект предыдущих шагов.', improves: 'Защитный барьер и эластичность.', benefit: 'Меньше сухости и дискомфорта.' },
    spf: { points: 190, why: 'Ключевой этап дневной защиты кожи.', improves: 'Профилактику пигментации и фотостарения.', benefit: 'Защищает результат ухода в долгую.' },
    shampoo: { points: 100, why: 'Основа регулярного ухода за волосами.', improves: 'Состояние кожи головы.', benefit: 'Больше чистоты и комфорта между мытьем.' },
    conditioner: { points: 110, why: 'Нужен для защиты длины после очищения.', improves: 'Мягкость и управляемость волос.', benefit: 'Меньше спутывания и ломкости.' },
    hair_mask: { points: 150, why: 'Усиливает базовый уход раз в неделю.', improves: 'Плотность и восстановление длины.', benefit: 'Волосы выглядят более гладкими.' },
    hair_oil: { points: 130, why: 'Защищает длину от пересушивания.', improves: 'Гладкость и блеск.', benefit: 'Меньше пушения и сухости на концах.' },
    scalp_serum: { points: 145, why: 'Целевой уход за кожей головы.', improves: 'Баланс и комфорт кожи головы.', benefit: 'Повышает эффективность всей рутины.' },
    fallback: { points: 100, why: 'Персональный шаг подобран на основе ваших данных.', improves: 'Результат вашей рутины.', benefit: 'Улучшения обычно заметны при регулярном использовании.' },
  },
  kk: {
    cleanser: { points: 120, why: 'Тұрақты рутинаға арналған негізгі қадам.', improves: 'Теріні тазарту мен дайындауды.', benefit: 'Алғашқы өзгерістер әдетте бір апта ішінде байқалады.' },
    toner: { points: 90, why: 'Тазартудан кейін тепе-теңдікті қалпына келтіруге көмектеседі.', improves: 'Терінің жайлылығы мен құрылымын.', benefit: 'Тері біркелкі әрі тыныш көрінеді.' },
    serum: { points: 140, why: 'Ағымдағы мақсатыңызға бағытталған қадам.', improves: 'Негізгі мәселенің айқындылығын.', benefit: 'Нәтиже әдетте 2-4 аптада көріне бастайды.' },
    moisturizer: { points: 130, why: 'Алдыңғы қадамдардың әсерін бекітеді.', improves: 'Қорғаныс тосқауылы мен серпімділікті.', benefit: 'Құрғақтық пен жайсыздық азаяды.' },
    spf: { points: 190, why: 'Күндізгі қорғаныстың негізгі кезеңі.', improves: 'Пигментация мен фотокартаюдың алдын алуды.', benefit: 'Күтім нәтижесін ұзақ мерзімге қорғайды.' },
    shampoo: { points: 100, why: 'Шаш күтімінің тұрақты негізі.', improves: 'Бас терісінің жағдайын.', benefit: 'Жуу аралығындағы тазалық пен жайлылықты арттырады.' },
    conditioner: { points: 110, why: 'Тазартудан кейін ұзындықты қорғау үшін қажет.', improves: 'Шаштың жұмсақтығы мен басқарылуын.', benefit: 'Шатасу мен сыну азаяды.' },
    hair_mask: { points: 150, why: 'Апталық күтімді күшейтеді.', improves: 'Ұзындықтың тығыздығы мен қалпына келуін.', benefit: 'Шаш тегіс көрінеді.' },
    hair_oil: { points: 130, why: 'Ұзындықты құрғаудан қорғайды.', improves: 'Тегістік пен жылтырды.', benefit: 'Пушение мен ұштың құрғауы азаяды.' },
    scalp_serum: { points: 145, why: 'Бас терісіне арналған мақсатты күтім.', improves: 'Бас терісінің тепе-теңдігі мен жайлылығын.', benefit: 'Бүкіл рутинаның тиімділігін арттырады.' },
    fallback: { points: 100, why: 'Жеке қадам деректеріңізге сүйеніп таңдалды.', improves: 'Рутинаңыздың нәтижесін.', benefit: 'Тұрақты қолданғанда жақсару байқалады.' },
  },
  en: {
    cleanser: { points: 120, why: 'A core step for a stable routine.', improves: 'Cleansing and skin prep.', benefit: 'First changes are usually noticeable within a week.' },
    toner: { points: 90, why: 'Helps rebalance the skin after cleansing.', improves: 'Comfort and skin texture.', benefit: 'Skin looks calmer and more even.' },
    serum: { points: 140, why: 'A targeted step for your current concern.', improves: 'The visibility of the main concern.', benefit: 'Results usually show in 2-4 weeks.' },
    moisturizer: { points: 130, why: 'Locks in the effect of previous steps.', improves: 'Barrier support and elasticity.', benefit: 'Less dryness and discomfort.' },
    spf: { points: 190, why: 'A key step in daytime protection.', improves: 'Prevention of pigmentation and photoaging.', benefit: 'Protects your routine results long term.' },
    shampoo: { points: 100, why: 'The foundation of regular hair care.', improves: 'Scalp condition.', benefit: 'More cleanliness and comfort between washes.' },
    conditioner: { points: 110, why: 'Needed to protect the lengths after cleansing.', improves: 'Softness and manageability.', benefit: 'Less tangling and breakage.' },
    hair_mask: { points: 150, why: 'Boosts your base care once a week.', improves: 'Hair density and repair.', benefit: 'Hair looks smoother.' },
    hair_oil: { points: 130, why: 'Protects hair lengths from overdrying.', improves: 'Smoothness and shine.', benefit: 'Less frizz and dry ends.' },
    scalp_serum: { points: 145, why: 'A targeted scalp care step.', improves: 'Scalp balance and comfort.', benefit: 'Improves the efficiency of the whole routine.' },
    fallback: { points: 100, why: 'A personal step selected from your data.', improves: 'Your routine results.', benefit: 'Improvements are usually noticeable with regular use.' },
  },
} as const;

export const ROADMAP_CATEGORY_OPTIONS: RoadmapCategoryOption[] = roadmapCategories.ru;
export const ROADMAP_CATEGORY_LABELS = ROADMAP_CATEGORY_OPTIONS.reduce<Record<string, string>>((acc, category) => {
  acc[category.id] = category.label;
  return acc;
}, {});

export function getRoadmapCategoryOptions(language: RoadmapLanguage = 'ru'): RoadmapCategoryOption[] {
  return roadmapCategories[language];
}

export function getRoadmapCategoryLabels(language: RoadmapLanguage = 'ru'): Record<string, string> {
  return getRoadmapCategoryOptions(language).reduce<Record<string, string>>((acc, category) => {
    acc[category.id] = category.label;
    return acc;
  }, {});
}

export function getRoadmapCategoryLabel(categoryId: string, language: RoadmapLanguage = 'ru'): string {
  return getRoadmapCategoryLabels(language)[categoryId] ?? categoryId;
}

export const DEFAULT_ROADMAP_STEP_META: RoadmapStepMeta = roadmapStepMeta.ru.fallback;

export function formatRoadmapProductType(productType: string, language: RoadmapLanguage = 'ru'): string {
  const prepared = productType.replace(/_/g, ' ').trim();
  if (!prepared) {
    return roadmapStepText[language].fallbackTitle;
  }

  if (language === 'en') {
    return prepared
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  return prepared.charAt(0).toUpperCase() + prepared.slice(1);
}

export function getRoadmapStepPresentation(
  productType: string,
  language: RoadmapLanguage = 'ru',
): { title: string; description: string } {
  const localized = roadmapStepText[language][productType as keyof typeof roadmapStepText.ru];
  if (localized) {
    return localized;
  }

  return {
    title: formatRoadmapProductType(productType, language),
    description: roadmapStepText[language].fallbackDescription,
  };
}

export function getRoadmapStepMeta(productType: string, language: RoadmapLanguage = 'ru'): RoadmapStepMeta {
  return roadmapStepMeta[language][productType as keyof typeof roadmapStepMeta.ru] ?? roadmapStepMeta[language].fallback;
}

export function mapRoadmapStatusToUiStatus(
  apiStatus: string,
  isCurrent: boolean,
): 'pending' | 'completed' | 'current' {
  if (isCurrent) {
    return 'current';
  }

  if (apiStatus === 'completed' || apiStatus === 'owned' || apiStatus === 'skipped') {
    return 'completed';
  }

  return 'pending';
}
