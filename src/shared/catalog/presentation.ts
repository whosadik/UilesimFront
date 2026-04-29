import type { AppLanguage } from '../i18n/messages';
import {
  getRoadmapCategoryLabel,
  getRoadmapStepPresentation,
  type RoadmapLanguage,
} from '../roadmap/presentation';

type LabelDictionary = Record<AppLanguage, Record<string, string>>;

const PRODUCT_TYPE_LABELS: LabelDictionary = {
  ru: {
    cleanser: 'Очищение',
    toner: 'Тоник',
    serum: 'Сыворотка',
    moisturizer: 'Увлажнение',
    spf: 'SPF',
    mask: 'Маска',
    shampoo: 'Шампунь',
    conditioner: 'Кондиционер',
    hair_mask: 'Маска для волос',
    hair_oil: 'Масло для волос',
    scalp_serum: 'Сыворотка для кожи головы',
    leave_in: 'Несмываемый уход',
    styling: 'Стайлинг',
    foundation: 'Тональная основа',
    eyeshadow: 'Тени для век',
    lipstick: 'Помада',
    mascara: 'Тушь',
    brow: 'Средство для бровей',
    blush: 'Румяна',
    brush: 'Кисть',
    set: 'Набор',
    perfume: 'Парфюм',
    fragrance: 'Аромат',
    edp: 'Парфюмерная вода',
    edt: 'Туалетная вода',
    body_mist: 'Мист для тела',
    travel: 'Мини-формат',
  },
  kk: {
    cleanser: 'Тазарту',
    toner: 'Тонер',
    serum: 'Сарысу',
    moisturizer: 'Ылғалдандыру',
    spf: 'SPF',
    mask: 'Маска',
    shampoo: 'Сусабын',
    conditioner: 'Кондиционер',
    hair_mask: 'Шаш маскасы',
    hair_oil: 'Шаш майы',
    scalp_serum: 'Бас терісіне арналған сарысу',
    leave_in: 'Жуылмайтын күтім',
    styling: 'Шаш сәндеу',
    foundation: 'Тоналды негіз',
    eyeshadow: 'Көз бояуы',
    lipstick: 'Ерін далабы',
    mascara: 'Сүрме',
    brow: 'Қасқа арналған құрал',
    blush: 'Бет далабы',
    brush: 'Қылқалам',
    set: 'Жинақ',
    perfume: 'Парфюм',
    fragrance: 'Хош иіс',
    edp: 'Парфюм суы',
    edt: 'Иіссу',
    body_mist: 'Дене мисті',
    travel: 'Мини-формат',
  },
  en: {
    cleanser: 'Cleanser',
    toner: 'Toner',
    serum: 'Serum',
    moisturizer: 'Moisturizer',
    spf: 'SPF',
    mask: 'Mask',
    shampoo: 'Shampoo',
    conditioner: 'Conditioner',
    hair_mask: 'Hair mask',
    hair_oil: 'Hair oil',
    scalp_serum: 'Scalp serum',
    leave_in: 'Leave-in care',
    styling: 'Styling',
    foundation: 'Foundation',
    eyeshadow: 'Eyeshadow',
    lipstick: 'Lipstick',
    mascara: 'Mascara',
    brow: 'Brow product',
    blush: 'Blush',
    brush: 'Brush',
    set: 'Set',
    perfume: 'Perfume',
    fragrance: 'Fragrance',
    edp: 'Eau de parfum',
    edt: 'Eau de toilette',
    body_mist: 'Body mist',
    travel: 'Travel size',
  },
};

const CATEGORY_LABELS: LabelDictionary = {
  ru: {
    skincare: 'Уход за кожей',
    haircare: 'Уход за волосами',
    makeup: 'Макияж',
    fragrance: 'Ароматы',
  },
  kk: {
    skincare: 'Тері күтімі',
    haircare: 'Шаш күтімі',
    makeup: 'Макияж',
    fragrance: 'Хош иіс',
  },
  en: {
    skincare: 'Skincare',
    haircare: 'Haircare',
    makeup: 'Makeup',
    fragrance: 'Fragrance',
  },
};

