import type { AppLanguage } from '../../../shared/i18n/messages';

export type AdminNavKey =
  | 'overview'
  | 'metrics'
  | 'experiments'
  | 'audit'
  | 'products'
  | 'brands'
  | 'personalCampaigns'
  | 'catalogPromotions'
  | 'health';

type AdminCopy = {
  nav: Record<AdminNavKey, string>;
  shell: {
    staff: string;
    backToStore: string;
    search: string;
    stage: string;
    permissions: string;
    signOut: string;
  };
  common: {
    loading: string;
    retry: string;
    refresh: string;
    save: string;
    delete: string;
    cancel: string;
    back: string;
    next: string;
    create: string;
    edit: string;
    close: string;
    exportCsv: string;
    noData: string;
    all: string;
    yes: string;
    no: string;
    page: (page: number, total: number) => string;
    count: (count: number, noun: string) => string;
  };
  overview: {
    title: string;
    subtitle: string;
    errorTitle: string;
    emptyTitle: string;
    emptyDescription: string;
    refresh: string;
    trendTitle: string;
    recommendedActions: string;
    topOffers: string;
    topCategories: string;
    viewAll: string;
    campaign: string;
    type: string;
    cr: string;
    category: string;
    revenue: string;
    growth: string;
  };
  metrics: {
    title: string;
    subtitle: string;
    refreshed: string;
    exportDone: string;
    exportError: string;
    errorTitle: string;
    emptyTitle: string;
    emptyDescription: string;
    dailyActivity: string;
    revenueByChannel: string;
    repeatPurchases: string;
    offerFunnel: string;
    tierDistribution: string;
    segmentDistribution: string;
    missingSteps: string;
    recsByAlgo: string;
    campaignEfficiency: string;
    campaign: string;
    assignments: string;
    redemptions: string;
  };
  experiments: {
    title: string;
    subtitle: string;
    defaultName: (index: number) => string;
    defaultDescription: string;
    guardrailCtr: string;
    guardrailCr: string;
    loadError: string;
    errorTitle: string;
    loading: string;
    empty: string;
    name: string;
    status: string;
    traffic: string;
    started: string;
    variants: string;
    noVariants: string;
    guardrails: string;
  };
  audit: {
    title: string;
    records: (count: number) => string;
    loadError: string;
    errorTitle: string;
    loading: string;
    searchEntity: string;
    entityType: string;
    allTypes: string;
    dateFrom: string;
    dateTo: string;
    actor: string;
    action: string;
    entity: string;
    timestamp: string;
    noRows: string;
    show: string;
    rows: string;
    details: string;
    time: string;
  };
  health: {
    title: string;
    subtitle: string;
    checking: string;
    errorTitle: string;
    emptyTitle: string;
    healthySummary: (healthy: number, total: number) => string;
    healthyTotal: string;
    degraded: string;
    down: string;
    uptime: string;
    generatedAt: string;
    latency: string;
    lastCheck: string;
    services: string;
    status: Record<'ok' | 'degraded' | 'down', string>;
  };
  catalog: {
    products: string;
    brands: string;
    productCount: (count: number) => string;
    brandCount: (count: number) => string;
    createProduct: string;
    createBrand: string;
    searchProducts: string;
    searchBrands: string;
    allCategories: string;
    allBrands: string;
    photo: string;
    name: string;
    brand: string;
    category: string;
    type: string;
    price: string;
    stock: string;
    productsEmpty: string;
    brandsEmpty: string;
  };
  campaigns: {
    personalTitle: string;
    catalogTitle: string;
    personalSubtitle: string;
    catalogSubtitle: string;
    createCampaign: string;
    createPromotion: string;
    personalEmpty: string;
    catalogEmpty: string;
    all: string;
    active: string;
    paused: string;
    name: string;
    offers: string;
    status: string;
    priority: string;
    budget: string;
    weeklyBudget: string;
    spend: string;
    spent: string;
    period: string;
    scope: string;
    noOffers: string;
    noDiscount: string;
    noLimit: string;
    allProducts: string;
    productsScope: (count: number) => string;
    brandScope: (brand: string) => string;
    brandsScope: (count: number) => string;
    categoryScope: (category: string) => string;
    categoriesScope: (count: number) => string;
  };
};

