import type {
  ProfileTaxonomy,
  ProfileTaxonomyBudgetOption,
  ProfileTaxonomyOption,
  ProfileTaxonomyStep,
} from '../api/me';
import type { AppLanguage } from '../i18n/messages';

const profileTaxonomyByLanguage: Record<AppLanguage, ProfileTaxonomy> = {
  ru: {
    steps: [
      { id: 1, key: 'skin_type', title: 'Тип кожи', description: 'Выберите ваш тип кожи.', optional: false },
      { id: 2, key: 'goals', title: 'Цели ухода', description: 'Что вы хотите улучшить в первую очередь?', optional: false },
      { id: 3, key: 'avoid_flags', title: 'Избегать', description: 'Ингредиенты и категории, которых вы хотите избегать.', optional: true },
      { id: 4, key: 'budget', title: 'Бюджет', description: 'Комфортный ценовой диапазон для рекомендаций.', optional: true },
      { id: 5, key: 'hair_profile', title: 'Волосы', description: 'Базовые предпочтения по уходу за волосами.', optional: true },
      { id: 6, key: 'makeup_profile', title: 'Макияж', description: 'Предпочтения по покрытию и макияжу.', optional: true },
      { id: 7, key: 'fragrance_profile', title: 'Ароматы', description: 'Любимые ноты и интенсивность аромата.', optional: true },
    ],
    skin_types: [
      { value: 'oily', label: 'Жирная', aliases: ['oily', 'майлы'] },
      { value: 'combination', label: 'Комбинированная', aliases: ['combination', 'аралас'] },
      { value: 'dry', label: 'Сухая', aliases: ['dry', 'құрғақ'] },
      { value: 'normal', label: 'Нормальная', aliases: ['normal', 'қалыпты'] },
      { value: 'sensitive', label: 'Чувствительная', aliases: ['sensitive', 'сезімтал'] },
    ],
    goals: [
      { value: 'hydration', label: 'Увлажнение', aliases: ['moisturizing', 'hydration', 'ылғалдандыру'] },
      { value: 'anti_aging', label: 'Антивозрастной уход', aliases: ['anti_age', 'aging', 'қартаюға қарсы'] },
      { value: 'acne', label: 'Против акне', aliases: ['blemishes', 'acne', 'безеуге қарсы'] },
      { value: 'brightening', label: 'Сияние и тон', aliases: ['glow', 'brightening', 'жарқырау'] },
      { value: 'spf', label: 'Защита SPF', aliases: ['sun_protection', 'spf', 'spf қорғаныс'] },
      { value: 'soothing', label: 'Успокоение', aliases: ['sensitivity', 'calming', 'тыныштандыру'] },
    ],
    avoid_flags: [
      { value: 'fragrance', label: 'Отдушки', aliases: ['perfume', 'fragrance', 'хош иіс'] },
      { value: 'alcohol', label: 'Спирт', aliases: ['alcohol'] },
      { value: 'essential_oils', label: 'Эфирные масла', aliases: ['essential oils', 'эфир майлары'] },
      { value: 'parabens', label: 'Парабены', aliases: ['parabens'] },
      { value: 'silicones', label: 'Силиконы', aliases: ['silicones'] },
      { value: 'gluten', label: 'Глютен', aliases: ['gluten'] },
    ],
    budget_options: [
      { value: 'low', label: 'До 2 500 ₸', min: 500, max: 2500, currency: 'KZT' },
      { value: 'medium', label: '2 500 - 7 500 ₸', min: 2500, max: 7500, currency: 'KZT' },
      { value: 'high', label: 'От 7 500 ₸', min: 7500, max: null, currency: 'KZT' },
    ],
    hair_types: [
      { value: 'straight', label: 'Прямые', aliases: ['straight', 'тік'] },
      { value: 'wavy', label: 'Волнистые', aliases: ['wavy', 'толқынды'] },
      { value: 'curly', label: 'Кудрявые', aliases: ['curly', 'бұйра'] },
      { value: 'coily', label: 'Афро', aliases: ['coily', 'coils'] },
    ],
    hair_concerns: [
      { value: 'hair_loss', label: 'Выпадение', aliases: ['hair loss', 'түсу'] },
      { value: 'repair', label: 'Восстановление', aliases: ['damage', 'split_ends', 'қалпына келтіру'] },
      { value: 'dryness', label: 'Сухость', aliases: ['dryness', 'құрғақтық'] },
      { value: 'oiliness', label: 'Жирность', aliases: ['oiliness', 'майлылық'] },
      { value: 'flakes', label: 'Перхоть', aliases: ['dandruff', 'қайызғақ'] },
      { value: 'volume', label: 'Объем', aliases: ['volume', 'көлем'] },
    ],
    coverage_options: [
      { value: 'light', label: 'Легкое', aliases: ['light', 'жеңіл'] },
      { value: 'medium', label: 'Среднее', aliases: ['medium', 'орташа'] },
      { value: 'full', label: 'Плотное', aliases: ['full', 'full_coverage', 'тығыз'] },
    ],
    fragrance_notes: [
      { value: 'citrus', label: 'Цитрус', aliases: ['citrus'] },
      { value: 'floral', label: 'Цветочные', aliases: ['floral', 'гүлді'] },
      { value: 'woody', label: 'Древесные', aliases: ['woody', 'ағашты'] },
      { value: 'oriental', label: 'Восточные', aliases: ['oriental', 'amber', 'шығыстық'] },
      { value: 'fresh', label: 'Свежие', aliases: ['fresh', 'балғын'] },
      { value: 'spicy', label: 'Пряные', aliases: ['spicy', 'дәмдеуішті'] },
    ],
    intensity_options: [
      { value: 'light', label: 'Легкий', aliases: ['light', 'жеңіл'] },
      { value: 'medium', label: 'Средний', aliases: ['medium', 'орташа'] },
      { value: 'strong', label: 'Интенсивный', aliases: ['strong', 'intense', 'қанық'] },
    ],
  },
  kk: {
    steps: [
      { id: 1, key: 'skin_type', title: 'Тері түрі', description: 'Теріңіздің түрін таңдаңыз.', optional: false },
      { id: 2, key: 'goals', title: 'Күтім мақсаттары', description: 'Ең алдымен нені жақсартқыңыз келеді?', optional: false },
      { id: 3, key: 'avoid_flags', title: 'Болдырмау', description: 'Құрамында болмағанын қалайтын ингредиенттер мен санаттар.', optional: true },
      { id: 4, key: 'budget', title: 'Бюджет', description: 'Ұсыныстарға ыңғайлы баға диапазоны.', optional: true },
      { id: 5, key: 'hair_profile', title: 'Шаш', description: 'Шаш күтіміне қатысты негізгі қалаулар.', optional: true },
      { id: 6, key: 'makeup_profile', title: 'Макияж', description: 'Жабын мен макияж бойынша қалаулар.', optional: true },
      { id: 7, key: 'fragrance_profile', title: 'Хош иіс', description: 'Ұнайтын ноталар мен хош иіс қарқындылығы.', optional: true },
    ],
    skin_types: [
      { value: 'oily', label: 'Майлы', aliases: ['oily', 'жирная'] },
      { value: 'combination', label: 'Аралас', aliases: ['combination', 'комбинированная'] },
      { value: 'dry', label: 'Құрғақ', aliases: ['dry', 'сухая'] },
      { value: 'normal', label: 'Қалыпты', aliases: ['normal', 'нормальная'] },
      { value: 'sensitive', label: 'Сезімтал', aliases: ['sensitive', 'чувствительная'] },
    ],
    goals: [
      { value: 'hydration', label: 'Ылғалдандыру', aliases: ['moisturizing', 'hydration', 'увлажнение'] },
      { value: 'anti_aging', label: 'Қартаюға қарсы күтім', aliases: ['anti_age', 'aging', 'антивозрастной уход'] },
      { value: 'acne', label: 'Безеуге қарсы', aliases: ['blemishes', 'acne', 'против акне'] },
      { value: 'brightening', label: 'Жарқырау мен реңк', aliases: ['glow', 'brightening', 'сияние'] },
      { value: 'spf', label: 'SPF қорғаныс', aliases: ['sun_protection', 'spf', 'защита spf'] },
      { value: 'soothing', label: 'Тыныштандыру', aliases: ['sensitivity', 'calming', 'успокоение'] },
    ],
    avoid_flags: [
      { value: 'fragrance', label: 'Хош иіс', aliases: ['perfume', 'fragrance', 'отдушки'] },
      { value: 'alcohol', label: 'Спирт', aliases: ['alcohol'] },
      { value: 'essential_oils', label: 'Эфир майлары', aliases: ['essential oils', 'эфирные масла'] },
      { value: 'parabens', label: 'Парабендер', aliases: ['parabens', 'парабены'] },
      { value: 'silicones', label: 'Силикондар', aliases: ['silicones', 'силиконы'] },
      { value: 'gluten', label: 'Глютен', aliases: ['gluten'] },
    ],
    budget_options: [
      { value: 'low', label: '2 500 ₸ дейін', min: 500, max: 2500, currency: 'KZT' },
      { value: 'medium', label: '2 500 - 7 500 ₸', min: 2500, max: 7500, currency: 'KZT' },
      { value: 'high', label: '7 500 ₸ бастап', min: 7500, max: null, currency: 'KZT' },
    ],
    hair_types: [
      { value: 'straight', label: 'Тік', aliases: ['straight', 'прямые'] },
      { value: 'wavy', label: 'Толқынды', aliases: ['wavy', 'волнистые'] },
      { value: 'curly', label: 'Бұйра', aliases: ['curly', 'кудрявые'] },
      { value: 'coily', label: 'Афро', aliases: ['coily', 'афро'] },
    ],
    hair_concerns: [
      { value: 'hair_loss', label: 'Түсу', aliases: ['hair loss', 'выпадение'] },
      { value: 'repair', label: 'Қалпына келтіру', aliases: ['damage', 'split_ends', 'восстановление'] },
      { value: 'dryness', label: 'Құрғақтық', aliases: ['dryness', 'сухость'] },
      { value: 'oiliness', label: 'Майлылық', aliases: ['oiliness', 'жирность'] },
      { value: 'flakes', label: 'Қайызғақ', aliases: ['dandruff', 'перхоть'] },
      { value: 'volume', label: 'Көлем', aliases: ['volume', 'объем'] },
    ],
    coverage_options: [
      { value: 'light', label: 'Жеңіл', aliases: ['light', 'легкое'] },
      { value: 'medium', label: 'Орташа', aliases: ['medium', 'среднее'] },
      { value: 'full', label: 'Тығыз', aliases: ['full', 'full_coverage', 'плотное'] },
    ],
    fragrance_notes: [
      { value: 'citrus', label: 'Цитрус', aliases: ['citrus'] },
      { value: 'floral', label: 'Гүлді', aliases: ['floral', 'цветочные'] },
      { value: 'woody', label: 'Ағашты', aliases: ['woody', 'древесные'] },
      { value: 'oriental', label: 'Шығыстық', aliases: ['oriental', 'amber', 'восточные'] },
      { value: 'fresh', label: 'Балғын', aliases: ['fresh', 'свежие'] },
      { value: 'spicy', label: 'Дәмдеуішті', aliases: ['spicy', 'пряные'] },
    ],
    intensity_options: [
      { value: 'light', label: 'Жеңіл', aliases: ['light', 'легкий'] },
      { value: 'medium', label: 'Орташа', aliases: ['medium', 'средний'] },
      { value: 'strong', label: 'Қанық', aliases: ['strong', 'intense', 'интенсивный'] },
    ],
  },
  en: {
    steps: [
      { id: 1, key: 'skin_type', title: 'Skin type', description: 'Choose your skin type.', optional: false },
      { id: 2, key: 'goals', title: 'Care goals', description: 'What would you like to improve first?', optional: false },
      { id: 3, key: 'avoid_flags', title: 'Avoid', description: 'Ingredients and categories you prefer to avoid.', optional: true },
      { id: 4, key: 'budget', title: 'Budget', description: 'A comfortable price range for recommendations.', optional: true },
      { id: 5, key: 'hair_profile', title: 'Hair', description: 'Basic hair care preferences.', optional: true },
      { id: 6, key: 'makeup_profile', title: 'Makeup', description: 'Coverage and makeup preferences.', optional: true },
      { id: 7, key: 'fragrance_profile', title: 'Fragrance', description: 'Favorite notes and fragrance intensity.', optional: true },
    ],
    skin_types: [
      { value: 'oily', label: 'Oily', aliases: ['жирная', 'майлы'] },
      { value: 'combination', label: 'Combination', aliases: ['комбинированная', 'аралас'] },
      { value: 'dry', label: 'Dry', aliases: ['сухая', 'құрғақ'] },
      { value: 'normal', label: 'Normal', aliases: ['нормальная', 'қалыпты'] },
      { value: 'sensitive', label: 'Sensitive', aliases: ['чувствительная', 'сезімтал'] },
    ],
    goals: [
      { value: 'hydration', label: 'Hydration', aliases: ['увлажнение', 'ылғалдандыру'] },
      { value: 'anti_aging', label: 'Anti-aging care', aliases: ['anti_age', 'антивозрастной уход', 'қартаюға қарсы'] },
      { value: 'acne', label: 'Acne care', aliases: ['против акне', 'безеуге қарсы'] },
      { value: 'brightening', label: 'Glow and tone', aliases: ['сияние', 'жарқырау'] },
      { value: 'spf', label: 'SPF protection', aliases: ['защита spf', 'spf қорғаныс'] },
      { value: 'soothing', label: 'Soothing', aliases: ['успокоение', 'тыныштандыру'] },
    ],
    avoid_flags: [
      { value: 'fragrance', label: 'Fragrance', aliases: ['отдушки', 'хош иіс'] },
      { value: 'alcohol', label: 'Alcohol', aliases: ['спирт'] },
      { value: 'essential_oils', label: 'Essential oils', aliases: ['эфирные масла', 'эфир майлары'] },
      { value: 'parabens', label: 'Parabens', aliases: ['парабены', 'парабендер'] },
      { value: 'silicones', label: 'Silicones', aliases: ['силиконы', 'силикондар'] },
      { value: 'gluten', label: 'Gluten', aliases: ['глютен'] },
    ],
    budget_options: [
      { value: 'low', label: 'Up to 2,500 ₸', min: 500, max: 2500, currency: 'KZT' },
      { value: 'medium', label: '2,500 - 7,500 ₸', min: 2500, max: 7500, currency: 'KZT' },
      { value: 'high', label: 'From 7,500 ₸', min: 7500, max: null, currency: 'KZT' },
    ],
    hair_types: [
      { value: 'straight', label: 'Straight', aliases: ['прямые', 'тік'] },
      { value: 'wavy', label: 'Wavy', aliases: ['волнистые', 'толқынды'] },
      { value: 'curly', label: 'Curly', aliases: ['кудрявые', 'бұйра'] },
      { value: 'coily', label: 'Coily', aliases: ['афро'] },
    ],
    hair_concerns: [
      { value: 'hair_loss', label: 'Hair loss', aliases: ['выпадение', 'түсу'] },
      { value: 'repair', label: 'Repair', aliases: ['восстановление', 'қалпына келтіру'] },
      { value: 'dryness', label: 'Dryness', aliases: ['сухость', 'құрғақтық'] },
      { value: 'oiliness', label: 'Oiliness', aliases: ['жирность', 'майлылық'] },
      { value: 'flakes', label: 'Dandruff', aliases: ['перхоть', 'қайызғақ'] },
      { value: 'volume', label: 'Volume', aliases: ['объем', 'көлем'] },
    ],
    coverage_options: [
      { value: 'light', label: 'Light', aliases: ['легкое', 'жеңіл'] },
      { value: 'medium', label: 'Medium', aliases: ['среднее', 'орташа'] },
      { value: 'full', label: 'Full', aliases: ['плотное', 'тығыз', 'full_coverage'] },
    ],
    fragrance_notes: [
      { value: 'citrus', label: 'Citrus', aliases: ['цитрус'] },
      { value: 'floral', label: 'Floral', aliases: ['цветочные', 'гүлді'] },
      { value: 'woody', label: 'Woody', aliases: ['древесные', 'ағашты'] },
      { value: 'oriental', label: 'Oriental', aliases: ['восточные', 'шығыстық', 'amber'] },
      { value: 'fresh', label: 'Fresh', aliases: ['свежие', 'балғын'] },
      { value: 'spicy', label: 'Spicy', aliases: ['пряные', 'дәмдеуішті'] },
    ],
    intensity_options: [
      { value: 'light', label: 'Light', aliases: ['легкий', 'жеңіл'] },
      { value: 'medium', label: 'Medium', aliases: ['средний', 'орташа'] },
      { value: 'strong', label: 'Strong', aliases: ['интенсивный', 'қанық', 'intense'] },
    ],
  },
};