const STRENGTH_LABELS: LabelDictionary = {
  ru: {
    low: 'низкая',
    medium: 'средняя',
    high: 'высокая',
  },
  kk: {
    low: 'жеңіл',
    medium: 'орташа',
    high: 'жоғары',
  },
  en: {
    low: 'low',
    medium: 'medium',
    high: 'high',
  },
};

const TOKEN_LABELS: LabelDictionary = {
  ru: {
    acne: 'акне',
    anti_age: 'антивозрастной уход',
    aging: 'возрастные изменения',
    anti_aging: 'антивозрастной уход',
    brightening: 'сияние',
    build_up: 'накопление стайлинга',
    cleansing: 'очищение',
    damage: 'повреждение',
    definition: 'оформление завитка',
    detangling: 'легкое расчесывание',
    dry: 'сухая',
    dryness: 'сухость',
    even_tone: 'ровный тон',
    flakes: 'шелушение',
    flatness: 'недостаток объема',
    fragrance: 'отдушка',
    fragrance_free: 'без отдушки',
    frizz: 'пушение',
    frizz_control: 'контроль пушения',
    glow: 'сияние',
    hydration: 'увлажнение',
    itchiness: 'зуд',
    lightweight_care: 'легкий уход',
    normal: 'нормальная',
    oiliness: 'жирность',
    oily: 'жирная',
    pigmentation: 'пигментация',
    repair: 'восстановление',
    scalp_balance: 'баланс кожи головы',
    scalp_health: 'здоровье кожи головы',
    sensitive: 'чувствительная',
    shine: 'блеск',
    smoothness: 'гладкость',
    split_ends: 'секущиеся концы',
    sun_protection: 'защита от солнца',
    tone_evening: 'выравнивание тона',
    volume: 'объем',
    aloe: 'алоэ',
    amino_acids: 'аминокислоты',
    argan_oil: 'аргановое масло',
    biotin: 'биотин',
    ceramide: 'церамиды',
    ceramide_np: 'церамиды',
    centella: 'центелла',
    glycerin: 'глицерин',
    hyaluronic_acid: 'гиалуроновая кислота',
    jojoba_oil: 'масло жожоба',
    keratin: 'кератин',
    niacinamide: 'ниацинамид',
    panthenol: 'пантенол',
    rice_protein: 'рисовый протеин',
    salicylic_acid: 'салициловая кислота',
    squalane: 'сквалан',
    tea_tree: 'чайное дерево',
    vitamin_c: 'витамин C',
    vitamin_e: 'витамин E',
    zinc_pca: 'цинк PCA',
    combination: 'комбинированная',
    cruelty_free: 'cruelty-free',
    heavy_oils: 'тяжелые масла',
    silicones: 'силиконы',
  },
  kk: {
    acne: 'акне',
    anti_age: 'қартаюға қарсы күтім',
    aging: 'жас өзгерістері',
    anti_aging: 'қартаюға қарсы күтім',
    brightening: 'жарқырау',
    build_up: 'стайлинг қалдығы',
    cleansing: 'тазарту',
    damage: 'зақымдану',
    definition: 'бұйраны айқындау',
    detangling: 'жеңіл тарау',
    dry: 'құрғақ',
    dryness: 'құрғақтық',
    even_tone: 'біркелкі рең',
    flakes: 'қабыршақтану',
    flatness: 'көлемнің аздығы',
    fragrance: 'хош иіс',
    fragrance_free: 'иіссіз',
    frizz: 'үлпілдеу',
    frizz_control: 'үлпілдеуді бақылау',
    glow: 'жарқырау',
    hydration: 'ылғалдандыру',
    itchiness: 'қышу',
    lightweight_care: 'жеңіл күтім',
    normal: 'қалыпты',
    oiliness: 'майлылық',
    oily: 'майлы',
    pigmentation: 'пигментация',
    repair: 'қалпына келтіру',
    scalp_balance: 'бас терісінің тепе-теңдігі',
    scalp_health: 'бас терісінің саулығы',
    sensitive: 'сезімтал',
    shine: 'жылтыр',
    smoothness: 'тегістік',
    split_ends: 'ұштың сынуы',
    sun_protection: 'күннен қорғау',
    tone_evening: 'реңді теңестіру',
    volume: 'көлем',
    aloe: 'алоэ',
    amino_acids: 'аминқышқылдары',
    argan_oil: 'арган майы',
    biotin: 'биотин',
    ceramide: 'церамидтер',
    ceramide_np: 'церамидтер',
    centella: 'центелла',
    glycerin: 'глицерин',
    hyaluronic_acid: 'гиалурон қышқылы',
    jojoba_oil: 'жожоба майы',
    keratin: 'кератин',
    niacinamide: 'ниацинамид',
    panthenol: 'пантенол',
    rice_protein: 'күріш протеині',
    salicylic_acid: 'салицил қышқылы',
    squalane: 'сквалан',
    tea_tree: 'шай ағашы',
    vitamin_c: 'C дәрумені',
    vitamin_e: 'E дәрумені',
    zinc_pca: 'цинк PCA',
    combination: 'аралас',
    cruelty_free: 'cruelty-free',
    heavy_oils: 'ауыр майлар',
    silicones: 'силикондар',
  },
  en: {
    acne: 'acne',
    anti_age: 'anti-aging care',
    aging: 'aging',
    anti_aging: 'anti-aging care',
    brightening: 'brightening',
    build_up: 'build-up',
    cleansing: 'cleansing',
    damage: 'damage',
    definition: 'definition',
    detangling: 'detangling',
    dry: 'dry',
    dryness: 'dryness',
    even_tone: 'even tone',
    flakes: 'flakes',
    flatness: 'flatness',
    fragrance: 'fragrance',
    fragrance_free: 'fragrance-free',
    frizz: 'frizz',
    frizz_control: 'frizz control',
    glow: 'glow',
    hydration: 'hydration',
    itchiness: 'itchiness',
    lightweight_care: 'lightweight care',
    normal: 'normal',
    oiliness: 'oiliness',
    oily: 'oily',
    pigmentation: 'pigmentation',
    repair: 'repair',
    scalp_balance: 'scalp balance',
    scalp_health: 'scalp health',
    sensitive: 'sensitive',
    shine: 'shine',
    smoothness: 'smoothness',
    split_ends: 'split ends',
    sun_protection: 'sun protection',
    tone_evening: 'tone evening',
    volume: 'volume',
    aloe: 'aloe',
    amino_acids: 'amino acids',
    argan_oil: 'argan oil',
    biotin: 'biotin',
    ceramide: 'ceramides',
    ceramide_np: 'ceramides',
    centella: 'centella',
    glycerin: 'glycerin',
    hyaluronic_acid: 'hyaluronic acid',
    jojoba_oil: 'jojoba oil',
    keratin: 'keratin',
    niacinamide: 'niacinamide',
    panthenol: 'panthenol',
    rice_protein: 'rice protein',
    salicylic_acid: 'salicylic acid',
    squalane: 'squalane',
    tea_tree: 'tea tree',
    vitamin_c: 'vitamin C',
    vitamin_e: 'vitamin E',
    zinc_pca: 'zinc PCA',
    combination: 'combination',
    cruelty_free: 'cruelty-free',
    heavy_oils: 'heavy oils',
    silicones: 'silicones',
  },
};

