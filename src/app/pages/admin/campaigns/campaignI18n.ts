import type { OfferType, TargetScope } from '../../../../shared/api/adminOffers';
import type { AppLanguage } from '../../../../shared/i18n/messages';

type BenefitCopy = Record<OfferType, { label: string; description: string }>;
type ScopeCopy = Record<TargetScope, { label: string; hint: string }>;

type CampaignDetailCopy = {
  common: {
    save: string;
    saving: string;
    publish: string;
    cancel: string;
    apply: string;
    clearSelection: string;
    close: string;
    remove: string;
    edit: string;
    delete: string;
    loading: string;
    selected: (count: number) => string;
    active: string;
    inactive: string;
    draft: string;
    status: string;
    name: string;
    startDate: string;
    endDate: string;
    emptyDateHint: string;
    weeklyBudgetKzt: string;
    promoText: string;
    banner: string;
    uploadFile: string;
    uploading: string;
    clear: string;
    bannerAlt: string;
    bannerRequirements: string;
    saveBeforeCampaignBanner: string;
    saveBeforePromotionBanner: string;
    bannerUploaded: string;
    saveCampaignFirst: string;
    savePromotionFirst: string;
    campaignCreated: string;
    promotionCreated: string;
    saved: string;
    campaignPublished: string;
    promotionPublished: string;
    campaignLoadError: string;
    promotionLoadError: string;
    saveError: string;
    campaignPublishError: string;
    promotionPublishError: string;
    invalidPromotionId: string;
    id: (id: string | number) => string;
    campaignTitle: (id: string | number) => string;
    promotionTitle: (id: string | number) => string;
  };
  validation: {
    campaignNameRequired: string;
    promotionNameRequired: string;
    budgetNumber: string;
    priorityNumber: string;
    endBeforeStart: string;
    offerValueRequired: string;
    discountRange: string;
    brandScopeRequired: string;
    productScopeRequired: string;
    categoryScopeRequired: string;
    productTypeScopeRequired: string;
    offerNameRequired: string;
    offerBrandRequired: string;
  };
  personal: {
    newTitle: string;
    introTitle: string;
    introPrefix: string;
    introAfterCode: string;
    introStrong: string;
    introSuffix: string;
    mainTitle: string;
    namePlaceholder: string;
    internalNameHint: string;
    internalNameHintAfter: string;
    priority: string;
    priorityHint: string;
    datesBudgetTitle: string;
    budgetHint: string;
    creativeTitle: string;
    creativeHint: string;
    promoPlaceholder: string;
    saveBeforeOffers: string;
  };
  catalog: {
    newTitle: string;
    introTitle: string;
    introPrefix: string;
    introStrong: string;
    introSuffix: string;
    mainTitle: string;
    namePlaceholder: string;
    scopeTitle: string;
    scopeHint: string;
    categories: string;
    productTypes: string;
    brands: string;
    selectBrands: string;
    brandsEmpty: string;
    products: string;
    selectProducts: string;
    productsEmpty: string;
    buyerBenefitTitle: string;
    buyerBenefitHint: string;
    discountValueLabel: string;
    pointsValueLabel: string;
    giftValueLabel: string;
    discountHint: string;
    pointsHint: string;
    giftHint: string;
    minSpendLabel: string;
    minSpendHint: string;
    budgetStatusTitle: string;
    budgetStatusHint: string;
    budgetPlaceholder: string;
    budgetLimitHint: string;
    statusHint: string;
    creativeTitle: string;
    creativeHint: string;
    promoPlaceholder: string;
  };
  offers: {
    title: string;
    subtitle: string;
    add: string;
    empty: string;
    tableName: string;
    tableType: string;
    tableValue: string;
    tableScope: string;
    tableCost: string;
    tableStatus: string;
    editTitle: string;
    newTitle: string;
    namePlaceholder: string;
    type: string;
    discountValue: string;
    multiplierValue: string;
    giftValue: string;
    scope: string;
    scopeHint: string;
    brands: string;
    selectBrands: string;
    brandsEmpty: string;
    brandHint: string;
    products: string;
    selectProducts: string;
    productsEmpty: string;
    productsHint: string;
    categories: string;
    productTypes: string;
    estimatedCost: string;
    estimatedCostHint: string;
    cooldown: string;
    cooldownHint: string;
    expires: string;
    expiresHint: string;
    minSpend90d: string;
    minSpend90dHint: string;
    active: string;
    created: string;
    updated: string;
    deleted: string;
    deleteConfirm: (name: string) => string;
  };
  picker: {
    brandsTitle: string;
    productsTitle: string;
    searchBrand: string;
    searchProduct: string;
    loadBrandsError: string;
    loadProductsError: string;
    noBrands: string;
    noProducts: string;
    productCount: (count: number) => string;
    noBrand: string;
    noCategory: string;
    noPrice: string;
  };
  benefits: BenefitCopy;
  offerTypes: Record<OfferType, string>;
  targetScopes: ScopeCopy;
  categories: Record<string, string>;
  productTypes: Record<string, string>;
};