function cloneOption<T extends ProfileTaxonomyOption>(option: T): T {
  return {
    ...option,
    aliases: Array.isArray(option.aliases) ? [...option.aliases] : undefined,
  };
}

function cloneStep(step: ProfileTaxonomyStep): ProfileTaxonomyStep {
  return { ...step };
}

function cloneBudgetOption(option: ProfileTaxonomyBudgetOption): ProfileTaxonomyBudgetOption {
  return cloneOption(option);
}

export function getFallbackProfileTaxonomy(language: AppLanguage = 'ru'): ProfileTaxonomy {
  const source = profileTaxonomyByLanguage[language];
  return {
    steps: source.steps.map(cloneStep),
    skin_types: source.skin_types.map(cloneOption),
    goals: source.goals.map(cloneOption),
    avoid_flags: source.avoid_flags.map(cloneOption),
    budget_options: source.budget_options.map(cloneBudgetOption),
    hair_types: source.hair_types.map(cloneOption),
    hair_concerns: source.hair_concerns.map(cloneOption),
    coverage_options: source.coverage_options.map(cloneOption),
    fragrance_notes: source.fragrance_notes.map(cloneOption),
    intensity_options: source.intensity_options.map(cloneOption),
  };
}

const normalizeToken = (value: string): string => value.trim().toLowerCase();