const RECOMMENDATION_REASON_COPY = {
  ru: {
    topSelling30d: (qty?: string) => (qty ? `Топ продаж за 30 дней (шт: ${qty})` : 'Топ продаж за 30 дней'),
    coldStartGlobal: 'Популярный товар',
    coldStartProductType: (label: string) => `Популярно среди товаров типа «${label}»`,
    coldStartCategory: (label: string) => `Популярно в категории «${label}»`,
    relaxedFilters: 'Подбор расширен из-за малого числа точных совпадений',
    frequentWithProduct: (count?: string) => (count ? `Часто покупают вместе (${count})` : 'Часто покупают вместе'),
    oftenWithItems: (count?: string) =>
      count ? `Часто покупают вместе с вашими товарами (${count})` : 'Часто покупают вместе с вашими товарами',
    similarItems: 'Похожие товары по свойствам',
    sameBrand: 'Тот же бренд',
    complementsItem: 'Дополняет ваш товар',
    catalogFallback: 'Подбор из каталога',
    runtimeFallback: 'Запасной вариант из каталога',
    uplifted: 'Выше из-за интереса пользователей',
    penalized: 'Показ ограничен из-за повторов',
    matches: 'Совпадает с профилем',
    profileGoals: 'Совпадает с целями профиля',
    profileConcerns: 'Совпадает с вашими задачами',
    profileNotes: 'Совпадает с любимыми нотами',
    hasActives: 'Есть активные компоненты',
    similarConcerns: 'Похожие задачи',
    sameAttribute: (attribute: string, value: string) => `Тот же ${attribute}: ${value}`,
  },
  kk: {
    topSelling30d: (qty?: string) => (qty ? `30 күндегі топ сатылым (саны: ${qty})` : '30 күндегі топ сатылым'),
    coldStartGlobal: 'Танымал тауар',
    coldStartProductType: (label: string) => `«${label}» түріндегі танымал тауар`,
    coldStartCategory: (label: string) => `«${label}» санатындағы танымал тауар`,
    relaxedFilters: 'Дәл сәйкестік аз болғандықтан таңдау кеңейтілді',
    frequentWithProduct: (count?: string) => (count ? `Жиі бірге сатып алады (${count})` : 'Жиі бірге сатып алады'),
    oftenWithItems: (count?: string) =>
      count ? `Сіздің тауарларыңызбен жиі бірге сатып алады (${count})` : 'Сіздің тауарларыңызбен жиі бірге сатып алады',
    similarItems: 'Қасиеттері ұқсас тауарлар',
    sameBrand: 'Сол бренд',
    complementsItem: 'Тауарыңызды толықтырады',
    catalogFallback: 'Каталогтан таңдау',
    runtimeFallback: 'Каталогтан қосымша нұсқа',
    uplifted: 'Пайдаланушылар қызығушылығы бойынша жоғары',
    penalized: 'Қайталанған көрсетілімдерге байланысты шектелді',
    matches: 'Профильге сәйкес',
    profileGoals: 'Профиль мақсаттарына сәйкес',
    profileConcerns: 'Сіздің мақсаттарыңызға сәйкес',
    profileNotes: 'Ұнайтын ноталарға сәйкес',
    hasActives: 'Белсенді компоненттері бар',
    similarConcerns: 'Ұқсас мақсаттар',
    sameAttribute: (attribute: string, value: string) => `Сол ${attribute}: ${value}`,
  },
  en: {
    topSelling30d: (qty?: string) => (qty ? `Top-selling in the last 30 days (qty=${qty})` : 'Top-selling in the last 30 days'),
    coldStartGlobal: 'Popular product',
    coldStartProductType: (label: string) => `Popular among ${label.toLowerCase()} products`,
    coldStartCategory: (label: string) => `Popular in ${label.toLowerCase()}`,
    relaxedFilters: 'Selection widened because exact matches are sparse',
    frequentWithProduct: (count?: string) => (count ? `Frequently purchased together (${count})` : 'Frequently purchased together'),
    oftenWithItems: (count?: string) =>
      count ? `Often bought together with your items (${count})` : 'Often bought together with your items',
    similarItems: 'Similar items by attributes',
    sameBrand: 'Same brand',
    complementsItem: 'Complements your item',
    catalogFallback: 'Catalog match',
    runtimeFallback: 'Catalog fallback candidate',
    uplifted: 'Boosted by user engagement',
    penalized: 'Limited after repeated impressions',
    matches: 'Matches your profile',
    profileGoals: 'Matches profile goals',
    profileConcerns: 'Matches your concerns',
    profileNotes: 'Matches favorite notes',
    hasActives: 'Has active ingredients',
    similarConcerns: 'Similar concerns',
    sameAttribute: (attribute: string, value: string) => `Same ${attribute}: ${value}`,
  },
} as const;

