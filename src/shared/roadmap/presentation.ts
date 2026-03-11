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

export const ROADMAP_CATEGORY_OPTIONS: RoadmapCategoryOption[] = [
  { id: 'skincare', label: 'Уход за кожей', icon: '✨' },
  { id: 'makeup', label: 'Макияж', icon: '💄' },
  { id: 'haircare', label: 'Уход за волосами', icon: '💇' },
  { id: 'fragrance', label: 'Парфюмерия', icon: '🌸' },
];

export const ROADMAP_CATEGORY_LABELS = ROADMAP_CATEGORY_OPTIONS.reduce<Record<string, string>>(
  (acc, category) => {
    acc[category.id] = category.label;
    return acc;
  },
  {},
);

const STEP_TEXT_BY_TYPE: Record<string, { title: string; description: string }> = {
  cleanser: {
    title: 'Очищение',
    description: 'Начните с мягкого очищающего средства для вашего типа кожи.',
  },
  toner: {
    title: 'Тонизирование',
    description: 'Восстановите баланс кожи с помощью подходящего тоника.',
  },
  serum: {
    title: 'Сыворотка',
    description: 'Добавьте активный этап для решения конкретной задачи кожи.',
  },
  moisturizer: {
    title: 'Увлажнение',
    description: 'Закрепите уход увлажняющим средством для поддержания барьера кожи.',
  },
  spf: {
    title: 'Защита SPF',
    description: 'Завершите дневной уход средством с солнцезащитой.',
  },
  shampoo: {
    title: 'Очищение кожи головы',
    description: 'Выберите шампунь по типу кожи головы и частоте мытья.',
  },
  conditioner: {
    title: 'Кондиционирование',
    description: 'Используйте кондиционер для защиты длины и блеска волос.',
  },
  hair_mask: {
    title: 'Маска для волос',
    description: 'Добавьте еженедельный восстановительный этап ухода.',
  },
  hair_oil: {
    title: 'Масло для волос',
    description: 'Используйте масло для защиты и гладкости длины.',
  },
  scalp_serum: {
    title: 'Сыворотка для кожи головы',
    description: 'Добавьте целевой уход для кожи головы и корней.',
  },
  foundation: {
    title: 'Тон',
    description: 'Подберите основу, подходящую по тону и типу кожи.',
  },
  eyeshadow: {
    title: 'Акцент для глаз',
    description: 'Добавьте продукт для акцента и завершения макияжа.',
  },
  lipstick: {
    title: 'Акцент для губ',
    description: 'Завершите образ подходящим оттенком для губ.',
  },
  perfume: {
    title: 'Парфюмерная база',
    description: 'Подберите аромат, который соответствует вашим предпочтениям.',
  },
};

const STEP_META_BY_TYPE: Record<string, RoadmapStepMeta> = {
  cleanser: {
    points: 120,
    why: 'Базовый шаг для стабильной рутины.',
    improves: 'Очищение и подготовка кожи.',
    benefit: 'Первые изменения обычно заметны в течение недели.',
  },
  toner: {
    points: 90,
    why: 'Помогает выровнять баланс после очищения.',
    improves: 'Комфорт и текстура кожи.',
    benefit: 'Кожа выглядит более ровной и спокойной.',
  },
  serum: {
    points: 140,
    why: 'Целевой шаг под вашу текущую задачу.',
    improves: 'Выраженность ключевой проблемы.',
    benefit: 'Результат обычно проявляется через 2–4 недели.',
  },
  moisturizer: {
    points: 130,
    why: 'Закрепляет эффект предыдущих шагов.',
    improves: 'Защитный барьер и эластичность.',
    benefit: 'Меньше сухости и дискомфорта.',
  },
  spf: {
    points: 190,
    why: 'Ключевой этап дневной защиты кожи.',
    improves: 'Профилактику пигментации и фотостарения.',
    benefit: 'Долгосрочная защита результата ухода.',
  },
  shampoo: {
    points: 100,
    why: 'Основа регулярного ухода за волосами.',
    improves: 'Состояние кожи головы.',
    benefit: 'Чистота и комфорт между мытьем.',
  },
  conditioner: {
    points: 110,
    why: 'Нужен для защиты длины после очищения.',
    improves: 'Мягкость и управляемость волос.',
    benefit: 'Меньше спутывания и ломкости.',
  },
  hair_mask: {
    points: 150,
    why: 'Усиливает базовый уход раз в неделю.',
    improves: 'Плотность и восстановление длины.',
    benefit: 'Волосы выглядят более гладкими.',
  },
  hair_oil: {
    points: 130,
    why: 'Защищает длину от пересушивания.',
    improves: 'Гладкость и блеск.',
    benefit: 'Меньше пушения и сухости кончиков.',
  },
  scalp_serum: {
    points: 145,
    why: 'Целевой уход за кожей головы.',
    improves: 'Баланс и комфорт кожи головы.',
    benefit: 'Повышает эффективность всей рутины.',
  },
};

export const DEFAULT_ROADMAP_STEP_META: RoadmapStepMeta = {
  points: 100,
  why: 'Персональный шаг подобран на основе ваших данных.',
  improves: 'Результат вашей рутины.',
  benefit: 'Улучшения обычно заметны при регулярном использовании.',
};

export function formatRoadmapProductType(productType: string): string {
  const prepared = productType.replace(/_/g, ' ').trim();
  if (!prepared) {
    return 'Шаг ухода';
  }

  return prepared[0].toUpperCase() + prepared.slice(1);
}

export function getRoadmapStepPresentation(
  productType: string,
): { title: string; description: string } {
  return (
    STEP_TEXT_BY_TYPE[productType] ?? {
      title: formatRoadmapProductType(productType),
      description: 'Персональный шаг, добавленный в ваш roadmap.',
    }
  );
}

export function getRoadmapStepMeta(productType: string): RoadmapStepMeta {
  return STEP_META_BY_TYPE[productType] ?? DEFAULT_ROADMAP_STEP_META;
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