const uniqueStrings = (values: string[]): string[] => Array.from(new Set(values));

const optionTokens = (option: ProfileTaxonomyOption): string[] =>
  uniqueStrings(
    [option.value, option.label, ...(option.aliases ?? [])]
      .filter((value) => typeof value === 'string' && value.trim().length > 0)
      .map(normalizeToken),
  );

export function resolveProfileTaxonomy(
  value?: Partial<ProfileTaxonomy> | null,
  language: AppLanguage = 'ru',
): ProfileTaxonomy {
  const fallback = getFallbackProfileTaxonomy(language);

  return {
    steps: Array.isArray(value?.steps) && value.steps.length > 0 ? value.steps : fallback.steps,
    skin_types: Array.isArray(value?.skin_types) && value.skin_types.length > 0 ? value.skin_types : fallback.skin_types,
    goals: Array.isArray(value?.goals) && value.goals.length > 0 ? value.goals : fallback.goals,
    avoid_flags:
      Array.isArray(value?.avoid_flags) && value.avoid_flags.length > 0
        ? value.avoid_flags
        : fallback.avoid_flags,
    budget_options:
      Array.isArray(value?.budget_options) && value.budget_options.length > 0
        ? value.budget_options
        : fallback.budget_options,
    hair_types: Array.isArray(value?.hair_types) && value.hair_types.length > 0 ? value.hair_types : fallback.hair_types,
    hair_concerns:
      Array.isArray(value?.hair_concerns) && value.hair_concerns.length > 0
        ? value.hair_concerns
        : fallback.hair_concerns,
    coverage_options:
      Array.isArray(value?.coverage_options) && value.coverage_options.length > 0
        ? value.coverage_options
        : fallback.coverage_options,
    fragrance_notes:
      Array.isArray(value?.fragrance_notes) && value.fragrance_notes.length > 0
        ? value.fragrance_notes
        : fallback.fragrance_notes,
    intensity_options:
      Array.isArray(value?.intensity_options) && value.intensity_options.length > 0
        ? value.intensity_options
        : fallback.intensity_options,
  };
}