const ATTRIBUTE_LABELS: LabelDictionary = {
  ru: {
    skin_type: 'тип кожи',
    hair_type: 'тип волос',
    scalp_type: 'тип кожи головы',
    hair_thickness: 'толщина волос',
    scent_family: 'семейство аромата',
    intensity: 'интенсивность',
    finish: 'финиш',
    coverage: 'покрытие',
    undertone: 'подтон',
    tone_family: 'тон',
  },
  kk: {
    skin_type: 'тері түрі',
    hair_type: 'шаш түрі',
    scalp_type: 'бас терісі',
    hair_thickness: 'шаш қалыңдығы',
    scent_family: 'хош иіс тобы',
    intensity: 'қарқындылық',
    finish: 'финиш',
    coverage: 'жабын',
    undertone: 'астыңғы рең',
    tone_family: 'рең',
  },
  en: {
    skin_type: 'skin type',
    hair_type: 'hair type',
    scalp_type: 'scalp type',
    hair_thickness: 'hair thickness',
    scent_family: 'scent family',
    intensity: 'intensity',
    finish: 'finish',
    coverage: 'coverage',
    undertone: 'undertone',
    tone_family: 'tone',
  },
};

function normalizeToken(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }

  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

export function formatCatalogFreeTextLabel(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }

  const prepared = value.trim().replace(/_/g, ' ');
  return prepared[0].toUpperCase() + prepared.slice(1);
}

