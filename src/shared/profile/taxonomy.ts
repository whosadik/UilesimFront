import type {
  ProfileTaxonomy,
  ProfileTaxonomyBudgetOption,
  ProfileTaxonomyOption,
  ProfileTaxonomyStep,
} from '../api/me';

const FALLBACK_STEPS: ProfileTaxonomyStep[] = [
  { id: 1, key: 'skin_type', title: 'Тип кожи', description: 'Выберите ваш тип кожи.', optional: false },
  { id: 2, key: 'goals', title: 'Цели', description: 'Что вы хотите улучшить в первую очередь?', optional: false },
  { id: 3, key: 'avoid_flags', title: 'Избегать', description: 'Ингредиенты и категории, которых вы хотите избегать.', optional: true },
  { id: 4, key: 'budget', title: 'Бюджет', description: 'Комфортный ценовой диапазон для рекомендаций.', optional: true },
  { id: 5, key: 'hair_profile', title: 'Волосы', description: 'Базовые предпочтения по уходу за волосами.', optional: true },
  { id: 6, key: 'makeup_profile', title: 'Макияж', description: 'Предпочтения по покрытию и макияжу.', optional: true },
  { id: 7, key: 'fragrance_profile', title: 'Парфюм', description: 'Любимые ноты и интенсивность аромата.', optional: true },
];

const FALLBACK_SKIN_TYPES: ProfileTaxonomyOption[] = [
  { value: 'oily', label: 'Жирная', aliases: ['жирная'] },
  { value: 'combination', label: 'Комбинированная', aliases: ['комбинированная'] },
  { value: 'dry', label: 'Сухая', aliases: ['сухая'] },
  { value: 'normal', label: 'Нормальная', aliases: ['нормальная'] },
  { value: 'sensitive', label: 'Чувствительная', aliases: ['чувствительная'] },
];

const FALLBACK_GOALS: ProfileTaxonomyOption[] = [
  { value: 'hydration', label: 'Увлажнение', aliases: ['moisturizing', 'увлажнение'] },
  { value: 'anti_aging', label: 'Антивозрастной уход', aliases: ['anti_age', 'aging', 'анти-эйдж'] },
  { value: 'acne', label: 'Против акне', aliases: ['blemishes', 'cleansing', 'очищение'] },
  { value: 'brightening', label: 'Сияние и тон', aliases: ['glow', 'even_tone', 'сияние', 'выравнивание тона'] },
  { value: 'spf', label: 'Защита SPF', aliases: ['sun_protection', 'защита spf'] },
  { value: 'soothing', label: 'Успокоение', aliases: ['sensitivity', 'успокоение'] },
];

const FALLBACK_AVOID_FLAGS: ProfileTaxonomyOption[] = [
  { value: 'fragrance', label: 'Отдушки', aliases: ['perfume', 'отдушки'] },
  { value: 'alcohol', label: 'Спирт', aliases: ['спирт'] },
  { value: 'essential_oils', label: 'Эфирные масла', aliases: ['essential oils', 'эфирные масла'] },
  { value: 'parabens', label: 'Парабены', aliases: ['парабены'] },
  { value: 'silicones', label: 'Силиконы', aliases: ['силиконы'] },
  { value: 'gluten', label: 'Глютен', aliases: ['глютен'] },
];

const FALLBACK_BUDGET_OPTIONS: ProfileTaxonomyBudgetOption[] = [
  { value: 'low', label: 'До 2 500 ₸', min: 500, max: 2500, currency: 'KZT' },
  { value: 'medium', label: '2 500 – 7 500 ₸', min: 2500, max: 7500, currency: 'KZT' },
  { value: 'high', label: 'От 7 500 ₸', min: 7500, max: null, currency: 'KZT' },
];

const FALLBACK_HAIR_TYPES: ProfileTaxonomyOption[] = [
  { value: 'straight', label: 'Прямые' },
  { value: 'wavy', label: 'Волнистые' },
  { value: 'curly', label: 'Кудрявые' },
  { value: 'coily', label: 'Афро', aliases: ['coils'] },
];

const FALLBACK_HAIR_CONCERNS: ProfileTaxonomyOption[] = [
  { value: 'hair_loss', label: 'Выпадение' },
  { value: 'repair', label: 'Секущиеся концы', aliases: ['damage', 'split_ends'] },
  { value: 'dryness', label: 'Сухость' },
  { value: 'oiliness', label: 'Жирность' },
  { value: 'flakes', label: 'Перхоть', aliases: ['dandruff'] },
  { value: 'volume', label: 'Объем' },
];