export function getProfileOptionLabels(options: ProfileTaxonomyOption[]): string[] {
  return options.map((option) => option.label);
}

export function mapProfileSingleApiToLabel(
  options: ProfileTaxonomyOption[],
  value: unknown,
): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const normalizedValue = normalizeToken(value);
  const matched = options.find((option) => optionTokens(option).includes(normalizedValue));
  return matched?.label ?? null;
}

export function mapProfileMultiApiToLabels(
  options: ProfileTaxonomyOption[],
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const labels = value
    .map((item) => mapProfileSingleApiToLabel(options, item))
    .filter((item): item is string => Boolean(item));

  return uniqueStrings(labels);
}

export function mapProfileSingleLabelToApiValue(
  options: ProfileTaxonomyOption[],
  value: string | undefined,
  fallback: string,
): string {
  if (!value || value.trim().length === 0) {
    return fallback;
  }

  const normalizedValue = normalizeToken(value);
  const matched = options.find((option) => optionTokens(option).includes(normalizedValue));
  return matched?.value ?? fallback;
}

export function mapProfileLabelsToApiValues(
  options: ProfileTaxonomyOption[],
  values: string[] | undefined,
): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  const mapped = values
    .map((value) => {
      const normalizedValue = normalizeToken(String(value));
      const matched = options.find((option) => optionTokens(option).includes(normalizedValue));
      return matched?.value ?? null;
    })
    .filter((value): value is string => Boolean(value));

  return uniqueStrings(mapped);
}

export function mapBudgetMaxToApiValue(
  options: ProfileTaxonomyBudgetOption[],
  budgetMax?: number,
): string {
  if (typeof budgetMax === 'number' && Number.isFinite(budgetMax)) {
    const matched = options.find((option) => {
      const min = typeof option.min === 'number' ? option.min : null;
      const max = typeof option.max === 'number' ? option.max : null;
      if (min !== null && budgetMax < min) {
        return false;
      }
      if (max !== null && budgetMax > max) {
        return false;
      }
      return true;
    });

    if (matched?.value) {
      return matched.value;
    }
  }

  return 'medium';
}