export function formatCatalogTokenLabel(
  value: unknown,
  language: AppLanguage = 'ru',
): string | undefined {
  const normalized = normalizeToken(value);
  if (!normalized) {
    return undefined;
  }

  return TOKEN_LABELS[language][normalized] ?? formatCatalogFreeTextLabel(normalized);
}

export function formatCatalogTokenList(
  values: unknown,
  language: AppLanguage = 'ru',
): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((item) => formatCatalogTokenLabel(item, language))
    .filter((item): item is string => Boolean(item));
}

export function formatCatalogProductTypeLabel(
  value: unknown,
  language: AppLanguage = 'ru',
): string | undefined {
  const normalized = normalizeToken(value);
  if (!normalized) {
    return undefined;
  }

  const direct = PRODUCT_TYPE_LABELS[language][normalized];
  if (direct) {
    return direct;
  }

  const presentation = getRoadmapStepPresentation(normalized, language as RoadmapLanguage);
  return presentation.title || formatCatalogFreeTextLabel(normalized);
}

export function formatCatalogCategoryLabel(
  value: unknown,
  language: AppLanguage = 'ru',
): string | undefined {
  const normalized = normalizeToken(value);
  if (!normalized) {
    return undefined;
  }

  const direct = CATEGORY_LABELS[language][normalized];
  if (direct) {
    return direct;
  }

  const roadmapLabel = getRoadmapCategoryLabel(normalized, language as RoadmapLanguage);
  if (roadmapLabel && roadmapLabel !== normalized) {
    return roadmapLabel;
  }

  return formatCatalogFreeTextLabel(normalized);
}

export function formatCatalogStrengthLabel(
  value: unknown,
  language: AppLanguage = 'ru',
): string | undefined {
  const normalized = normalizeToken(value);
  if (!normalized) {
    return undefined;
  }

  return STRENGTH_LABELS[language][normalized] ?? formatCatalogFreeTextLabel(normalized);
}

function formatReasonScope(scope: string, language: AppLanguage): string {
  const copy = RECOMMENDATION_REASON_COPY[language];
  const productTypeMatch = scope.match(/^for product_type=(.+)$/i);
  if (productTypeMatch) {
    const label = formatCatalogProductTypeLabel(productTypeMatch[1], language) ?? productTypeMatch[1];
    return copy.coldStartProductType(label);
  }

  const categoryMatch = scope.match(/^in category=(.+)$/i);
  if (categoryMatch) {
    const label = formatCatalogCategoryLabel(categoryMatch[1], language) ?? categoryMatch[1];
    return copy.coldStartCategory(label);
  }

  return copy.coldStartGlobal;
}