const FALLBACK_COVERAGE_OPTIONS: ProfileTaxonomyOption[] = [
  { value: 'light', label: 'Легкое' },
  { value: 'medium', label: 'Среднее' },
  { value: 'full', label: 'Плотное', aliases: ['full_coverage'] },
];

const FALLBACK_FRAGRANCE_NOTES: ProfileTaxonomyOption[] = [
  { value: 'citrus', label: 'Цитрус', aliases: ['citrusy'] },
  { value: 'floral', label: 'Цветочные', aliases: ['flowers'] },
  { value: 'woody', label: 'Древесные', aliases: ['wood'] },
  { value: 'oriental', label: 'Восточные', aliases: ['amber'] },
  { value: 'fresh', label: 'Свежие', aliases: ['clean'] },
  { value: 'spicy', label: 'Пряные' },
];

const FALLBACK_INTENSITY_OPTIONS: ProfileTaxonomyOption[] = [
  { value: 'light', label: 'Легкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'strong', label: 'Интенсивный', aliases: ['intense'] },
];

export const FALLBACK_PROFILE_TAXONOMY: ProfileTaxonomy = {
  steps: FALLBACK_STEPS,
  skin_types: FALLBACK_SKIN_TYPES,
  goals: FALLBACK_GOALS,
  avoid_flags: FALLBACK_AVOID_FLAGS,
  budget_options: FALLBACK_BUDGET_OPTIONS,
  hair_types: FALLBACK_HAIR_TYPES,
  hair_concerns: FALLBACK_HAIR_CONCERNS,
  coverage_options: FALLBACK_COVERAGE_OPTIONS,
  fragrance_notes: FALLBACK_FRAGRANCE_NOTES,
  intensity_options: FALLBACK_INTENSITY_OPTIONS,
};

const normalizeToken = (value: string): string => value.trim().toLowerCase();

const uniqueStrings = (values: string[]): string[] => Array.from(new Set(values));

const optionTokens = (option: ProfileTaxonomyOption): string[] =>
  uniqueStrings(
    [option.value, option.label, ...(option.aliases ?? [])]
      .filter((value) => typeof value === 'string' && value.trim().length > 0)
      .map(normalizeToken),
  );

export function resolveProfileTaxonomy(value?: Partial<ProfileTaxonomy> | null): ProfileTaxonomy {
  return {
    steps: Array.isArray(value?.steps) && value.steps.length > 0 ? value.steps : FALLBACK_PROFILE_TAXONOMY.steps,
    skin_types:
      Array.isArray(value?.skin_types) && value.skin_types.length > 0
        ? value.skin_types
        : FALLBACK_PROFILE_TAXONOMY.skin_types,
    goals: Array.isArray(value?.goals) && value.goals.length > 0 ? value.goals : FALLBACK_PROFILE_TAXONOMY.goals,
    avoid_flags:
      Array.isArray(value?.avoid_flags) && value.avoid_flags.length > 0
        ? value.avoid_flags
        : FALLBACK_PROFILE_TAXONOMY.avoid_flags,
    budget_options:
      Array.isArray(value?.budget_options) && value.budget_options.length > 0
        ? value.budget_options
        : FALLBACK_PROFILE_TAXONOMY.budget_options,
    hair_types:
      Array.isArray(value?.hair_types) && value.hair_types.length > 0
        ? value.hair_types
        : FALLBACK_PROFILE_TAXONOMY.hair_types,
    hair_concerns:
      Array.isArray(value?.hair_concerns) && value.hair_concerns.length > 0
        ? value.hair_concerns
        : FALLBACK_PROFILE_TAXONOMY.hair_concerns,
    coverage_options:
      Array.isArray(value?.coverage_options) && value.coverage_options.length > 0
        ? value.coverage_options
        : FALLBACK_PROFILE_TAXONOMY.coverage_options,
    fragrance_notes:
      Array.isArray(value?.fragrance_notes) && value.fragrance_notes.length > 0
        ? value.fragrance_notes
        : FALLBACK_PROFILE_TAXONOMY.fragrance_notes,
    intensity_options:
      Array.isArray(value?.intensity_options) && value.intensity_options.length > 0
        ? value.intensity_options
        : FALLBACK_PROFILE_TAXONOMY.intensity_options,
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