export const campaignCopy: Record<AppLanguage, CampaignDetailCopy> = {
  ru: {
    common: {
      save: 'Сохранить',
      saving: 'Сохраняю...',
      publish: 'Запустить',
      cancel: 'Отмена',
      apply: 'Применить',
      clearSelection: 'Очистить выбор',
      close: 'Закрыть',
      remove: 'Убрать',
      edit: 'Редактировать',
      delete: 'Удалить',
      loading: 'Загружаем...',
      selected: (count) => `Выбрано: ${count}`,
      active: 'Активна',
      inactive: 'Неактивна',
      draft: 'Черновик',
      status: 'Статус',
      name: 'Название',
      startDate: 'Дата начала',
      endDate: 'Дата окончания',
      emptyDateHint: 'Пусто = без ограничения.',
      weeklyBudgetKzt: 'Недельный бюджет (₸)',
      promoText: 'Текст промо',
      banner: 'Баннер',
      uploadFile: 'Загрузить файл',
      uploading: 'Загружаем...',
      clear: 'Очистить',
      bannerAlt: 'Баннер',
      bannerRequirements: 'PNG / JPEG / WebP / GIF, до 5 МБ.',
      saveBeforeCampaignBanner: 'Сохраните кампанию, чтобы загрузить файл.',
      saveBeforePromotionBanner: 'Сохраните акцию, чтобы загрузить файл.',
      bannerUploaded: 'Баннер загружен.',
      saveCampaignFirst: 'Сначала сохраните кампанию.',
      savePromotionFirst: 'Сначала сохраните акцию.',
      campaignCreated: 'Кампания создана.',
      promotionCreated: 'Акция создана.',
      saved: 'Сохранено.',
      campaignPublished: 'Кампания запущена.',
      promotionPublished: 'Акция запущена.',
      campaignLoadError: 'Не удалось загрузить кампанию.',
      promotionLoadError: 'Не удалось загрузить акцию.',
      saveError: 'Не удалось сохранить.',
      campaignPublishError: 'Не удалось запустить кампанию.',
      promotionPublishError: 'Не удалось запустить акцию.',
      invalidPromotionId: 'Не удалось определить ID акции.',
      id: (id) => `ID: ${id}`,
      campaignTitle: (id) => `Кампания ${id}`,
      promotionTitle: (id) => `Акция ${id}`,
    },
    validation: {
      campaignNameRequired: 'Укажите название кампании.',
      promotionNameRequired: 'Укажите название акции.',
      budgetNumber: 'Бюджет должен быть числом.',
      priorityNumber: 'Приоритет должен быть числом.',
      endBeforeStart: 'Дата окончания раньше даты начала.',
      offerValueRequired: 'Укажите значение скидки / множителя.',
      discountRange: 'Скидка должна быть от 1 до 100%.',
      brandScopeRequired: 'Для scope «Бренд» выберите хотя бы один бренд.',
      productScopeRequired: 'Для scope «Конкретные товары» выберите хотя бы один товар.',
      categoryScopeRequired: 'Для scope «Категория» выберите хотя бы одну категорию.',
      productTypeScopeRequired: 'Для scope «Тип товара» выберите хотя бы один тип.',
      offerNameRequired: 'Укажите название оффера.',
      offerBrandRequired: 'Для scope «На бренд» укажите хотя бы один бренд.',
    },
    personal: {
      newTitle: 'Новая персональная кампания',
      introTitle: 'Как работает персональная кампания',
      introPrefix: 'Кампания участвует в индивидуальной выдаче офферов через',
      introAfterCode: 'Сама кампания задает',
      introStrong: 'бюджет, сроки и приоритет',
      introSuffix: 'Конкретные скидки, бонусы и их таргетинг живут в блоке «Офферы» ниже.',
      mainTitle: 'Основное',
      namePlaceholder: 'например, fragrance_crosssell',
      internalNameHint: 'Внутреннее имя. Системные имена',
      internalNameHintAfter: 'имеют приоритетный роутинг в алгоритме next-offer.',
      priority: 'Приоритет',
      priorityHint: 'Меньше число = выше приоритет среди кампаний.',
      datesBudgetTitle: 'Сроки и бюджет',
      budgetHint: 'Сбрасывается каждый понедельник.',
      creativeTitle: 'Креатив',
      creativeHint: 'Опционально. Используется для оформления карточки оффера в приложении.',
      promoPlaceholder: 'Выбираем для вас...',
      saveBeforeOffers: 'Сохраните кампанию, чтобы добавить офферы.',
    },
    catalog: {
      newTitle: 'Новая акция на каталог',
      introTitle: 'Как работает каталожная акция',
      introPrefix: 'Применяется ко всем покупателям, если корзина подходит под',
      introStrong: 'scope акции',
      introSuffix: 'Без персонализации и cooldown, просто общая выгода.',
      mainTitle: '1. Основное',
      namePlaceholder: 'например, Весна-2026',
      scopeTitle: '2. На что распространяется',
      scopeHint: 'Выберите, какие товары попадают под акцию. Если выбрать «Вся корзина», акция применится к любому заказу.',
      categories: 'Категории',
      productTypes: 'Типы товаров',
      brands: 'Бренды',
      selectBrands: 'Выбрать бренды',
      brandsEmpty: 'Бренды не выбраны',
      products: 'Товары',
      selectProducts: 'Выбрать товары',
      productsEmpty: 'Товары не выбраны',
      buyerBenefitTitle: '3. Что дает покупателю',
      buyerBenefitHint: 'Выберите тип выгоды и значение.',
      discountValueLabel: 'Размер скидки, %',
      pointsValueLabel: 'Множитель баллов (xN)',
      giftValueLabel: 'Описание подарка',
      discountHint: 'От 1 до 100%.',
      pointsHint: 'Например, 2 = x2 баллов за покупку.',
      giftHint: 'Краткое описание подарка. Деталь можно указать в тексте промо.',
      minSpendLabel: 'Мин. сумма покупок (₸)',
      minSpendHint: 'Сумма покупок пользователя за 90 дней, чтобы получить акцию. 0 = всем.',
      budgetStatusTitle: '4. Бюджет и статус',
      budgetStatusHint: 'Бюджет опциональный. Без бюджета акция работает без лимита.',
      budgetPlaceholder: 'оставьте пустым = без лимита',
      budgetLimitHint: 'Если указан, акция перестанет применяться при достижении лимита. Сброс каждый понедельник.',
      statusHint: 'Только активные акции применяются в чекауте.',
      creativeTitle: '5. Креатив (для баннера)',
      creativeHint: 'Опционально. Используется в промо-блоках приложения.',
      promoPlaceholder: 'например, Скидка 20% на ароматы до 8 марта',
    },
    offers: {
      title: 'Офферы',
      subtitle: 'Каждый оффер - конкретная скидка или бонус со своим таргетингом. Пользователю выдается один из них.',
      add: 'Добавить оффер',
      empty: 'Офферов пока нет.',
      tableName: 'Название',
      tableType: 'Тип',
      tableValue: 'Значение',
      tableScope: 'Куда',
      tableCost: 'Расч. стоимость',
      tableStatus: 'Статус',
      editTitle: 'Редактировать оффер',
      newTitle: 'Новый оффер',
      namePlaceholder: 'например, 10% на парфюм',
      type: 'Тип',
      discountValue: 'Процент скидки',
      multiplierValue: 'Множитель',
      giftValue: 'Значение',
      scope: 'На что применяется (scope)',
      scopeHint: 'Scope определяет, как скидка применяется в чекауте. Для brand/product_id укажите бренды или ID товаров ниже.',
      brands: 'Бренды',
      selectBrands: 'Выбрать бренды',
      brandsEmpty: 'Бренды не выбраны',
      brandHint: 'Для scope «На бренд» выберите хотя бы один бренд.',
      products: 'Товары',
      selectProducts: 'Выбрать товары',
      productsEmpty: 'Товары не выбраны',
      productsHint: 'Если оставить пустым, система сможет подобрать товар по категории или типу.',
      categories: 'Разрешенные категории',
      productTypes: 'Разрешенные типы товаров',
      estimatedCost: 'Расч. стоимость (₸)',
      estimatedCostHint: 'Сколько списывается из бюджета кампании при выдаче.',
      cooldown: 'Пауза (дней)',
      cooldownHint: 'Не выдавать тот же оффер этому пользователю N дней после погашения.',
      expires: 'Срок жизни (дней)',
      expiresHint: 'Через сколько дней назначение сгорит, если не погашено.',
      minSpend90d: 'Мин. сумма покупок за 90 дней (₸)',
      minSpend90dHint: 'Оффер увидят только пользователи с суммой покупок за последние 90 дней не ниже этого порога.',
      active: 'Активен',
      created: 'Оффер создан.',
      updated: 'Оффер обновлен.',
      deleted: 'Оффер удален.',
      deleteConfirm: (name) => `Удалить оффер «${name}»? Он будет деактивирован.`,
    },
    picker: {
      brandsTitle: 'Выбор брендов',
      productsTitle: 'Выбор товаров',
      searchBrand: 'Поиск бренда',
      searchProduct: 'Поиск товара, бренда или ID',
      loadBrandsError: 'Не удалось загрузить бренды.',
      loadProductsError: 'Не удалось загрузить товары.',
      noBrands: 'Бренды не найдены.',
      noProducts: 'Товары не найдены.',
      productCount: (count) => `${count} товаров`,
      noBrand: 'Без бренда',
      noCategory: '-',
      noPrice: 'Цена не указана',
    },
    benefits: {
      discount: { label: 'Скидка', description: 'Процент скидки на товары из акции.' },
      points_multiplier: { label: 'Бонусы x N', description: 'Множитель начисления баллов лояльности.' },
      gift: { label: 'Подарок', description: 'Подарок к покупке.' },
    },
    offerTypes: {
      discount: 'Скидка (%)',
      points_multiplier: 'Множитель баллов (xN)',
      gift: 'Подарок',
    },
    targetScopes: {
      cart: { label: 'Вся корзина', hint: 'Применяется ко всем товарам без фильтра.' },
      category: { label: 'Категория', hint: 'Только товары из выбранных категорий.' },
      brand: { label: 'Бренд', hint: 'Только товары выбранных брендов.' },
      product_type: { label: 'Тип товара', hint: 'Только товары определенных типов: тушь, помада и т.д.' },
      product_id: { label: 'Конкретные товары', hint: 'Точечный список SKU.' },
    },
    categories: {
      skincare: 'Уход за кожей',
      makeup: 'Макияж',
      haircare: 'Уход за волосами',
      fragrance: 'Ароматы',
    },
    productTypes: {
      cleanser: 'Очищение',
      serum: 'Сыворотка',
      moisturizer: 'Увлажнение',
      spf: 'SPF',
      conditioner: 'Кондиционер',
      hair_mask: 'Маска для волос',
      lipstick: 'Помада',
      mascara: 'Тушь',
      edt: 'Туалетная вода',
      body_mist: 'Мист для тела',
    },
  },
  kk: {
    common: {
      save: 'Сақтау',
      saving: 'Сақталуда...',
      publish: 'Іске қосу',
      cancel: 'Болдырмау',
      apply: 'Қолдану',
      clearSelection: 'Таңдауды тазарту',
      close: 'Жабу',
      remove: 'Алып тастау',
      edit: 'Өңдеу',
      delete: 'Жою',
      loading: 'Жүктелуде...',
      selected: (count) => `Таңдалды: ${count}`,
      active: 'Белсенді',
      inactive: 'Белсенді емес',
      draft: 'Жоба',
      status: 'Күйі',
      name: 'Атауы',
      startDate: 'Басталу күні',
      endDate: 'Аяқталу күні',
      emptyDateHint: 'Бос болса = шектеусіз.',
      weeklyBudgetKzt: 'Апталық бюджет (₸)',
      promoText: 'Промо мәтіні',
      banner: 'Баннер',
      uploadFile: 'Файл жүктеу',
      uploading: 'Жүктелуде...',
      clear: 'Тазарту',
      bannerAlt: 'Баннер',
      bannerRequirements: 'PNG / JPEG / WebP / GIF, 5 МБ дейін.',
      saveBeforeCampaignBanner: 'Файл жүктеу үшін кампанияны сақтаңыз.',
      saveBeforePromotionBanner: 'Файл жүктеу үшін акцияны сақтаңыз.',
      bannerUploaded: 'Баннер жүктелді.',
      saveCampaignFirst: 'Алдымен кампанияны сақтаңыз.',
      savePromotionFirst: 'Алдымен акцияны сақтаңыз.',
      campaignCreated: 'Кампания жасалды.',
      promotionCreated: 'Акция жасалды.',
      saved: 'Сақталды.',
      campaignPublished: 'Кампания іске қосылды.',
      promotionPublished: 'Акция іске қосылды.',
      campaignLoadError: 'Кампанияны жүктеу мүмкін болмады.',
      promotionLoadError: 'Акцияны жүктеу мүмкін болмады.',
      saveError: 'Сақтау мүмкін болмады.',
      campaignPublishError: 'Кампанияны іске қосу мүмкін болмады.',
      promotionPublishError: 'Акцияны іске қосу мүмкін болмады.',
      invalidPromotionId: 'Акция ID анықталмады.',
      id: (id) => `ID: ${id}`,
      campaignTitle: (id) => `Кампания ${id}`,
      promotionTitle: (id) => `Акция ${id}`,
    },
    validation: {
      campaignNameRequired: 'Кампания атауын көрсетіңіз.',
      promotionNameRequired: 'Акция атауын көрсетіңіз.',
      budgetNumber: 'Бюджет сан болуы керек.',
      priorityNumber: 'Басымдық сан болуы керек.',
      endBeforeStart: 'Аяқталу күні басталу күнінен ерте.',
      offerValueRequired: 'Жеңілдік / көбейткіш мәнін көрсетіңіз.',
      discountRange: 'Жеңілдік 1-ден 100%-ға дейін болуы керек.',
      brandScopeRequired: '«Бренд» scope үшін кемінде бір бренд таңдаңыз.',
      productScopeRequired: '«Нақты тауарлар» scope үшін кемінде бір тауар таңдаңыз.',
      categoryScopeRequired: '«Санат» scope үшін кемінде бір санат таңдаңыз.',
      productTypeScopeRequired: '«Тауар түрі» scope үшін кемінде бір түр таңдаңыз.',
      offerNameRequired: 'Оффер атауын көрсетіңіз.',
      offerBrandRequired: '«Брендке» scope үшін кемінде бір бренд көрсетіңіз.',
    },
    personal: {
      newTitle: 'Жаңа жеке кампания',
      introTitle: 'Жеке кампания қалай жұмыс істейді',
      introPrefix: 'Кампания жеке оффер беруге қатысады:',
      introAfterCode: 'Кампанияның өзі',
      introStrong: 'бюджетті, мерзімді және басымдықты',
      introSuffix: 'Нақты жеңілдіктер, бонустар және таргетинг төмендегі «Офферлер» блогында болады.',
      mainTitle: 'Негізгі',
      namePlaceholder: 'мысалы, fragrance_crosssell',
      internalNameHint: 'Ішкі атау. Жүйелік атаулар',
      internalNameHintAfter: 'next-offer алгоритмінде басым бағыттауға ие.',
      priority: 'Басымдық',
      priorityHint: 'Сан неғұрлым аз болса, кампания басымдығы соғұрлым жоғары.',
      datesBudgetTitle: 'Мерзімдер және бюджет',
      budgetHint: 'Әр дүйсенбі сайын жаңарады.',
      creativeTitle: 'Креатив',
      creativeHint: 'Міндетті емес. Қосымшадағы оффер карточкасын безендіру үшін қолданылады.',
      promoPlaceholder: 'Сіз үшін таңдадық...',
      saveBeforeOffers: 'Оффер қосу үшін кампанияны сақтаңыз.',
    },
    catalog: {
      newTitle: 'Каталогқа жаңа акция',
      introTitle: 'Каталог акциясы қалай жұмыс істейді',
      introPrefix: 'Себет акцияның',
      introStrong: 'scope шартына',
      introSuffix: 'сәйкес келсе, барлық сатып алушыларға қолданылады. Персонализациясыз және cooldownсыз, жалпы пайда ретінде.',
      mainTitle: '1. Негізгі',
      namePlaceholder: 'мысалы, Көктем-2026',
      scopeTitle: '2. Қай тауарларға қолданылады',
      scopeHint: 'Акцияға кіретін тауарларды таңдаңыз. «Бүкіл себет» болса, акция кез келген тапсырысқа қолданылады.',
      categories: 'Санаттар',
      productTypes: 'Тауар түрлері',
      brands: 'Брендтер',
      selectBrands: 'Брендтерді таңдау',
      brandsEmpty: 'Брендтер таңдалмаған',
      products: 'Тауарлар',
      selectProducts: 'Тауарларды таңдау',
      productsEmpty: 'Тауарлар таңдалмаған',
      buyerBenefitTitle: '3. Сатып алушыға не береді',
      buyerBenefitHint: 'Пайда түрін және мәнін таңдаңыз.',
      discountValueLabel: 'Жеңілдік мөлшері, %',
      pointsValueLabel: 'Ұпай көбейткіші (xN)',
      giftValueLabel: 'Сыйлық сипаттамасы',
      discountHint: '1-ден 100%-ға дейін.',
      pointsHint: 'Мысалы, 2 = сатып алу үшін x2 ұпай.',
      giftHint: 'Сыйлықтың қысқа сипаттамасы. Толығырақ промо мәтінінде жазуға болады.',
      minSpendLabel: 'Мин. сатып алу сомасы (₸)',
      minSpendHint: 'Акция алу үшін пайдаланушының 90 күндегі сатып алу сомасы. 0 = барлығына.',
      budgetStatusTitle: '4. Бюджет және күй',
      budgetStatusHint: 'Бюджет міндетті емес. Бюджетсіз акция лимитсіз жұмыс істейді.',
      budgetPlaceholder: 'бос қалдырыңыз = лимитсіз',
      budgetLimitHint: 'Көрсетілсе, лимитке жеткенде акция қолданылмайды. Әр дүйсенбі сайын жаңарады.',
      statusHint: 'Чекаутта тек белсенді акциялар қолданылады.',
      creativeTitle: '5. Креатив (баннер үшін)',
      creativeHint: 'Міндетті емес. Қосымшадағы промо-блоктарда қолданылады.',
      promoPlaceholder: 'мысалы, 8 наурызға дейін хош иістерге 20% жеңілдік',
    },
    offers: {
      title: 'Офферлер',
      subtitle: 'Әр оффер - жеке таргетингі бар нақты жеңілдік немесе бонус. Пайдаланушыға олардың біреуі беріледі.',
      add: 'Оффер қосу',
      empty: 'Әзірге оффер жоқ.',
      tableName: 'Атауы',
      tableType: 'Түрі',
      tableValue: 'Мәні',
      tableScope: 'Қайда',
      tableCost: 'Есептік құн',
      tableStatus: 'Күйі',
      editTitle: 'Офферді өңдеу',
      newTitle: 'Жаңа оффер',
      namePlaceholder: 'мысалы, парфюмге 10%',
      type: 'Түрі',
      discountValue: 'Жеңілдік пайызы',
      multiplierValue: 'Көбейткіш',
      giftValue: 'Мәні',
      scope: 'Қайда қолданылады (scope)',
      scopeHint: 'Scope жеңілдік чекаутта қалай қолданылатынын анықтайды. brand/product_id үшін брендтерді немесе тауар ID көрсетіңіз.',
      brands: 'Брендтер',
      selectBrands: 'Брендтерді таңдау',
      brandsEmpty: 'Брендтер таңдалмаған',
      brandHint: '«Брендке» scope үшін кемінде бір бренд таңдаңыз.',
      products: 'Тауарлар',
      selectProducts: 'Тауарларды таңдау',
      productsEmpty: 'Тауарлар таңдалмаған',
      productsHint: 'Бос қалдырсаңыз, жүйе тауарды санат немесе түр бойынша таңдай алады.',
      categories: 'Рұқсат етілген санаттар',
      productTypes: 'Рұқсат етілген тауар түрлері',
      estimatedCost: 'Есептік құн (₸)',
      estimatedCostHint: 'Оффер берілгенде кампания бюджетінен списание сомасы.',
      cooldown: 'Пауза (күн)',
      cooldownHint: 'Өтелгеннен кейін осы пайдаланушыға N күн бойы сол офферді бермеу.',
      expires: 'Жарамдылық мерзімі (күн)',
      expiresHint: 'Өтелмесе, тағайындау қанша күннен кейін жойылады.',
      minSpend90d: '90 күндегі мин. сатып алу сомасы (₸)',
      minSpend90dHint: 'Офферді соңғы 90 күндегі сатып алу сомасы осы шектен төмен емес пайдаланушылар көреді.',
      active: 'Белсенді',
      created: 'Оффер жасалды.',
      updated: 'Оффер жаңартылды.',
      deleted: 'Оффер жойылды.',
      deleteConfirm: (name) => `«${name}» офферін жою керек пе? Ол деактивацияланады.`,
    },
    picker: {
      brandsTitle: 'Брендтерді таңдау',
      productsTitle: 'Тауарларды таңдау',
      searchBrand: 'Бренд іздеу',
      searchProduct: 'Тауар, бренд немесе ID іздеу',
      loadBrandsError: 'Брендтерді жүктеу мүмкін болмады.',
      loadProductsError: 'Тауарларды жүктеу мүмкін болмады.',
      noBrands: 'Брендтер табылмады.',
      noProducts: 'Тауарлар табылмады.',
      productCount: (count) => `${count} тауар`,
      noBrand: 'Брендсіз',
      noCategory: '-',
      noPrice: 'Баға көрсетілмеген',
    },
    benefits: {
      discount: { label: 'Жеңілдік', description: 'Акциядағы тауарларға жеңілдік пайызы.' },
      points_multiplier: { label: 'Бонус x N', description: 'Лоялти ұпайларын есептеу көбейткіші.' },
      gift: { label: 'Сыйлық', description: 'Сатып алуға сыйлық.' },
    },
    offerTypes: {
      discount: 'Жеңілдік (%)',
      points_multiplier: 'Ұпай көбейткіші (xN)',
      gift: 'Сыйлық',
    },
    targetScopes: {
      cart: { label: 'Бүкіл себет', hint: 'Фильтрсіз барлық тауарларға қолданылады.' },
      category: { label: 'Санат', hint: 'Тек таңдалған санаттағы тауарлар.' },
      brand: { label: 'Бренд', hint: 'Тек таңдалған брендтердің тауарлары.' },
      product_type: { label: 'Тауар түрі', hint: 'Тек белгілі бір тауар түрлері: тушь, далап және т.б.' },
      product_id: { label: 'Нақты тауарлар', hint: 'SKU нақты тізімі.' },
    },
    categories: {
      skincare: 'Тері күтімі',
      makeup: 'Макияж',
      haircare: 'Шаш күтімі',
      fragrance: 'Хош иістер',
    },
    productTypes: {
      cleanser: 'Тазарту',
      serum: 'Сарысу',
      moisturizer: 'Ылғалдандыру',
      spf: 'SPF',
      conditioner: 'Кондиционер',
      hair_mask: 'Шаш маскасы',
      lipstick: 'Далап',
      mascara: 'Тушь',
      edt: 'Иіссу',
      body_mist: 'Дене мисі',
    },
  },
  en: {
    common: {
      save: 'Save',
      saving: 'Saving...',
      publish: 'Launch',
      cancel: 'Cancel',
      apply: 'Apply',
      clearSelection: 'Clear selection',
      close: 'Close',
      remove: 'Remove',
      edit: 'Edit',
      delete: 'Delete',
      loading: 'Loading...',
      selected: (count) => `Selected: ${count}`,
      active: 'Active',
      inactive: 'Inactive',
      draft: 'Draft',
      status: 'Status',
      name: 'Name',
      startDate: 'Start date',
      endDate: 'End date',
      emptyDateHint: 'Empty = no limit.',
      weeklyBudgetKzt: 'Weekly budget (₸)',
      promoText: 'Promo text',
      banner: 'Banner',
      uploadFile: 'Upload file',
      uploading: 'Uploading...',
      clear: 'Clear',
      bannerAlt: 'Banner',
      bannerRequirements: 'PNG / JPEG / WebP / GIF, up to 5 MB.',
      saveBeforeCampaignBanner: 'Save the campaign before uploading a file.',
      saveBeforePromotionBanner: 'Save the promotion before uploading a file.',
      bannerUploaded: 'Banner uploaded.',
      saveCampaignFirst: 'Save the campaign first.',
      savePromotionFirst: 'Save the promotion first.',
      campaignCreated: 'Campaign created.',
      promotionCreated: 'Promotion created.',
      saved: 'Saved.',
      campaignPublished: 'Campaign launched.',
      promotionPublished: 'Promotion launched.',
      campaignLoadError: 'Failed to load the campaign.',
      promotionLoadError: 'Failed to load the promotion.',
      saveError: 'Failed to save.',
      campaignPublishError: 'Failed to launch the campaign.',
      promotionPublishError: 'Failed to launch the promotion.',
      invalidPromotionId: 'Could not determine the promotion ID.',
      id: (id) => `ID: ${id}`,
      campaignTitle: (id) => `Campaign ${id}`,
      promotionTitle: (id) => `Promotion ${id}`,
    },
    validation: {
      campaignNameRequired: 'Enter the campaign name.',
      promotionNameRequired: 'Enter the promotion name.',
      budgetNumber: 'Budget must be a number.',
      priorityNumber: 'Priority must be a number.',
      endBeforeStart: 'End date is earlier than start date.',
      offerValueRequired: 'Enter the discount / multiplier value.',
      discountRange: 'Discount must be between 1 and 100%.',
      brandScopeRequired: 'For the Brand scope, select at least one brand.',
      productScopeRequired: 'For the Specific products scope, select at least one product.',
      categoryScopeRequired: 'For the Category scope, select at least one category.',
      productTypeScopeRequired: 'For the Product type scope, select at least one type.',
      offerNameRequired: 'Enter the offer name.',
      offerBrandRequired: 'For the Brand scope, select at least one brand.',
    },
    personal: {
      newTitle: 'New personal campaign',
      introTitle: 'How a personal campaign works',
      introPrefix: 'The campaign participates in individual offer selection through',
      introAfterCode: 'The campaign itself defines',
      introStrong: 'budget, dates, and priority',
      introSuffix: 'Specific discounts, bonuses, and targeting live in the Offers section below.',
      mainTitle: 'Main',
      namePlaceholder: 'for example, fragrance_crosssell',
      internalNameHint: 'Internal name. System names',
      internalNameHintAfter: 'have priority routing in the next-offer algorithm.',
      priority: 'Priority',
      priorityHint: 'Lower number = higher priority among campaigns.',
      datesBudgetTitle: 'Dates and budget',
      budgetHint: 'Resets every Monday.',
      creativeTitle: 'Creative',
      creativeHint: 'Optional. Used to render the offer card in the app.',
      promoPlaceholder: 'Selected for you...',
      saveBeforeOffers: 'Save the campaign before adding offers.',
    },
    catalog: {
      newTitle: 'New catalog promotion',
      introTitle: 'How a catalog promotion works',
      introPrefix: 'Applies to all shoppers if the cart matches the promotion',
      introStrong: 'scope',
      introSuffix: 'No personalization or cooldown, just a shared benefit.',
      mainTitle: '1. Main',
      namePlaceholder: 'for example, Spring-2026',
      scopeTitle: '2. Applies to',
      scopeHint: 'Choose which products are included. If you select Entire cart, the promotion applies to any order.',
      categories: 'Categories',
      productTypes: 'Product types',
      brands: 'Brands',
      selectBrands: 'Select brands',
      brandsEmpty: 'No brands selected',
      products: 'Products',
      selectProducts: 'Select products',
      productsEmpty: 'No products selected',
      buyerBenefitTitle: '3. Customer benefit',
      buyerBenefitHint: 'Choose the benefit type and value.',
      discountValueLabel: 'Discount amount, %',
      pointsValueLabel: 'Points multiplier (xN)',
      giftValueLabel: 'Gift description',
      discountHint: 'From 1 to 100%.',
      pointsHint: 'For example, 2 = x2 points for the purchase.',
      giftHint: 'Short gift description. Details can go into the promo text.',
      minSpendLabel: 'Min. purchase amount (₸)',
      minSpendHint: 'User purchase amount over 90 days required to get the promotion. 0 = everyone.',
      budgetStatusTitle: '4. Budget and status',
      budgetStatusHint: 'Budget is optional. Without a budget, the promotion has no limit.',
      budgetPlaceholder: 'leave empty = no limit',
      budgetLimitHint: 'If set, the promotion stops applying when the limit is reached. Resets every Monday.',
      statusHint: 'Only active promotions are applied at checkout.',
      creativeTitle: '5. Creative (for banner)',
      creativeHint: 'Optional. Used in app promo blocks.',
      promoPlaceholder: 'for example, 20% off fragrances until March 8',
    },
    offers: {
      title: 'Offers',
      subtitle: 'Each offer is a specific discount or bonus with its own targeting. The user receives one of them.',
      add: 'Add offer',
      empty: 'No offers yet.',
      tableName: 'Name',
      tableType: 'Type',
      tableValue: 'Value',
      tableScope: 'Applies to',
      tableCost: 'Est. cost',
      tableStatus: 'Status',
      editTitle: 'Edit offer',
      newTitle: 'New offer',
      namePlaceholder: 'for example, 10% off perfume',
      type: 'Type',
      discountValue: 'Discount percent',
      multiplierValue: 'Multiplier',
      giftValue: 'Value',
      scope: 'Applies to (scope)',
      scopeHint: 'Scope defines how the discount is applied at checkout. For brand/product_id, select brands or product IDs below.',
      brands: 'Brands',
      selectBrands: 'Select brands',
      brandsEmpty: 'No brands selected',
      brandHint: 'For the Brand scope, select at least one brand.',
      products: 'Products',
      selectProducts: 'Select products',
      productsEmpty: 'No products selected',
      productsHint: 'If empty, the system can pick a product by category or type.',
      categories: 'Allowed categories',
      productTypes: 'Allowed product types',
      estimatedCost: 'Est. cost (₸)',
      estimatedCostHint: 'Amount deducted from the campaign budget when assigned.',
      cooldown: 'Cooldown (days)',
      cooldownHint: 'Do not issue the same offer to this user for N days after redemption.',
      expires: 'Lifetime (days)',
      expiresHint: 'How many days until the assignment expires if not redeemed.',
      minSpend90d: 'Min. purchase amount over 90 days (₸)',
      minSpend90dHint: 'Only users whose purchase amount over the last 90 days is at least this threshold will see the offer.',
      active: 'Active',
      created: 'Offer created.',
      updated: 'Offer updated.',
      deleted: 'Offer deleted.',
      deleteConfirm: (name) => `Delete offer "${name}"? It will be deactivated.`,
    },
    picker: {
      brandsTitle: 'Select brands',
      productsTitle: 'Select products',
      searchBrand: 'Search brand',
      searchProduct: 'Search product, brand, or ID',
      loadBrandsError: 'Failed to load brands.',
      loadProductsError: 'Failed to load products.',
      noBrands: 'No brands found.',
      noProducts: 'No products found.',
      productCount: (count) => `${count} products`,
      noBrand: 'No brand',
      noCategory: '-',
      noPrice: 'Price not set',
    },
    benefits: {
      discount: { label: 'Discount', description: 'Discount percentage for products in the promotion.' },
      points_multiplier: { label: 'Points x N', description: 'Multiplier for loyalty points accrual.' },
      gift: { label: 'Gift', description: 'Gift with purchase.' },
    },
    offerTypes: {
      discount: 'Discount (%)',
      points_multiplier: 'Points multiplier (xN)',
      gift: 'Gift',
    },
    targetScopes: {
      cart: { label: 'Entire cart', hint: 'Applies to all products without filters.' },
      category: { label: 'Category', hint: 'Only products from selected categories.' },
      brand: { label: 'Brand', hint: 'Only products from selected brands.' },
      product_type: { label: 'Product type', hint: 'Only products of selected types: mascara, lipstick, and so on.' },
      product_id: { label: 'Specific products', hint: 'Explicit SKU list.' },
    },
    categories: {
      skincare: 'Skincare',
      makeup: 'Makeup',
      haircare: 'Haircare',
      fragrance: 'Fragrance',
    },
    productTypes: {
      cleanser: 'Cleanser',
      serum: 'Serum',
      moisturizer: 'Moisturizer',
      spf: 'SPF',
      conditioner: 'Conditioner',
      hair_mask: 'Hair mask',
      lipstick: 'Lipstick',
      mascara: 'Mascara',
      edt: 'Eau de toilette',
      body_mist: 'Body mist',
    },
  },
};

export const campaignCategoryValues = ['skincare', 'makeup', 'haircare', 'fragrance'] as const;

export const campaignProductTypeValues = [
  'cleanser',
  'serum',
  'moisturizer',
  'spf',
  'conditioner',
  'hair_mask',
  'lipstick',
  'mascara',
  'edt',
  'body_mist',
] as const;

export function getCampaignCategoryOptions(language: AppLanguage) {
  const labels = campaignCopy[language].categories;
  return campaignCategoryValues.map((value) => ({ value, label: labels[value] ?? value }));
}

export function getCampaignProductTypeOptions(language: AppLanguage) {
  const labels = campaignCopy[language].productTypes;
  return campaignProductTypeValues.map((value) => ({ value, label: labels[value] ?? value }));
}

export function formatCampaignMoney(value: number | string, language: AppLanguage) {
  const amount = Number(value);
  const locale = language === 'kk' ? 'kk-KZ' : language === 'en' ? 'en-US' : 'ru-RU';
  return `${(Number.isFinite(amount) ? amount : 0).toLocaleString(locale, { maximumFractionDigits: 0 })} ₸`;
}