export function localizeRecommendationReason(
  value: unknown,
  language: AppLanguage = 'ru',
): string | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }

  const text = value.trim();
  const copy = RECOMMENDATION_REASON_COPY[language];

  const topSelling30d = text.match(/^top-selling in last 30d\s*\(qty=(\d+)\)$/i);
  if (topSelling30d) {
    return copy.topSelling30d(topSelling30d[1]);
  }

  const coldStart = text.match(/^cold start:\s*top-selling\s*(.*)$/i);
  if (coldStart) {
    return formatReasonScope(coldStart[1].trim(), language);
  }

  const frequentWithProduct = text.match(/^frequently purchased with product_id=\d+\s*\(count=(\d+)\)$/i);
  if (frequentWithProduct) {
    return copy.frequentWithProduct(frequentWithProduct[1]);
  }

  const oftenWithItems = text.match(/^often bought together with your items\s*\(count=(\d+)\)$/i);
  if (oftenWithItems) {
    return copy.oftenWithItems(oftenWithItems[1]);
  }

  if (/^fallback:\s*relaxed category\/product_type filters due to sparse candidates$/i.test(text)) {
    return copy.relaxedFilters;
  }
  if (/^no\/weak co-occurrence yet;\s*showing similar items$/i.test(text)) {
    return copy.similarItems;
  }
  if (/^same brand$/i.test(text)) {
    return copy.sameBrand;
  }
  if (/^complements your item$/i.test(text)) {
    return copy.complementsItem;
  }
  if (/^fallback catalog match$/i.test(text)) {
    return copy.catalogFallback;
  }
  if (/^candidate from runtime retrieval fallback$/i.test(text)) {
    return copy.runtimeFallback;
  }
  if (/^uplifted due to engagement$/i.test(text)) {
    return copy.uplifted;
  }
  if (/^penalized due to repeated impressions$/i.test(text)) {
    return copy.penalized;
  }
  if (/^matches goals:/i.test(text)) {
    return copy.profileGoals;
  }
  if (/^matches (hair|makeup|profile )?concerns:/i.test(text)) {
    return copy.profileConcerns;
  }
  if (/^matches notes:/i.test(text) || /^overlapping notes:/i.test(text)) {
    return copy.profileNotes;
  }
  if (/^has actives$/i.test(text)) {
    return copy.hasActives;
  }
  if (/^similar concerns:/i.test(text)) {
    return copy.similarConcerns;
  }

  const attributeMatch = text.match(/^matches ([a-z_]+)=(.+)$/i);
  if (attributeMatch) {
    const attribute = normalizeToken(attributeMatch[1]) ?? attributeMatch[1];
    const valueLabel =
      attribute === 'intensity'
        ? formatCatalogStrengthLabel(attributeMatch[2], language)
        : formatCatalogFreeTextLabel(attributeMatch[2]);
    const attributeLabel = ATTRIBUTE_LABELS[language][attribute] ?? formatCatalogFreeTextLabel(attribute) ?? attribute;
    return valueLabel ? `${copy.matches}: ${attributeLabel} ${valueLabel}` : copy.matches;
  }

  const sameAttributeMatch = text.match(/^same ([a-z_]+)=(.+)$/i);
  if (sameAttributeMatch) {
    const attribute = normalizeToken(sameAttributeMatch[1]) ?? sameAttributeMatch[1];
    const valueLabel =
      attribute === 'intensity'
        ? formatCatalogStrengthLabel(sameAttributeMatch[2], language)
        : formatCatalogTokenLabel(sameAttributeMatch[2], language) ?? formatCatalogFreeTextLabel(sameAttributeMatch[2]);
    const attributeLabel = ATTRIBUTE_LABELS[language][attribute] ?? formatCatalogFreeTextLabel(attribute) ?? attribute;
    return valueLabel ? copy.sameAttribute(attributeLabel, valueLabel) : copy.sameBrand;
  }

  return text;
}