export const adminCopy: Record<AppLanguage, AdminCopy> = {
  ru: {
    nav: {
      overview: 'Обзор',
      metrics: 'Метрики',
      experiments: 'Recs-эксперименты',
      audit: 'Аудит',
      products: 'Товары',
      brands: 'Бренды',
      personalCampaigns: 'Персональные кампании',
      catalogPromotions: 'Акции на каталог',
      health: 'Health',
    },
    shell: {
      staff: 'STAFF',
      backToStore: 'Вернуться в магазин',
      search: 'Поиск...',
      stage: 'STAGE',
      permissions: 'Все права',
      signOut: 'Выйти',
    },
    common: {
      loading: 'Загружаем...',
      retry: 'Повторить',
      refresh: 'Обновить',
      save: 'Сохранить',
      delete: 'Удалить',
      cancel: 'Отмена',
      back: 'Назад',
      next: 'Вперёд',
      create: 'Создать',
      edit: 'Редактировать',
      close: 'Закрыть',
      exportCsv: 'export.csv',
      noData: 'нет данных',
      all: 'Все',
      yes: 'Да',
      no: 'Нет',
      page: (page, total) => `Страница ${page} из ${total}`,
      count: (count, noun) => `${count.toLocaleString('ru-RU')} ${noun}`,
    },
    overview: {
      title: 'Обзор',
      subtitle: 'Ключевые показатели лояльности, офферов и рекомендаций.',
      errorTitle: 'Не удалось загрузить обзор',
      emptyTitle: 'Нет данных для обзора',
      emptyDescription: 'Попробуйте обновить страницу или проверьте backend.',
      refresh: 'Обновить',
      trendTitle: 'CTR / CR / Users (7д vs 30д)',
      recommendedActions: 'Рекомендуемые действия',
      topOffers: 'Лучшие офферы',
      topCategories: 'Топ категорий',
      viewAll: 'Все',
      campaign: 'Кампания',
      type: 'Тип',
      cr: 'CR',
      category: 'Категория',
      revenue: 'Выручка',
      growth: 'Рост',
    },
    metrics: {
      title: 'Метрики',
      subtitle: 'Операционные метрики кампаний, лояльности, рекомендаций и roadmap.',
      refreshed: 'Метрики обновлены',
      exportDone: 'CSV экспортирован',
      exportError: 'Не удалось экспортировать CSV.',
      errorTitle: 'Не удалось загрузить метрики',
      emptyTitle: 'Нет данных по метрикам',
      emptyDescription: 'Проверьте период или обновите данные.',
      dailyActivity: 'Дневная активность',
      revenueByChannel: 'Выручка по каналам',
      repeatPurchases: 'Повторные покупки',
      offerFunnel: 'Воронка офферов (7д/30д)',
      tierDistribution: 'Распределение по тиру лояльности',
      segmentDistribution: 'Распределение сегментов (30д)',
      missingSteps: 'Топ пропущенных шагов рутины (30д)',
      recsByAlgo: 'Рекомендации по алгоритмам (30д)',
      campaignEfficiency: 'Эффективность кампаний (30д)',
      campaign: 'Кампания',
      assignments: 'Назначения',
      redemptions: 'Погашения',
    },
    experiments: {
      title: 'Recs-эксперименты',
      subtitle: 'A/B-эксперименты рекомендательной системы',
      defaultName: (index) => `Эксперимент ${index}`,
      defaultDescription: 'Метрики эксперимента рекомендаций',
      guardrailCtr: 'CTR выше базовой версии',
      guardrailCr: 'Конверсия не ниже контрольной группы',
      loadError: 'Не удалось загрузить эксперименты рекомендаций. Попробуйте ещё раз.',
      errorTitle: 'Не удалось загрузить эксперименты',
      loading: 'Загружаем эксперименты...',
      empty: 'Эксперименты пока не найдены.',
      name: 'Название',
      status: 'Статус',
      traffic: 'Трафик',
      started: 'Запущен',
      variants: 'Варианты',
      noVariants: 'Данные по вариантам отсутствуют.',
      guardrails: 'Guardrails',
    },
    audit: {
      title: 'Журнал аудита',
      records: (count) => `${count.toLocaleString('ru-RU')} записей`,
      loadError: 'Не удалось загрузить журнал аудита. Попробуйте ещё раз.',
      errorTitle: 'Не удалось загрузить журнал аудита',
      loading: 'Загружаем журнал аудита...',
      searchEntity: 'Поиск по entity_id',
      entityType: 'Тип сущности',
      allTypes: 'Все типы',
      dateFrom: 'Дата от',
      dateTo: 'Дата до',
      actor: 'Actor',
      action: 'Action',
      entity: 'Entity',
      timestamp: 'Timestamp',
      noRows: 'По заданным фильтрам записей нет.',
      show: 'Показывать:',
      rows: 'записей',
      details: 'Details (JSON)',
      time: 'Time',
    },
    health: {
      title: 'Health',
      subtitle: 'Состояние backend-сервисов и инфраструктуры.',
      checking: 'Проверяем состояние...',
      errorTitle: 'Не удалось загрузить health-метрики',
      emptyTitle: 'Нет health-снимка',
      healthySummary: (healthy, total) => `Healthy ${healthy} of ${total} services`,
      healthyTotal: 'Healthy / Total',
      degraded: 'Degraded',
      down: 'Down',
      uptime: 'Uptime',
      generatedAt: 'Generated at',
      latency: 'Latency',
      lastCheck: 'Last check',
      services: 'Services',
      status: { ok: 'OK', degraded: 'Degraded', down: 'Down' },
    },
    catalog: {
      products: 'Товары',
      brands: 'Бренды',
      productCount: (count) => `${count.toLocaleString('ru-RU')} товаров`,
      brandCount: (count) => `${count.toLocaleString('ru-RU')} брендов`,
      createProduct: 'Создать товар',
      createBrand: 'Создать бренд',
      searchProducts: 'Поиск по названию, бренду, SKU...',
      searchBrands: 'Поиск по названию или slug...',
      allCategories: 'Все категории',
      allBrands: 'Все бренды',
      photo: 'Фото',
      name: 'Название',
      brand: 'Бренд',
      category: 'Категория',
      type: 'Тип',
      price: 'Цена',
      stock: 'На складе',
      productsEmpty: 'Товаров не найдено.',
      brandsEmpty: 'Брендов не найдено.',
    },
    campaigns: {
      personalTitle: 'Персональные кампании',
      catalogTitle: 'Акции на каталог',
      personalSubtitle: 'Правила выдачи индивидуальных офферов пользователям.',
      catalogSubtitle: 'Публичные скидки и бонусы для подходящих товаров каталога.',
      createCampaign: 'Создать кампанию',
      createPromotion: 'Создать акцию',
      personalEmpty: 'Кампаний нет. Создайте первую — она появится тут.',
      catalogEmpty: 'Акций нет. Создайте первую — она появится тут.',
      all: 'Все',
      active: 'Активные',
      paused: 'На паузе',
      name: 'Название',
      offers: 'Офферы',
      status: 'Статус',
      priority: 'Приоритет',
      budget: 'Бюджет',
      weeklyBudget: 'Недельный бюджет',
      spend: 'Расход',
      spent: 'потрачено:',
      period: 'Период',
      scope: 'На что',
      noOffers: '0 (нет офферов)',
      noDiscount: 'Нет скидки',
      noLimit: 'Без лимита',
      allProducts: 'Все товары',
      productsScope: (count) => `Товары: ${count}`,
      brandScope: (brand) => `Бренд: ${brand}`,
      brandsScope: (count) => `Бренды: ${count}`,
      categoryScope: (category) => `Категория: ${category}`,
      categoriesScope: (count) => `Категории: ${count}`,
    },
  },
  kk: {
    nav: {
      overview: 'Шолу',
      metrics: 'Метрикалар',
      experiments: 'Recs эксперименттері',
      audit: 'Аудит',
      products: 'Тауарлар',
      brands: 'Брендтер',
      personalCampaigns: 'Жеке кампаниялар',
      catalogPromotions: 'Каталог акциялары',
      health: 'Health',
    },
    shell: {
      staff: 'STAFF',
      backToStore: 'Дүкенге оралу',
      search: 'Іздеу...',
      stage: 'STAGE',
      permissions: 'Барлық құқықтар',
      signOut: 'Шығу',
    },
    common: {
      loading: 'Жүктелуде...',
      retry: 'Қайталау',
      refresh: 'Жаңарту',
      save: 'Сақтау',
      delete: 'Жою',
      cancel: 'Бас тарту',
      back: 'Артқа',
      next: 'Алға',
      create: 'Құру',
      edit: 'Өңдеу',
      close: 'Жабу',
      exportCsv: 'export.csv',
      noData: 'дерек жоқ',
      all: 'Барлығы',
      yes: 'Иә',
      no: 'Жоқ',
      page: (page, total) => `${page} / ${total} бет`,
      count: (count, noun) => `${count.toLocaleString('kk-KZ')} ${noun}`,
    },
    overview: {
      title: 'Шолу',
      subtitle: 'Лоялдылық, офферлер және ұсыныстар бойынша негізгі көрсеткіштер.',
      errorTitle: 'Шолуды жүктеу мүмкін болмады',
      emptyTitle: 'Шолу деректері жоқ',
      emptyDescription: 'Бетті жаңартып көріңіз немесе backend күйін тексеріңіз.',
      refresh: 'Жаңарту',
      trendTitle: 'CTR / CR / Users (7 күн vs 30 күн)',
      recommendedActions: 'Ұсынылатын әрекеттер',
      topOffers: 'Үздік офферлер',
      topCategories: 'Үздік санаттар',
      viewAll: 'Барлығы',
      campaign: 'Кампания',
      type: 'Тип',
      cr: 'CR',
      category: 'Санат',
      revenue: 'Түсім',
      growth: 'Өсу',
    },
    metrics: {
      title: 'Метрикалар',
      subtitle: 'Кампания, лоялдылық, ұсыныстар және roadmap операциялық метрикалары.',
      refreshed: 'Метрикалар жаңартылды',
      exportDone: 'CSV экспортталды',
      exportError: 'CSV экспорттау мүмкін болмады.',
      errorTitle: 'Метрикаларды жүктеу мүмкін болмады',
      emptyTitle: 'Метрика деректері жоқ',
      emptyDescription: 'Кезеңді тексеріңіз немесе деректерді жаңартыңыз.',
      dailyActivity: 'Күндік белсенділік',
      revenueByChannel: 'Арналар бойынша түсім',
      repeatPurchases: 'Қайта сатып алулар',
      offerFunnel: 'Оффер воронкасы (7 күн/30 күн)',
      tierDistribution: 'Лоялдылық деңгейлері',
      segmentDistribution: 'Сегменттер таралуы (30 күн)',
      missingSteps: 'Рутинаның жиі жетіспейтін қадамдары (30 күн)',
      recsByAlgo: 'Алгоритмдер бойынша ұсыныстар (30 күн)',
      campaignEfficiency: 'Кампания тиімділігі (30 күн)',
      campaign: 'Кампания',
      assignments: 'Тағайындаулар',
      redemptions: 'Қолданулар',
    },
    experiments: {
      title: 'Recs эксперименттері',
      subtitle: 'Ұсыныс жүйесінің A/B эксперименттері',
      defaultName: (index) => `Эксперимент ${index}`,
      defaultDescription: 'Ұсыныс экспериментінің метрикалары',
      guardrailCtr: 'CTR базалық нұсқадан жоғары',
      guardrailCr: 'Конверсия бақылау тобынан төмен емес',
      loadError: 'Ұсыныс эксперименттерін жүктеу мүмкін болмады. Қайталап көріңіз.',
      errorTitle: 'Эксперименттерді жүктеу мүмкін болмады',
      loading: 'Эксперименттер жүктелуде...',
      empty: 'Эксперименттер әлі табылмады.',
      name: 'Атауы',
      status: 'Статус',
      traffic: 'Трафик',
      started: 'Іске қосылған',
      variants: 'Нұсқалар',
      noVariants: 'Нұсқалар бойынша дерек жоқ.',
      guardrails: 'Guardrails',
    },
    audit: {
      title: 'Аудит журналы',
      records: (count) => `${count.toLocaleString('kk-KZ')} жазба`,
      loadError: 'Аудит журналын жүктеу мүмкін болмады. Қайталап көріңіз.',
      errorTitle: 'Аудит журналын жүктеу мүмкін болмады',
      loading: 'Аудит журналы жүктелуде...',
      searchEntity: 'entity_id бойынша іздеу',
      entityType: 'Сущность типі',
      allTypes: 'Барлық типтер',
      dateFrom: 'Бастапқы күн',
      dateTo: 'Соңғы күн',
      actor: 'Actor',
      action: 'Action',
      entity: 'Entity',
      timestamp: 'Timestamp',
      noRows: 'Берілген фильтрлер бойынша жазба жоқ.',
      show: 'Көрсету:',
      rows: 'жазба',
      details: 'Details (JSON)',
      time: 'Time',
    },
    health: {
      title: 'Health',
      subtitle: 'Backend сервистері мен инфрақұрылым күйі.',
      checking: 'Күй тексерілуде...',
      errorTitle: 'Health метрикаларын жүктеу мүмкін болмады',
      emptyTitle: 'Health снимогы жоқ',
      healthySummary: (healthy, total) => `${total} сервистің ${healthy} сау`,
      healthyTotal: 'Сау / Барлығы',
      degraded: 'Degraded',
      down: 'Down',
      uptime: 'Uptime',
      generatedAt: 'Generated at',
      latency: 'Latency',
      lastCheck: 'Last check',
      services: 'Сервистер',
      status: { ok: 'OK', degraded: 'Degraded', down: 'Down' },
    },
    catalog: {
      products: 'Тауарлар',
      brands: 'Брендтер',
      productCount: (count) => `${count.toLocaleString('kk-KZ')} тауар`,
      brandCount: (count) => `${count.toLocaleString('kk-KZ')} бренд`,
      createProduct: 'Тауар құру',
      createBrand: 'Бренд құру',
      searchProducts: 'Атауы, бренді немесе SKU бойынша іздеу...',
      searchBrands: 'Атауы немесе slug бойынша іздеу...',
      allCategories: 'Барлық санаттар',
      allBrands: 'Барлық брендтер',
      photo: 'Фото',
      name: 'Атауы',
      brand: 'Бренд',
      category: 'Санат',
      type: 'Тип',
      price: 'Баға',
      stock: 'Қоймада',
      productsEmpty: 'Тауарлар табылмады.',
      brandsEmpty: 'Брендтер табылмады.',
    },
    campaigns: {
      personalTitle: 'Жеке кампаниялар',
      catalogTitle: 'Каталог акциялары',
      personalSubtitle: 'Пайдаланушыларға жеке оффер беру ережелері.',
      catalogSubtitle: 'Каталогтағы сәйкес тауарларға арналған ашық жеңілдіктер мен бонустар.',
      createCampaign: 'Кампания құру',
      createPromotion: 'Акция құру',
      personalEmpty: 'Кампаниялар жоқ. Біріншісін құрыңыз — ол осында шығады.',
      catalogEmpty: 'Акциялар жоқ. Біріншісін құрыңыз — ол осында шығады.',
      all: 'Барлығы',
      active: 'Белсенді',
      paused: 'Паузада',
      name: 'Атауы',
      offers: 'Офферлер',
      status: 'Статус',
      priority: 'Приоритет',
      budget: 'Бюджет',
      weeklyBudget: 'Апталық бюджет',
      spend: 'Шығын',
      spent: 'жұмсалды:',
      period: 'Кезең',
      scope: 'Қайда қолданылады',
      noOffers: '0 (оффер жоқ)',
      noDiscount: 'Жеңілдік жоқ',
      noLimit: 'Лимит жоқ',
      allProducts: 'Барлық тауарлар',
      productsScope: (count) => `Тауарлар: ${count}`,
      brandScope: (brand) => `Бренд: ${brand}`,
      brandsScope: (count) => `Брендтер: ${count}`,
      categoryScope: (category) => `Санат: ${category}`,
      categoriesScope: (count) => `Санаттар: ${count}`,
    },
  },
  en: {
    nav: {
      overview: 'Overview',
      metrics: 'Metrics',
      experiments: 'Recs Experiments',
      audit: 'Audit',
      products: 'Products',
      brands: 'Brands',
      personalCampaigns: 'Personal campaigns',
      catalogPromotions: 'Catalog promotions',
      health: 'Health',
    },
    shell: {
      staff: 'STAFF',
      backToStore: 'Back to store',
      search: 'Search...',
      stage: 'STAGE',
      permissions: 'All permissions',
      signOut: 'Sign out',
    },
    common: {
      loading: 'Loading...',
      retry: 'Retry',
      refresh: 'Refresh',
      save: 'Save',
      delete: 'Delete',
      cancel: 'Cancel',
      back: 'Back',
      next: 'Next',
      create: 'Create',
      edit: 'Edit',
      close: 'Close',
      exportCsv: 'export.csv',
      noData: 'no data',
      all: 'All',
      yes: 'Yes',
      no: 'No',
      page: (page, total) => `Page ${page} of ${total}`,
      count: (count, noun) => `${count.toLocaleString('en-US')} ${noun}`,
    },
    overview: {
      title: 'Overview',
      subtitle: 'Core loyalty, offer, and recommendation indicators.',
      errorTitle: 'Could not load overview',
      emptyTitle: 'No overview data',
      emptyDescription: 'Try refreshing the page or checking the backend.',
      refresh: 'Refresh',
      trendTitle: 'CTR / CR / Users (7d vs 30d)',
      recommendedActions: 'Recommended actions',
      topOffers: 'Top offers',
      topCategories: 'Top categories',
      viewAll: 'All',
      campaign: 'Campaign',
      type: 'Type',
      cr: 'CR',
      category: 'Category',
      revenue: 'Revenue',
      growth: 'Growth',
    },
    metrics: {
      title: 'Metrics',
      subtitle: 'Operational metrics for campaigns, loyalty, recommendations, and roadmap.',
      refreshed: 'Metrics refreshed',
      exportDone: 'CSV exported',
      exportError: 'Could not export CSV.',
      errorTitle: 'Could not load metrics',
      emptyTitle: 'No metrics data',
      emptyDescription: 'Check the period or refresh the data.',
      dailyActivity: 'Daily activity',
      revenueByChannel: 'Revenue by channel',
      repeatPurchases: 'Repeat purchases',
      offerFunnel: 'Offer funnel (7d/30d)',
      tierDistribution: 'Loyalty tier distribution',
      segmentDistribution: 'Segment distribution (30d)',
      missingSteps: 'Top missing routine steps (30d)',
      recsByAlgo: 'Recommendations by algorithm (30d)',
      campaignEfficiency: 'Campaign efficiency (30d)',
      campaign: 'Campaign',
      assignments: 'Assignments',
      redemptions: 'Redemptions',
    },
    experiments: {
      title: 'Recs Experiments',
      subtitle: 'A/B experiments for the recommendation system',
      defaultName: (index) => `Experiment ${index}`,
      defaultDescription: 'Recommendation experiment metrics',
      guardrailCtr: 'CTR above the baseline version',
      guardrailCr: 'Conversion is not below the control group',
      loadError: 'Could not load recommendation experiments. Try again.',
      errorTitle: 'Could not load experiments',
      loading: 'Loading experiments...',
      empty: 'No experiments found yet.',
      name: 'Name',
      status: 'Status',
      traffic: 'Traffic',
      started: 'Started',
      variants: 'Variants',
      noVariants: 'No variant data available.',
      guardrails: 'Guardrails',
    },
    audit: {
      title: 'Audit Log',
      records: (count) => `${count.toLocaleString('en-US')} records`,
      loadError: 'Could not load the audit log. Try again.',
      errorTitle: 'Could not load audit log',
      loading: 'Loading audit log...',
      searchEntity: 'Search by entity_id',
      entityType: 'Entity type',
      allTypes: 'All types',
      dateFrom: 'Date from',
      dateTo: 'Date to',
      actor: 'Actor',
      action: 'Action',
      entity: 'Entity',
      timestamp: 'Timestamp',
      noRows: 'No records match the selected filters.',
      show: 'Show:',
      rows: 'records',
      details: 'Details (JSON)',
      time: 'Time',
    },
    health: {
      title: 'Health',
      subtitle: 'Backend service and infrastructure status.',
      checking: 'Checking status...',
      errorTitle: 'Could not load health metrics',
      emptyTitle: 'No health snapshot',
      healthySummary: (healthy, total) => `Healthy ${healthy} of ${total} services`,
      healthyTotal: 'Healthy / Total',
      degraded: 'Degraded',
      down: 'Down',
      uptime: 'Uptime',
      generatedAt: 'Generated at',
      latency: 'Latency',
      lastCheck: 'Last check',
      services: 'Services',
      status: { ok: 'OK', degraded: 'Degraded', down: 'Down' },
    },
    catalog: {
      products: 'Products',
      brands: 'Brands',
      productCount: (count) => `${count.toLocaleString('en-US')} products`,
      brandCount: (count) => `${count.toLocaleString('en-US')} brands`,
      createProduct: 'Create product',
      createBrand: 'Create brand',
      searchProducts: 'Search by name, brand, SKU...',
      searchBrands: 'Search by name or slug...',
      allCategories: 'All categories',
      allBrands: 'All brands',
      photo: 'Photo',
      name: 'Name',
      brand: 'Brand',
      category: 'Category',
      type: 'Type',
      price: 'Price',
      stock: 'In stock',
      productsEmpty: 'No products found.',
      brandsEmpty: 'No brands found.',
    },
    campaigns: {
      personalTitle: 'Personal campaigns',
      catalogTitle: 'Catalog promotions',
      personalSubtitle: 'Rules for assigning individual offers to users.',
      catalogSubtitle: 'Public discounts and bonuses for eligible catalog products.',
      createCampaign: 'Create campaign',
      createPromotion: 'Create promotion',
      personalEmpty: 'No campaigns yet. Create the first one and it will appear here.',
      catalogEmpty: 'No promotions yet. Create the first one and it will appear here.',
      all: 'All',
      active: 'Active',
      paused: 'Paused',
      name: 'Name',
      offers: 'Offers',
      status: 'Status',
      priority: 'Priority',
      budget: 'Budget',
      weeklyBudget: 'Weekly budget',
      spend: 'Spend',
      spent: 'spent:',
      period: 'Period',
      scope: 'Scope',
      noOffers: '0 (no offers)',
      noDiscount: 'No discount',
      noLimit: 'No limit',
      allProducts: 'All products',
      productsScope: (count) => `Products: ${count}`,
      brandScope: (brand) => `Brand: ${brand}`,
      brandsScope: (count) => `Brands: ${count}`,
      categoryScope: (category) => `Category: ${category}`,
      categoriesScope: (count) => `Categories: ${count}`,
    },
  },
};

export const adminLocale: Record<AppLanguage, string> = {
  ru: 'ru-RU',
  kk: 'kk-KZ',
  en: 'en-US',
};

export const formatAdminDateTime = (value: string | null | undefined, language: AppLanguage): string => {
  if (!value) return 'n/a';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'n/a';
  return date.toLocaleString(adminLocale[language]);
};

export const formatAdminNumber = (value: number | null | undefined, language: AppLanguage): string =>
  value === null || value === undefined
    ? adminCopy[language].common.noData
    : Math.round(value).toLocaleString(adminLocale[language]);

export const formatAdminMoney = (value: number | null | undefined, language: AppLanguage): string =>
  value === null || value === undefined
    ? adminCopy[language].common.noData
    : `${Math.round(value).toLocaleString(adminLocale[language])} ₸`;

export const formatAdminPercent = (ratio: number | null | undefined, language: AppLanguage): string =>
  ratio === null || ratio === undefined
    ? adminCopy[language].common.noData
    : `${(ratio * 100).toFixed(2)}%`;
