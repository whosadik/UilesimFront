import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Sparkles, ArrowRight, TrendingUp, ShoppingBag,
  ChevronRight, Clock, Check, RefreshCw, Zap, Map,
  Plus, Minus, Star, Settings, Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../shared/auth/AuthContext';
import { ApiError } from '../../shared/api/ApiError';
import { createRequestId } from '../../shared/api/httpClient';
import {
  getLoyalty,
  getProfile,
  getProfileTaxonomy,
  type ProfileTaxonomy,
  updateProfile,
} from '../../shared/api/me';
import { clickOffer, nextOffer } from '../../shared/api/offers';
import { home, sendEvent, type HomeRecsResponse } from '../../shared/api/recommendations';
import { useCommerce } from '../../shared/commerce/CommerceContext';
import {
  clickRoadmapStep,
  getRoadmap,
  type RoadmapPlanApi,
  type RoadmapStepApi,
  type RoadmapStepPresentationApi,
  type RoadmapStepSnapshotApi,
  type RoadmapSummaryApi,
} from '../../shared/api/roadmap';
import {
  DEFAULT_ROADMAP_STEP_META,
  getRoadmapStepMeta,
} from '../../shared/roadmap/presentation';
import {
  formatCatalogCategoryLabel,
  formatCatalogFreeTextLabel,
  formatCatalogProductTypeLabel,
  formatCatalogStrengthLabel,
  formatCatalogTokenLabel,
  formatCatalogTokenList,
  localizeRecommendationReason,
} from '../../shared/catalog/presentation';
import {
  getProfileOptionLabels,
  mapProfileLabelsToApiValues,
  mapProfileMultiApiToLabels,
  mapProfileSingleApiToLabel,
  mapProfileSingleLabelToApiValue,
  resolveProfileTaxonomy,
} from '../../shared/profile/taxonomy';
import { recommendationScoreToPercent } from '../../shared/recommendations/score';
import { useI18n } from '../../shared/i18n/LanguageContext';
import type { AppLanguage } from '../../shared/i18n/messages';

/**
 * DEV NOTES:
 * Endpoints:
 * - GET /api/me/profile → { name, skin_type, goals, loyalty: { tier, points } }
 * - GET /api/me/recommendations/home → { sections: [...] }
 * - GET /api/me/next-best-action → { type, title, description, benefit, cta }
 * - GET /api/me/next-offer → { title, discount, saving_amount, expires_at }
 * - PATCH /api/me/profile { skin_type, goals } → quick prefs update
 * - POST /api/me/recommendations/event { action, product_id, page, section_key, context }
 */

const forYouPageCopy = {
  ru: {
    points: 'баллов',
    pointsShort: 'б.',
    buyFor: (amount: number) => `Купите на ${amount.toLocaleString('ru-RU')} ₸`,
    untilTier: (tier: string, points: number) => `До ${tier}: ${points} баллов`,
    match: (value: number) => `${value}% совпадение`,
    addToCart: 'В корзину',
    preferences: 'Мои предпочтения',
    affectsRecommendations: 'влияет на рекомендации',
    skinType: 'Тип кожи',
    goals: 'Мои цели',
    updating: 'Обновляем...',
    updateRecommendations: 'Обновить рекомендации',
    selectSkinAndGoal: 'Выберите тип кожи и хотя бы одну цель',
    setupTitle: 'Давайте настроим вашу персонализацию',
    setupDescription: 'Ответьте на два быстрых вопроса, и платформа сразу перестроит рекомендации под вас.',
    whatSkinType: 'Какой у вас тип кожи?',
    next: 'Далее',
    goalsTitle: 'Какие у вас цели?',
    goalsDescription: 'Можно выбрать несколько, а рекомендации и roadmap подстроятся автоматически.',
    back: 'Назад',
    saving: 'Сохраняем...',
    showRecommendations: 'Показать мои рекомендации',
    confirmEmail: 'Подтвердите email',
    confirmEmailDescription: (email: string) => `Мы отправили ссылку на ${email}. Подтвердите адрес, чтобы завершить настройку аккаунта.`,
    sending: 'Отправляем...',
    resendEmail: 'Отправить письмо ещё раз',
    ready: 'Готово',
    profile: 'Профиль',
    roadmap: 'Roadmap',
    soon: 'Скоро',
    active: 'Активен',
    waiting: 'Ожидание',
    catalog: 'Каталог',
    profileConfigured: 'Профиль настроен',
    profileConfiguredDescription: 'Тип кожи и цели уже участвуют в персонализации.',
    refineProfile: 'Уточните профиль',
    refineProfileDescription: 'Добавьте тип кожи и цели, чтобы рекомендации стали точнее.',
    nextRoadmapStep: 'Следующий шаг roadmap',
    roadmapBuilding: 'Roadmap формируется',
    roadmapBuildingDescription: 'Когда план будет готов, следующий шаг появится здесь.',
    currentPersonalOffer: 'Текущий персональный оффер',
    offerWillAppear: 'Оффер появится позже',
    offerWillAppearDescription: 'Когда для вас будет назначено предложение, оно отобразится здесь.',
    cartRecommendation: 'Рекомендация для корзины',
    cartRecommendationDescription: (name: string, points: number) => `${name} · +${points} баллов после покупки`,
    recommendationsLoading: 'Рекомендации загружаются',
    recommendationsLoadingDescription: 'Как только API вернет персональные товары, они появятся слева.',
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    personalRecommendation: 'Персональная рекомендация',
    suitableForSkin: (value: string) => `Подходит для ${value.toLowerCase()} кожи`,
    complementsPurchases: 'Дополняет прошлые покупки',
    popularForProfiles: 'Популярно среди похожих профилей',
    selectionByType: (value: string) => `Подбор по типу ${value.toLowerCase()}`,
    selectionByCategory: (value: string) => `Подбор по категории ${value.toLowerCase()}`,
    underYourProfile: 'Под ваш профиль',
    intensity: (value: string) => `Интенсивность: ${value.toLowerCase()}`,
    actives: (value: string) => `Активы: ${value}`,
    blendsWithPurchases: 'Хорошо сочетается с вашими предыдущими покупками',
    chosenBySimilarUsers: 'Часто выбирают пользователи с похожим профилем',
    openProductForDetails: 'Откройте карточку товара для деталей и способа применения',
    productFallback: (id: string) => `Товар #${id}`,
    fallbackRoadmapTitle: 'Добавьте тоник в рутину',
    fallbackRoadmapDescription: 'Вы завершили очищение. Следующий шаг поможет сбалансировать кожу и подготовить её к увлажнению.',
    fallbackRoadmapWhy: 'Этот этап логично следует за очищением и помогает быстрее увидеть результат рутины.',
    fallbackRoadmapSteps: ['Очищение', 'Тоник', 'Увлажнение', 'SPF', 'Спецуход'],
    openRoadmapStep: 'Откройте roadmap, чтобы увидеть следующий шаг.',
    stepLabel: (step: number) => `Шаг ${step}`,
    roadmapStepTitle: 'Следующий шаг roadmap',
    personalOfferTitle: 'Персональный оффер',
    discountOnType: (value: string, label: string) => `Скидка ${value}% на ${label.toLowerCase()}`,
    discountOnCategory: (value: string, label: string) => `Скидка ${value}% на ${label.toLowerCase()}`,
    discountForYou: (value: string) => `Скидка ${value}% для вас`,
    pointsMultiplier: (value: string) => `x${value} баллы на следующую покупку`,
    giftWithOrder: 'Подарок к заказу',
    offerAvailable: 'Персональное предложение доступно прямо сейчас.',
    offerAutoCart: (amount: number) => `Применяется автоматически к следующей корзине от ${amount.toLocaleString('ru-RU')} ₸.`,
    offerCategoryScope: (value: string) => `Предложение действует на категорию «${value}».`,
    offerTypeScope: (value: string) => `Предложение действует на товары типа «${value}».`,
    offerProductScope: (value: string) => `Сработает на рекомендованный товар типа «${value}».`,
    offerRoadmapScope: (value: string) => `Оффер связан с roadmap и поддерживает шаг «${value}».`,
    offerBoundToProfile: 'Предложение уже закреплено за вашим профилем.',
    offerSaving: (amount: number, saving: number) => `На корзине ${amount.toLocaleString('ru-RU')} ₸ вы сэкономите ${saving.toLocaleString('ru-RU')} ₸`,
    offerAutoDiscount: (value: string) => `Скидка ${value}% применится автоматически на подходящую покупку`,
    offerAutoPoints: (value: string) => `Получите x${value} баллы на следующую подходящую покупку`,
    offerAutoGift: 'Подарок добавится автоматически при выполнении условий оффера',
    recommendationsUpdated: 'Рекомендации обновлены!',
    saveSettingsError: 'Не удалось сохранить настройки.',
    recommendationsPersonalized: 'Рекомендации персонализированы!',
    savePersonalizationError: 'Не удалось сохранить персонализацию.',
    emailAlreadyVerified: 'Email уже подтвержден.',
    emailSent: (email: string) => `Письмо с подтверждением отправлено на ${email}.`,
    emailSendError: 'Не удалось отправить письмо с подтверждением.',
    addedToCart: 'Добавлено в корзину!',
    cartNowHas: (count: number) => `Теперь в корзине ${count} шт.`,
    pointsAfterPurchase: (points: number) => `+${points} баллов после покупки`,
    addToCartError: 'Не удалось добавить товар в корзину',
    updateCartError: 'Не удалось обновить корзину',
    personalCenter: 'Персональный центр',
    hello: (name: string) => `Привет, ${name} ✦`,
    defaultName: 'Аяла',
    loadingPersonalData: 'Загружаем персональные данные...',
    retry: 'Повторить',
    nextStep: 'Ваш следующий шаг',
    whyNow: 'Почему сейчас',
    goToStep: 'Перейти к шагу',
    specialForYou: 'Специально для вас',
    basedOn: (skinType: string, goals: string[]) => `На основе: ${skinType.toLowerCase()} кожа · ${goals.join(', ').toLowerCase()}`,
    all: 'Все',
    personalRecommendationsBuilding: 'Персональные рекомендации формируются',
    personalRecommendationsBuildingDescription: 'Когда API соберёт товары под ваш профиль и roadmap, они появятся в этом блоке.',
    openCatalog: 'Открыть каталог',
    trendingForYou: 'В тренде для вас',
    trendingDescription: 'Популярно среди Gold-пользователей с похожим профилем',
    trendsPending: 'Тренды для вашего профиля пока не готовы',
    trendsPendingDescription: 'Как только backend вернёт популярные товары для похожих пользователей, они появятся здесь.',
    viewNew: 'Смотреть новинки',
    myRoadmap: 'Мой Roadmap',
    stepProgress: (current: number, total: number) => `Шаг ${current}/${total}`,
    offerBadge: 'ОФФЕР',
    personal: 'Персональный',
    noOfferTitle: 'Персональный оффер пока недоступен',
    noOfferDescription: 'Когда API подберёт подходящее предложение, оно появится здесь.',
    noOfferHighlight: 'Сейчас для вашего профиля нет активного предложения.',
    expiresIn: 'Истекает через:',
    hoursShort: 'ч',
    minutesShort: 'мин',
    quickActions: 'Быстрые действия',
    loadRecommendationsError: 'Не удалось загрузить рекомендации. Попробуйте ещё раз.',
    partialDataError: 'Часть персональных данных недоступна. Некоторые разделы рекомендаций могут быть временно пустыми.',
    loadOfferError: 'Не удалось загрузить персональный оффер. Остальные данные отображаются.',
    offerAccent: 'ОФФЕР',
    offerDetails: 'Подробнее',
  },
  kk: {
    points: 'ұпай',
    pointsShort: 'ұп.',
    buyFor: (amount: number) => `${amount.toLocaleString('kk-KZ')} ₸ сомаға сатып алыңыз`,
    untilTier: (tier: string, points: number) => `${tier} деңгейіне дейін: ${points} ұпай`,
    match: (value: number) => `${value}% сәйкестік`,
    addToCart: 'Себетке',
    preferences: 'Менің қалауым',
    affectsRecommendations: 'ұсыныстарға әсер етеді',
    skinType: 'Тері түрі',
    goals: 'Менің мақсаттарым',
    updating: 'Жаңартып жатырмыз...',
    updateRecommendations: 'Ұсыныстарды жаңарту',
    selectSkinAndGoal: 'Тері түрін және кемінде бір мақсатты таңдаңыз',
    setupTitle: 'Жеке баптауды реттейік',
    setupDescription: 'Екі қысқа сұраққа жауап беріңіз, платформа ұсыныстарды бірден сізге бейімдейді.',
    whatSkinType: 'Сіздің тері түріңіз қандай?',
    next: 'Келесі',
    goalsTitle: 'Мақсаттарыңыз қандай?',
    goalsDescription: 'Бірнешеуін таңдауға болады, ұсыныстар мен roadmap автоматты түрде бейімделеді.',
    back: 'Артқа',
    saving: 'Сақтап жатырмыз...',
    showRecommendations: 'Менің ұсыныстарымды көрсету',
    confirmEmail: 'Email-ді растаңыз',
    confirmEmailDescription: (email: string) => `Біз ${email} адресіне сілтеме жібердік. Аккаунтты аяқтау үшін email-ді растаңыз.`,
    sending: 'Жіберіп жатырмыз...',
    resendEmail: 'Хатты қайта жіберу',
    ready: 'Дайын',
    profile: 'Профиль',
    roadmap: 'Roadmap',
    soon: 'Жақында',
    active: 'Белсенді',
    waiting: 'Күту',
    catalog: 'Каталог',
    profileConfigured: 'Профиль бапталған',
    profileConfiguredDescription: 'Тері түрі мен мақсаттар жекелендіруге қатысып тұр.',
    refineProfile: 'Профильді нақтылаңыз',
    refineProfileDescription: 'Ұсыныстар дәлірек болуы үшін тері түрі мен мақсаттарды қосыңыз.',
    nextRoadmapStep: 'Roadmap келесі қадамы',
    roadmapBuilding: 'Roadmap жасалып жатыр',
    roadmapBuildingDescription: 'Жоспар дайын болғанда, келесі қадам осында көрінеді.',
    currentPersonalOffer: 'Ағымдағы жеке оффер',
    offerWillAppear: 'Оффер кейінірек шығады',
    offerWillAppearDescription: 'Сізге ұсыныс тағайындалғанда, ол осында көрінеді.',
    cartRecommendation: 'Себетке ұсыныс',
    cartRecommendationDescription: (name: string, points: number) => `${name} · сатып алғаннан кейін +${points} ұпай`,
    recommendationsLoading: 'Ұсыныстар жүктелуде',
    recommendationsLoadingDescription: 'API жеке тауарларды қайтарғанда, олар осы жерде пайда болады.',
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    personalRecommendation: 'Жеке ұсыныс',
    suitableForSkin: (value: string) => `${value.toLowerCase()} терісіне сай`,
    complementsPurchases: 'Алдыңғы сатып алуларды толықтырады',
    popularForProfiles: 'Ұқсас профильдер арасында танымал',
    selectionByType: (value: string) => `${value.toLowerCase()} түрі бойынша таңдау`,
    selectionByCategory: (value: string) => `${value.toLowerCase()} санаты бойынша таңдау`,
    underYourProfile: 'Профильге сай',
    intensity: (value: string) => `Қарқындылығы: ${value.toLowerCase()}`,
    actives: (value: string) => `Белсенділер: ${value}`,
    blendsWithPurchases: 'Алдыңғы сатып алуларыңызбен жақсы үйлеседі',
    chosenBySimilarUsers: 'Ұқсас профильдері бар қолданушылар жиі таңдайды',
    openProductForDetails: 'Толық мәлімет пен қолдану тәсілі үшін тауар картасын ашыңыз',
    productFallback: (id: string) => `Тауар #${id}`,
    fallbackRoadmapTitle: 'Рутинаға тонер қосыңыз',
    fallbackRoadmapDescription: 'Сіз тазартуды аяқтадыңыз. Келесі қадам теріні теңестіріп, ылғалдандыруға дайындайды.',
    fallbackRoadmapWhy: 'Бұл кезең тазартудан кейін табиғи түрде келеді және нәтижені тезірек көруге көмектеседі.',
    fallbackRoadmapSteps: ['Тазарту', 'Тонер', 'Ылғалдандыру', 'SPF', 'Арнайы күтім'],
    openRoadmapStep: 'Келесі қадамды көру үшін roadmap-ты ашыңыз.',
    stepLabel: (step: number) => `${step}-қадам`,
    roadmapStepTitle: 'Roadmap келесі қадамы',
    personalOfferTitle: 'Жеке оффер',
    discountOnType: (value: string, label: string) => `${label.toLowerCase()} үшін ${value}% жеңілдік`,
    discountOnCategory: (value: string, label: string) => `${label.toLowerCase()} санатына ${value}% жеңілдік`,
    discountForYou: (value: string) => `Сізге ${value}% жеңілдік`,
    pointsMultiplier: (value: string) => `Келесі сатып алуға x${value} ұпай`,
    giftWithOrder: 'Тапсырысқа сыйлық',
    offerAvailable: 'Жеке ұсыныс қазір қолжетімді.',
    offerAutoCart: (amount: number) => `${amount.toLocaleString('kk-KZ')} ₸ бастап келесі себетке автоматты қолданылады.`,
    offerCategoryScope: (value: string) => `Ұсыныс «${value}» санатына жарамды.`,
    offerTypeScope: (value: string) => `Ұсыныс «${value}» түріндегі тауарларға жарамды.`,
    offerProductScope: (value: string) => `Ұсыныс «${value}» түріндегі ұсынылған тауарға қолданылады.`,
    offerRoadmapScope: (value: string) => `Оффер roadmap-пен байланысты және «${value}» қадамын қолдайды.`,
    offerBoundToProfile: 'Ұсыныс профиліңізге бекітілген.',
    offerSaving: (amount: number, saving: number) => `${amount.toLocaleString('kk-KZ')} ₸ себетте ${saving.toLocaleString('kk-KZ')} ₸ үнемдейсіз`,
    offerAutoDiscount: (value: string) => `${value}% жеңілдік сәйкес сатып алуға автоматты қолданылады`,
    offerAutoPoints: (value: string) => `Келесі сәйкес сатып алуға x${value} ұпай аласыз`,
    offerAutoGift: 'Оффер шарттары орындалса, сыйлық автоматты қосылады',
    recommendationsUpdated: 'Ұсыныстар жаңартылды!',
    saveSettingsError: 'Баптауларды сақтау мүмкін болмады.',
    recommendationsPersonalized: 'Ұсыныстар жекелендірілді!',
    savePersonalizationError: 'Жекелендіруді сақтау мүмкін болмады.',
    emailAlreadyVerified: 'Email әлдеқашан расталған.',
    emailSent: (email: string) => `Растау хаты ${email} адресіне жіберілді.`,
    emailSendError: 'Растау хатын жіберу мүмкін болмады.',
    addedToCart: 'Себетке қосылды!',
    cartNowHas: (count: number) => `Себетте енді ${count} дана бар.`,
    pointsAfterPurchase: (points: number) => `Сатып алғаннан кейін +${points} ұпай`,
    addToCartError: 'Тауарды себетке қосу мүмкін болмады',
    updateCartError: 'Себетті жаңарту мүмкін болмады',
    personalCenter: 'Жеке орталық',
    hello: (name: string) => `Сәлем, ${name} ✦`,
    defaultName: 'Аяла',
    loadingPersonalData: 'Жеке деректер жүктелуде...',
    retry: 'Қайталау',
    nextStep: 'Келесі қадамыңыз',
    whyNow: 'Неге қазір',
    goToStep: 'Қадамға өту',
    specialForYou: 'Арнайы сіз үшін',
    basedOn: (skinType: string, goals: string[]) => `Негізі: ${skinType.toLowerCase()} тері · ${goals.join(', ').toLowerCase()}`,
    all: 'Барлығы',
    personalRecommendationsBuilding: 'Жеке ұсыныстар қалыптасуда',
    personalRecommendationsBuildingDescription: 'API профиль мен roadmap бойынша тауарларды жинағанда, олар осы блокта пайда болады.',
    openCatalog: 'Каталогты ашу',
    trendingForYou: 'Сіз үшін трендте',
    trendingDescription: 'Ұқсас профилі бар Gold қолданушылар арасында танымал',
    trendsPending: 'Профильге арналған трендтер әлі дайын емес',
    trendsPendingDescription: 'Backend ұқсас қолданушыларға танымал тауарларды қайтарғанда, олар осында көрінеді.',
    viewNew: 'Жаңалықтарды көру',
    myRoadmap: 'Менің Roadmap-ым',
    stepProgress: (current: number, total: number) => `${current}/${total} қадам`,
    offerBadge: 'ОФФЕР',
    personal: 'Жеке',
    noOfferTitle: 'Жеке оффер әзірге қолжетімсіз',
    noOfferDescription: 'API лайықты ұсыныс тапқанда, ол осында пайда болады.',
    noOfferHighlight: 'Қазір профиліңіз үшін белсенді ұсыныс жоқ.',
    expiresIn: 'Аяқталуына:',
    hoursShort: 'сағ',
    minutesShort: 'мин',
    quickActions: 'Жылдам әрекеттер',
    loadRecommendationsError: 'Ұсыныстарды жүктеу мүмкін болмады. Қайта көріңіз.',
    partialDataError: 'Жеке деректердің бір бөлігі қолжетімсіз. Кей бөлімдер уақытша бос болуы мүмкін.',
    loadOfferError: 'Жеке офферді жүктеу мүмкін болмады. Қалған деректер көрсетіліп тұр.',
    offerAccent: 'ОФФЕР',
    offerDetails: 'Толығырақ',
  },
  en: {
    points: 'points',
    pointsShort: 'pts',
    buyFor: (amount: number) => `Buy for ${amount.toLocaleString('en-US')} ₸`,
    untilTier: (tier: string, points: number) => `To ${tier}: ${points} points`,
    match: (value: number) => `${value}% match`,
    addToCart: 'Add to cart',
    preferences: 'My preferences',
    affectsRecommendations: 'affects recommendations',
    skinType: 'Skin type',
    goals: 'My goals',
    updating: 'Updating...',
    updateRecommendations: 'Update recommendations',
    selectSkinAndGoal: 'Choose a skin type and at least one goal',
    setupTitle: "Let's set up your personalization",
    setupDescription: 'Answer two quick questions and the platform will immediately tailor recommendations to you.',
    whatSkinType: 'What is your skin type?',
    next: 'Next',
    goalsTitle: 'What are your goals?',
    goalsDescription: 'You can choose several, and recommendations plus roadmap will adapt automatically.',
    back: 'Back',
    saving: 'Saving...',
    showRecommendations: 'Show my recommendations',
    confirmEmail: 'Confirm your email',
    confirmEmailDescription: (email: string) => `We sent a confirmation link to ${email}. Confirm it to finish account setup.`,
    sending: 'Sending...',
    resendEmail: 'Send again',
    ready: 'Ready',
    profile: 'Profile',
    roadmap: 'Roadmap',
    soon: 'Soon',
    active: 'Active',
    waiting: 'Waiting',
    catalog: 'Catalog',
    profileConfigured: 'Profile configured',
    profileConfiguredDescription: 'Skin type and goals already affect personalization.',
    refineProfile: 'Refine profile',
    refineProfileDescription: 'Add skin type and goals to make recommendations more precise.',
    nextRoadmapStep: 'Next roadmap step',
    roadmapBuilding: 'Roadmap is being prepared',
    roadmapBuildingDescription: 'When the plan is ready, the next step will appear here.',
    currentPersonalOffer: 'Current personal offer',
    offerWillAppear: 'Offer will appear later',
    offerWillAppearDescription: 'When an offer is assigned to you, it will be shown here.',
    cartRecommendation: 'Cart recommendation',
    cartRecommendationDescription: (name: string, points: number) => `${name} · +${points} points after purchase`,
    recommendationsLoading: 'Recommendations are loading',
    recommendationsLoadingDescription: 'As soon as the API returns personal products, they will appear here.',
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    personalRecommendation: 'Personal recommendation',
    suitableForSkin: (value: string) => `Suitable for ${value.toLowerCase()} skin`,
    complementsPurchases: 'Complements your previous purchases',
    popularForProfiles: 'Popular among similar profiles',
    selectionByType: (value: string) => `Matched by ${value.toLowerCase()} type`,
    selectionByCategory: (value: string) => `Matched by ${value.toLowerCase()} category`,
    underYourProfile: 'Matched to your profile',
    intensity: (value: string) => `Intensity: ${value.toLowerCase()}`,
    actives: (value: string) => `Actives: ${value}`,
    blendsWithPurchases: 'Pairs well with your previous purchases',
    chosenBySimilarUsers: 'Often chosen by users with a similar profile',
    openProductForDetails: 'Open the product page for details and usage instructions',
    productFallback: (id: string) => `Product #${id}`,
    fallbackRoadmapTitle: 'Add a toner to your routine',
    fallbackRoadmapDescription: 'You completed cleansing. The next step helps balance the skin and prepare it for hydration.',
    fallbackRoadmapWhy: 'This stage naturally follows cleansing and helps you see routine results faster.',
    fallbackRoadmapSteps: ['Cleanse', 'Toner', 'Hydration', 'SPF', 'Special care'],
    openRoadmapStep: 'Open the roadmap to see the next step.',
    stepLabel: (step: number) => `Step ${step}`,
    roadmapStepTitle: 'Next roadmap step',
    personalOfferTitle: 'Personal offer',
    discountOnType: (value: string, label: string) => `${value}% off ${label.toLowerCase()}`,
    discountOnCategory: (value: string, label: string) => `${value}% off ${label.toLowerCase()}`,
    discountForYou: (value: string) => `${value}% off for you`,
    pointsMultiplier: (value: string) => `x${value} points on your next purchase`,
    giftWithOrder: 'Gift with order',
    offerAvailable: 'A personal offer is available right now.',
    offerAutoCart: (amount: number) => `Applied automatically to the next cart from ${amount.toLocaleString('en-US')} ₸.`,
    offerCategoryScope: (value: string) => `The offer applies to the “${value}” category.`,
    offerTypeScope: (value: string) => `The offer applies to products of type “${value}”.`,
    offerProductScope: (value: string) => `It will work for the recommended product type “${value}”.`,
    offerRoadmapScope: (value: string) => `The offer is tied to the roadmap and supports the “${value}” step.`,
    offerBoundToProfile: 'The offer is already attached to your profile.',
    offerSaving: (amount: number, saving: number) => `On a ${amount.toLocaleString('en-US')} ₸ cart you save ${saving.toLocaleString('en-US')} ₸`,
    offerAutoDiscount: (value: string) => `${value}% discount will be applied automatically to an eligible purchase`,
    offerAutoPoints: (value: string) => `Get x${value} points on your next eligible purchase`,
    offerAutoGift: 'The gift will be added automatically when the offer conditions are met',
    recommendationsUpdated: 'Recommendations updated!',
    saveSettingsError: 'Could not save settings.',
    recommendationsPersonalized: 'Recommendations personalized!',
    savePersonalizationError: 'Could not save personalization.',
    emailAlreadyVerified: 'Email is already verified.',
    emailSent: (email: string) => `Confirmation email sent to ${email}.`,
    emailSendError: 'Could not send the confirmation email.',
    addedToCart: 'Added to cart!',
    cartNowHas: (count: number) => `There are now ${count} items in the cart.`,
    pointsAfterPurchase: (points: number) => `+${points} points after purchase`,
    addToCartError: 'Could not add product to cart',
    updateCartError: 'Could not update cart',
    personalCenter: 'Personal hub',
    hello: (name: string) => `Hi, ${name} ✦`,
    defaultName: 'Ayala',
    loadingPersonalData: 'Loading personal data...',
    retry: 'Retry',
    nextStep: 'Your next step',
    whyNow: 'Why now',
    goToStep: 'Go to step',
    specialForYou: 'Special for you',
    basedOn: (skinType: string, goals: string[]) => `Based on: ${skinType.toLowerCase()} skin · ${goals.join(', ').toLowerCase()}`,
    all: 'All',
    personalRecommendationsBuilding: 'Personal recommendations are being prepared',
    personalRecommendationsBuildingDescription: 'When the API collects products for your profile and roadmap, they will appear in this block.',
    openCatalog: 'Open catalog',
    trendingForYou: 'Trending for you',
    trendingDescription: 'Popular among Gold users with a similar profile',
    trendsPending: 'Trends for your profile are not ready yet',
    trendsPendingDescription: 'As soon as the backend returns popular products for similar users, they will appear here.',
    viewNew: 'View new arrivals',
    myRoadmap: 'My roadmap',
    stepProgress: (current: number, total: number) => `Step ${current}/${total}`,
    offerBadge: 'OFFER',
    personal: 'Personal',
    noOfferTitle: 'Personal offer is not available yet',
    noOfferDescription: 'When the API finds a suitable offer, it will appear here.',
    noOfferHighlight: 'There is no active offer for your profile right now.',
    expiresIn: 'Expires in:',
    hoursShort: 'h',
    minutesShort: 'min',
    quickActions: 'Quick actions',
    loadRecommendationsError: 'Could not load recommendations. Please try again.',
    partialDataError: 'Some personal data is unavailable. Some recommendation sections may be temporarily empty.',
    loadOfferError: 'Could not load the personal offer. Other data is still shown.',
    offerAccent: 'OFFER',
    offerDetails: 'Learn more',
  },
} as const;

const forYouLocale: Record<AppLanguage, string> = {
  ru: 'ru-RU',
  kk: 'kk-KZ',
  en: 'en-US',
};

type ForYouCopy = (typeof forYouPageCopy)[AppLanguage];

// ─── Mock Data ───────────────────────────────────────────────────────────────

const SKIN_TYPES = ['Жирная', 'Комбинированная', 'Сухая', 'Нормальная', 'Чувствительная'];
const GOALS = ['Увлажнение', 'Сияние', 'Антивозрастной', 'Очищение', 'Выравнивание тона', 'Защита SPF'];

const SKIN_TYPE_UI_TO_API: Record<string, string> = {
  'Жирная': 'oily',
  'Комбинированная': 'combination',
  'Сухая': 'dry',
  'Нормальная': 'normal',
  'Чувствительная': 'sensitive',
};

const SKIN_TYPE_API_TO_UI: Record<string, string> = {
  oily: 'Жирная',
  combination: 'Комбинированная',
  dry: 'Сухая',
  normal: 'Нормальная',
  sensitive: 'Чувствительная',
};

const GOAL_UI_TO_API: Record<string, string> = {
  'Увлажнение': 'hydration',
  'Сияние': 'glow',
  'Антивозрастной': 'anti_aging',
  'Очищение': 'cleansing',
  'Выравнивание тона': 'even_tone',
  'Защита SPF': 'spf',
};

const GOAL_API_TO_UI: Record<string, string> = {
  hydration: 'Увлажнение',
  moisturizing: 'Увлажнение',
  glow: 'Сияние',
  brightening: 'Сияние',
  anti_aging: 'Антивозрастной',
  aging: 'Антивозрастной',
  cleansing: 'Очищение',
  acne: 'Очищение',
  even_tone: 'Выравнивание тона',
  pigmentation: 'Выравнивание тона',
  spf: 'Защита SPF',
  sun_protection: 'Защита SPF',
};

type RecommendationCard = {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  pointsEarned: number;
  recommendationScore?: number;
  whyRecommended: string;
  whatImproves: string;
  expectedBenefit: string;
  section: string;
};

const FALLBACK_RECOMMENDATION_IMAGE = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([key]) => key);
  }

  return [];
};

const toTextList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const firstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item.trim().length > 0) {
          return item.trim();
        }
      }
    }
  }

  return undefined;
};

const formatCategoryLabel = (value: unknown, language: 'ru' | 'kk' | 'en'): string | undefined => {
  return formatCatalogCategoryLabel(value, language);
};

const formatProductTypeLabel = (value: unknown, language: 'ru' | 'kk' | 'en'): string | undefined => {
  return formatCatalogProductTypeLabel(value, language);
};

const formatOfferValueLabel = (value: number): string => {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(1);
};

const isAuthError = (error: unknown): error is ApiError =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);

type PersonalOfferCard = {
  assignmentId?: number;
  title: string;
  description: string;
  highlight: string;
  expiresAt: Date | null;
};

type RoadmapLikeStep = RoadmapStepApi | RoadmapStepSnapshotApi;

type RoadmapOverview = {
  nextStepId?: number;
  nextStepTitle: string;
  nextStepDescription: string;
  nextStepWhy: string;
  nextStepPoints?: number;
  currentStepIndex: number;
  totalSteps: number;
  progressPercent: number;
  steps: Array<{
    key: string;
    title: string;
    state: 'completed' | 'current' | 'pending';
    stepIndex: number;
  }>;
};

type SidebarQuickAction = {
  key: string;
  title: string;
  description: string;
  accent: string;
  done?: boolean;
  muted?: boolean;
};

const buildFallbackRoadmapOverview = (copy: ForYouCopy): RoadmapOverview => ({
  nextStepTitle: copy.fallbackRoadmapTitle,
  nextStepDescription: copy.fallbackRoadmapDescription,
  nextStepWhy: copy.fallbackRoadmapWhy,
  nextStepPoints: 89,
  currentStepIndex: 2,
  totalSteps: 5,
  progressPercent: 20,
  steps: copy.fallbackRoadmapSteps.map((title, index) => ({
    key: `roadmap-fallback-${index + 1}`,
    title,
    state: index === 0 ? 'completed' : index === 1 ? 'current' : 'pending',
    stepIndex: index + 1,
  })),
});

const buildPersonalOfferCard = (
  value: Record<string, unknown>,
  copy: ForYouCopy,
  language: 'ru' | 'kk' | 'en',
): PersonalOfferCard | null => {
  const offer = isRecord(value.offer) ? value.offer : null;
  if (!offer) {
    return null;
  }

  const target = isRecord(value.target) ? value.target : {};
  const reason = isRecord(value.reason) ? value.reason : {};

  const offerType = firstString(offer.type);
  const offerName = firstString(offer.name);
  const offerValue = toNumber(offer.value);
  const assignmentId = toNumber(value.assignment_id);
  const categoryLabel = formatCategoryLabel(target.category, language);
  const productTypeLabel = formatProductTypeLabel(target.product_type, language);
  const scope = firstString(target.scope);
  const minBasketAmount = toNumber(
    value.base_amount ??
      value.min_basket_amount ??
      target.min_basket_amount,
  );
  const savingAmount = toNumber(value.saving_amount ?? value.discount_amount);
  const roadmapReason = isRecord(reason.roadmap) ? reason.roadmap : null;

  let title = offerName ?? copy.personalOfferTitle;
  if (offerType === 'discount' && offerValue !== undefined) {
    const valueLabel = formatOfferValueLabel(offerValue);
    if (productTypeLabel) {
      title = copy.discountOnType(valueLabel, productTypeLabel);
    } else if (categoryLabel) {
      title = copy.discountOnCategory(valueLabel, categoryLabel);
    } else {
      title = copy.discountForYou(valueLabel);
    }
  } else if (offerType === 'points_multiplier' && offerValue !== undefined) {
    title = copy.pointsMultiplier(formatOfferValueLabel(offerValue));
  } else if (offerType === 'gift') {
    title = offerName ?? copy.giftWithOrder;
  }

  let description = copy.offerAvailable;
  if (scope === 'cart' && minBasketAmount !== undefined) {
    description = copy.offerAutoCart(minBasketAmount);
  } else if (scope === 'category' && categoryLabel) {
    description = copy.offerCategoryScope(categoryLabel);
  } else if (scope === 'product_type' && productTypeLabel) {
    description = copy.offerTypeScope(productTypeLabel);
  } else if (scope === 'product_id' && productTypeLabel) {
    description = copy.offerProductScope(productTypeLabel);
  } else if (roadmapReason && productTypeLabel) {
    description = copy.offerRoadmapScope(productTypeLabel);
  }

  let highlight = copy.offerBoundToProfile;
  if (savingAmount !== undefined && minBasketAmount !== undefined) {
    highlight = copy.offerSaving(minBasketAmount, savingAmount);
  } else if (offerType === 'discount' && offerValue !== undefined) {
    highlight = copy.offerAutoDiscount(formatOfferValueLabel(offerValue));
  } else if (offerType === 'points_multiplier' && offerValue !== undefined) {
    highlight = copy.offerAutoPoints(formatOfferValueLabel(offerValue));
  } else if (offerType === 'gift') {
    highlight = copy.offerAutoGift;
  }

  const expiresAtRaw = firstString(value.expires_at);
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

  return {
    assignmentId: assignmentId !== undefined ? Math.round(assignmentId) : undefined,
    title,
    description,
    highlight,
    expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
  };
};

const isCompletedRoadmapStatus = (value: unknown): boolean =>
  value === 'completed' || value === 'owned' || value === 'skipped';

const getRoadmapStepPresentationPayload = (value: unknown): RoadmapStepPresentationApi | null =>
  isRecord(value) ? (value as RoadmapStepPresentationApi) : null;

const pickRoadmapNextStep = (plan: RoadmapPlanApi): RoadmapLikeStep | null => {
  const steps = Array.isArray(plan.steps) ? plan.steps : [];
  const summary = isRecord(plan.summary) ? (plan.summary as RoadmapSummaryApi) : null;
  const summaryNextStep = summary && isRecord(summary.next_step)
    ? (summary.next_step as RoadmapStepSnapshotApi)
    : null;

  const nextStepId =
    typeof summaryNextStep?.id === 'number'
      ? summaryNextStep.id
      : typeof summaryNextStep?.step_id === 'number'
        ? summaryNextStep.step_id
        : undefined;
  const nextStepIndex = toNumber(summaryNextStep?.step_index);

  if (steps.length > 0 && (nextStepId !== undefined || nextStepIndex !== undefined)) {
    const matchedStep = steps.find((step) =>
      isRecord(step) &&
      (
        (nextStepId !== undefined && (step.id === nextStepId || step.step_id === nextStepId)) ||
        (nextStepId === undefined && nextStepIndex !== undefined && step.step_index === nextStepIndex)
      ),
    );

    if (matchedStep && isRecord(matchedStep)) {
      return matchedStep as RoadmapStepApi;
    }
  }

  if (summaryNextStep) {
    return summaryNextStep;
  }

  const fallbackStep = steps.find(
    (step) =>
      isRecord(step) &&
      (step.status === 'missing' || step.status === 'recommended'),
  );

  return fallbackStep && isRecord(fallbackStep) ? (fallbackStep as RoadmapStepApi) : null;
};

const buildRoadmapOverview = (
  plan: RoadmapPlanApi | null,
  copy: ForYouCopy,
  language: AppLanguage,
): RoadmapOverview | null => {
  if (!plan) {
    return null;
  }

  const rawSteps = Array.isArray(plan.steps)
    ? plan.steps.filter((step): step is RoadmapStepApi => isRecord(step))
    : [];
  const summary = isRecord(plan.summary) ? (plan.summary as RoadmapSummaryApi) : null;
  const nextStep = pickRoadmapNextStep(plan);

  if (!nextStep && rawSteps.length === 0) {
    return null;
  }

  const totalSteps = Math.max(0, Math.round(toNumber(summary?.total_steps) ?? rawSteps.length));
  const missingStepsCount = toNumber(summary?.missing_steps_count);
  const completedCount = missingStepsCount !== undefined && totalSteps > 0
    ? Math.max(0, totalSteps - Math.round(missingStepsCount))
    : rawSteps.filter((step) => isCompletedRoadmapStatus(step.status)).length;

  const nextStepId =
    typeof nextStep?.id === 'number'
      ? nextStep.id
      : typeof nextStep?.step_id === 'number'
        ? nextStep.step_id
        : undefined;
  const currentStepIndex = Math.max(
    1,
    Math.round(
      toNumber(nextStep?.step_index) ??
        (completedCount < totalSteps ? completedCount + 1 : totalSteps || 1),
    ),
  );
  const currentProductType = firstString(nextStep?.product_type);
  const nextStepPresentation = getRoadmapStepPresentationPayload(nextStep?.presentation);
  const fallbackStepMeta = currentProductType
    ? getRoadmapStepMeta(currentProductType, language)
    : DEFAULT_ROADMAP_STEP_META;
  const stepMeta = {
    points: toNumber(nextStepPresentation?.points) ?? fallbackStepMeta.points,
    why: firstString(nextStepPresentation?.why) ?? fallbackStepMeta.why,
    improves: firstString(nextStepPresentation?.improves) ?? fallbackStepMeta.improves,
    benefit: firstString(nextStepPresentation?.benefit) ?? fallbackStepMeta.benefit,
  };
  const recommendedProduct = nextStep && isRecord(nextStep.recommended_product)
    ? nextStep.recommended_product
    : null;

  const stepsForUi = rawSteps.slice(0, 5).map((step, index) => {
    const stepIndex = Math.max(1, Math.round(toNumber(step.step_index) ?? index + 1));
    const stepId = typeof step.id === 'number' ? step.id : undefined;
    const stepPresentation = getRoadmapStepPresentationPayload(step.presentation);
    const isCurrent =
      (nextStepId !== undefined && stepId === nextStepId) ||
      (nextStepId === undefined && stepIndex === currentStepIndex && !isCompletedRoadmapStatus(step.status));

    return {
      key: stepId !== undefined ? `roadmap-step-${stepId}` : `roadmap-step-${stepIndex}`,
      title:
        firstString(stepPresentation?.title, step.title, formatProductTypeLabel(step.product_type, language), copy.stepLabel(stepIndex)) ??
        copy.stepLabel(stepIndex),
      state: isCurrent ? 'current' : isCompletedRoadmapStatus(step.status) ? 'completed' : 'pending',
      stepIndex,
    };
  });

  return {
    nextStepId,
    nextStepTitle:
      firstString(nextStepPresentation?.title, nextStep?.title, formatProductTypeLabel(nextStep?.product_type, language)) ??
      copy.roadmapStepTitle,
    nextStepDescription:
      firstString(nextStepPresentation?.description, nextStep?.description) ??
      copy.openRoadmapStep,
    nextStepWhy:
      firstString(toTextList(nextStep?.why), stepMeta.why) ??
      stepMeta.why,
    nextStepPoints:
      toNumber(recommendedProduct?.points_earned) ??
      stepMeta.points,
    currentStepIndex,
    totalSteps,
    progressPercent:
      totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0,
    steps: stepsForUi.length > 0 ? stepsForUi : buildFallbackRoadmapOverview(copy).steps,
  };
};

const buildSidebarQuickActions = ({
  skinType,
  goals,
  roadmapPlan,
  roadmapOverview,
  personalOffer,
  recommendations,
  trendingRecommendations,
  copy,
}: {
  skinType: string;
  goals: string[];
  roadmapPlan: RoadmapPlanApi | null;
  roadmapOverview: RoadmapOverview;
  personalOffer: PersonalOfferCard | null;
  recommendations: RecommendationCard[];
  trendingRecommendations: RecommendationCard[];
  copy: ForYouCopy;
}): SidebarQuickAction[] => {
  const profileConfigured = Boolean(skinType.trim()) && goals.length > 0;
  const topRecommendation = recommendations[0] ?? trendingRecommendations[0] ?? null;
  const hasRoadmap = roadmapPlan !== null && roadmapOverview.totalSteps > 0;

  return [
    profileConfigured
      ? {
          key: 'profile',
          title: copy.profileConfigured,
          description: copy.profileConfiguredDescription,
          accent: copy.ready,
          done: true,
        }
      : {
          key: 'profile',
          title: copy.refineProfile,
          description: copy.refineProfileDescription,
          accent: copy.profile,
        },
    hasRoadmap
      ? {
          key: 'roadmap',
          title: copy.nextRoadmapStep,
          description: roadmapOverview.nextStepTitle,
          accent: roadmapOverview.nextStepPoints ? `+${roadmapOverview.nextStepPoints}` : copy.roadmap,
        }
      : {
          key: 'roadmap',
          title: copy.roadmapBuilding,
          description: copy.roadmapBuildingDescription,
          accent: copy.soon,
          muted: true,
        },
    personalOffer
      ? {
          key: 'offer',
          title: copy.currentPersonalOffer,
          description: personalOffer.highlight,
          accent: copy.active,
        }
      : {
          key: 'offer',
          title: copy.offerWillAppear,
          description: copy.offerWillAppearDescription,
          accent: copy.waiting,
          muted: true,
        },
    topRecommendation
      ? {
          key: 'recommendation',
          title: copy.cartRecommendation,
          description: copy.cartRecommendationDescription(topRecommendation.name, topRecommendation.pointsEarned),
          accent: `+${topRecommendation.pointsEarned}`,
        }
      : {
          key: 'recommendation',
          title: copy.recommendationsLoading,
          description: copy.recommendationsLoadingDescription,
          accent: copy.catalog,
          muted: true,
        },
  ];
};

const loadForYouRoadmap = async (): Promise<RoadmapPlanApi | null> => {
  try {
    return await getRoadmap();
  } catch (error) {
    if (isAuthError(error)) {
      throw error;
    }

    return null;
  }
};

const mapApiSkinTypeToUi = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  return SKIN_TYPE_API_TO_UI[value.toLowerCase()] ?? null;
};

const mapUiSkinTypeToApi = (value: string): string =>
  SKIN_TYPE_UI_TO_API[value] ?? 'normal';

const mapApiGoalsToUi = (value: unknown): string[] => {
  const mapped = toStringArray(value)
    .map((goal) => GOAL_API_TO_UI[goal.toLowerCase()] ?? null)
    .filter((goal): goal is string => Boolean(goal));

  return Array.from(new Set(mapped));
};

const mapUiGoalsToApi = (value: string[]): string[] => {
  const mapped = value
    .map((goal) => GOAL_UI_TO_API[goal] ?? null)
    .filter((goal): goal is string => Boolean(goal));

  return Array.from(new Set(mapped));
};

const formatTierLabel = (value: string, copy: ForYouCopy): string => {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'bronze') {
    return copy.bronze;
  }
  if (normalized === 'silver') {
    return copy.silver;
  }
  if (normalized === 'gold') {
    return copy.gold;
  }
  return copy.gold;
};

type HomeResultItem = { item: unknown; sectionKey?: string };

const extractHomeResults = (response: HomeRecsResponse): HomeResultItem[] => {
  if (Array.isArray(response)) {
    return response.map((item) => ({ item }));
  }
  if (response && typeof response === 'object') {
    const record = response as {
      results?: unknown[];
      sections?: Array<{ key?: unknown; results?: unknown[] }>;
    };

    if (Array.isArray(record.sections)) {
      return record.sections.flatMap((section) => {
        if (!Array.isArray(section.results)) {
          return [];
        }

        const sectionKey = typeof section.key === 'string' ? section.key : undefined;
        return section.results.map((item) => ({ item, sectionKey }));
      });
    }

    if (Array.isArray(record.results)) {
      return record.results.map((item) => ({ item }));
    }
  }
  return [];
};

const formatFreeTextLabel = (value: unknown): string | undefined => {
  return formatCatalogFreeTextLabel(value);
};

const resolveRecommendationSection = (source: Record<string, unknown>, sectionKey?: string): string => {
  if (sectionKey) {
    return sectionKey;
  }

  if (typeof source.section === 'string' && source.section.trim().length > 0) {
    return source.section.trim();
  }

  return 'for_you';
};

const buildRecommendationWhy = (
  source: Record<string, unknown>,
  product: Record<string, unknown>,
  section: string,
  copy: ForYouCopy,
  language: 'ru' | 'kk' | 'en',
): string => {
  const whySource = source.why;
  const whyList = Array.isArray(whySource)
    ? whySource.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : [];

  if (typeof whySource === 'string' && whySource.trim().length > 0) {
    return localizeRecommendationReason(whySource, language) ?? whySource.trim();
  }
  if (whyList.length > 0) {
    return whyList
      .slice(0, 2)
      .map((reason) => localizeRecommendationReason(reason, language) ?? reason.trim())
      .join(' · ');
  }
  const whyRecommendedRaw = source.whyRecommended ?? source.why_recommended;
  if (typeof whyRecommendedRaw === 'string' && whyRecommendedRaw.trim().length > 0) {
    return localizeRecommendationReason(whyRecommendedRaw, language) ?? whyRecommendedRaw.trim();
  }

  const supportedSkinType = toStringArray(product.supported_skin_types)[0];
  const supportedSkinTypeLabel =
    typeof supportedSkinType === 'string'
      ? formatCatalogTokenLabel(supportedSkinType, language) ??
        SKIN_TYPE_API_TO_UI[supportedSkinType] ??
        formatFreeTextLabel(supportedSkinType)
      : undefined;
  const productTypeLabel = formatProductTypeLabel(product.product_type, language);
  const categoryLabel = formatCategoryLabel(product.category, language);

  if (supportedSkinTypeLabel) {
    return copy.suitableForSkin(supportedSkinTypeLabel);
  }
  if (section === 'because_you_bought') {
    return copy.complementsPurchases;
  }
  if (section === 'trending') {
    return copy.popularForProfiles;
  }
  if (productTypeLabel) {
    return copy.selectionByType(productTypeLabel);
  }
  if (categoryLabel) {
    return copy.selectionByCategory(categoryLabel);
  }
  return copy.personalRecommendation;
};

const buildRecommendationImprovement = (
  source: Record<string, unknown>,
  product: Record<string, unknown>,
  copy: ForYouCopy,
  language: 'ru' | 'kk' | 'en',
): string => {
  const whatImprovesRaw = source.whatImproves ?? source.what_improves;
  if (typeof whatImprovesRaw === 'string' && whatImprovesRaw.trim().length > 0) {
    const raw = whatImprovesRaw.trim();
    return formatCatalogTokenLabel(raw, language) ?? localizeRecommendationReason(raw, language) ?? raw;
  }

  const firstConcern = formatCatalogTokenLabel(toStringArray(product.concerns)[0], language);
  if (firstConcern) {
    return firstConcern;
  }

  const firstActive = formatCatalogTokenLabel(toStringArray(product.actives)[0], language);
  if (firstActive) {
    return firstActive;
  }

  const productTypeLabel = formatProductTypeLabel(product.product_type, language);
  if (productTypeLabel) {
    return productTypeLabel;
  }

  const categoryLabel = formatCategoryLabel(product.category, language);
  return categoryLabel ?? copy.underYourProfile;
};

const buildRecommendationBenefit = (
  source: Record<string, unknown>,
  product: Record<string, unknown>,
  section: string,
  copy: ForYouCopy,
  language: 'ru' | 'kk' | 'en',
): string => {
  const expectedBenefitRaw = source.expectedBenefit ?? source.expected_benefit;
  if (typeof expectedBenefitRaw === 'string' && expectedBenefitRaw.trim().length > 0) {
    const raw = expectedBenefitRaw.trim();
    const strength = formatCatalogStrengthLabel(raw, language);
    return strength
      ? copy.intensity(strength)
      : formatCatalogTokenLabel(raw, language) ?? localizeRecommendationReason(raw, language) ?? raw;
  }

  const strengthLabel = formatCatalogStrengthLabel(product.strength, language);
  if (strengthLabel) {
    return copy.intensity(strengthLabel);
  }

  const actives = formatCatalogTokenList(toStringArray(product.actives).slice(0, 2), language);
  if (actives.length > 0) {
    return copy.actives(actives.join(', '));
  }

  if (section === 'because_you_bought') {
    return copy.blendsWithPurchases;
  }
  if (section === 'trending') {
    return copy.chosenBySimilarUsers;
  }

  return copy.openProductForDetails;
};

const normalizeRec = (
  item: unknown,
  index: number,
  sectionKey: string | undefined,
  copy: ForYouCopy,
  language: 'ru' | 'kk' | 'en',
): RecommendationCard => {
  const source = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
  const product = (
    source.product && typeof source.product === 'object' ? source.product : source
  ) as Record<string, unknown>;
  const section = resolveRecommendationSection(source, sectionKey);
  const fallbackId = `rec-${section}-${index + 1}`;

  const id = String(product.id ?? source.id ?? fallbackId);
  const price = toNumber(product.price ?? source.price) ?? 0;
  const originalPrice = toNumber(product.original_price ?? source.original_price ?? source.originalPrice);
  const score = recommendationScoreToPercent(
    source.score ?? source.recommendationScore ?? product.recommendation_score,
    source.components,
  );
  const pointsEarned =
    toNumber(product.points_earned ?? source.points_earned ?? source.pointsEarned) ??
    Math.max(0, Math.round(price * 0.01));
  const whyRecommended = buildRecommendationWhy(source, product, section, copy, language);

  return {
    id,
    name:
      (typeof product.name === 'string' && product.name) ||
      (typeof source.name === 'string' && source.name) ||
      copy.productFallback(id),
    brand:
      (typeof product.brand === 'string' && product.brand) ||
      (typeof source.brand === 'string' && source.brand) ||
      'Uilesim',
    price,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
    image:
      (typeof product.image_url === 'string' && product.image_url) ||
      (Array.isArray(product.image_urls) && typeof product.image_urls[0] === 'string' ? product.image_urls[0] : undefined) ||
      (typeof product.image === 'string' && product.image) ||
      (typeof source.image_url === 'string' && source.image_url) ||
      (typeof source.image === 'string' && source.image) ||
      FALLBACK_RECOMMENDATION_IMAGE,
    pointsEarned: Math.max(0, Math.round(pointsEarned)),
    recommendationScore: score,
    whyRecommended,
    whatImproves: buildRecommendationImprovement(source, product, copy, language),
    expectedBenefit: buildRecommendationBenefit(source, product, section, copy, language),
    section,
  };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoyaltyProgressMini({ points, tier }: { points: number; tier: string }) {
  const { language } = useI18n();
  const copy = forYouPageCopy[language];
  const tiers = [
    { name: copy.bronze, key: 'bronze', min: 0, max: 500, color: '#CD7F32' },
    { name: copy.silver, key: 'silver', min: 500, max: 1000, color: '#9CA3AF' },
    { name: copy.gold, key: 'gold', min: 1000, max: 1500, color: '#F59E0B' },
  ];
  const currentTier = tiers.find(t => t.key === tier) || tiers[2];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progress = nextTier
    ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;
  const toNext = nextTier ? nextTier.min - points : 0;

  return (
    <div className="p-5 bg-white rounded-2xl border border-[#EAE6EF]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF4DB8]" />
          <span className="text-sm font-semibold text-[#111827]">{points.toLocaleString(forYouLocale[language])} {copy.points}</span>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${currentTier.color}20`, color: currentTier.color }}
        >
          {currentTier.name}
        </span>
      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, progress)}%`, backgroundColor: currentTier.color }}
        />
      </div>

      {nextTier && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">
            {copy.untilTier(nextTier.name, toNext)}
          </p>
          <p className="text-[10px] text-[#6B7280]">{copy.buyFor(Math.ceil(toNext / 0.01))}</p>
        </div>
      )}
    </div>
  );
}

interface EnhancedRecCardProps {
  product: RecommendationCard;
  cartQuantity: number;
  onAdd: (product: RecommendationCard, quantity: number) => Promise<void>;
  onSetQuantity: (product: RecommendationCard, quantity: number) => Promise<void>;
  onProductClick?: (product: RecommendationCard) => void;
}

function EnhancedRecCard({ product, cartQuantity, onAdd, onSetQuantity, onProductClick }: EnhancedRecCardProps) {
  const { language } = useI18n();
  const copy = forYouPageCopy[language];
  const [isCartPending, setIsCartPending] = useState(false);
  const inCart = cartQuantity > 0;
  const qty = inCart ? cartQuantity : 1;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCartPending) {
      return;
    }

    setIsCartPending(true);
    try {
      await onAdd(product, 1);
    } finally {
      setIsCartPending(false);
    }
  };

  const handleQuantityChange = async (nextQuantity: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (isCartPending) {
      return;
    }

    setIsCartPending(true);
    try {
      await onSetQuantity(product, nextQuantity);
    } finally {
      setIsCartPending(false);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="block group" onClick={() => onProductClick?.(product)}>
      <div className="bg-white rounded-2xl border border-[#EAE6EF] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.recommendationScore !== undefined && product.recommendationScore > 0 ? (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-white/95 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3 h-3 text-[#FF4DB8]" />
              <span className="text-[10px] font-semibold text-[#111827]">{copy.match(product.recommendationScore)}</span>
            </div>
          ) : null}
        </div>

        <div className="p-4">
          {/* Why chip */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFE1F2] text-[#FF4DB8] text-[10px] font-medium">
              • {product.whyRecommended}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[#6B7280] text-[10px]">
              ↑ {product.whatImproves}
            </span>
          </div>

          <p className="text-[10px] text-[#6B7280] mb-0.5">{product.brand}</p>
          <h3 className="text-sm font-semibold text-[#111827] mb-1 line-clamp-2">{product.name}</h3>

          {/* Expected benefit */}
          <p className="text-[10px] text-[#6B7280] mb-3 flex items-center gap-1">
            <Clock className="w-3 h-3 flex-shrink-0" />
            {product.expectedBenefit}
          </p>

          {/* Price + points */}
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-[#111827]">{product.price.toLocaleString(forYouLocale[language])} ₸</span>
              {product.originalPrice && (
                <span className="text-xs text-[#6B7280] line-through">{product.originalPrice.toLocaleString(forYouLocale[language])} ₸</span>
              )}
            </div>
            <span className="text-[10px] text-[#FF4DB8] font-medium">+{product.pointsEarned} {copy.pointsShort}</span>
          </div>

          {inCart ? (
            <div
              onClick={e => e.preventDefault()}
              className="flex items-center justify-between h-10 rounded-xl border-2 border-brand-pink-500 overflow-hidden"
            >
              <button
                onClick={(e) => handleQuantityChange(qty - 1, e)}
                disabled={isCartPending}
                className="flex-1 h-full flex items-center justify-center text-brand-pink-500 hover:bg-brand-pink-100/60 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold text-brand-pink-500 text-sm">{qty}</span>
              <button
                onClick={(e) => handleQuantityChange(qty + 1, e)}
                disabled={isCartPending}
                className="flex-1 h-full flex items-center justify-center text-brand-pink-500 hover:bg-brand-pink-100/60 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isCartPending}
              className="w-full h-10 rounded-xl bg-brand-pink-500 text-white text-xs font-medium hover:bg-brand-pink-600 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {copy.addToCart}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

// Quick Prefs Panel
function QuickPrefsPanel({
  skinType, setSkinType, goals, setGoals, onSave, isSaving, skinTypeOptions, goalOptions,
}: {
  skinType: string;
  setSkinType: (v: string) => void;
  goals: string[];
  setGoals: (v: string[]) => void;
  onSave: () => void;
  isSaving: boolean;
  skinTypeOptions: string[];
  goalOptions: string[];
}) {
  const { language } = useI18n();
  const copy = forYouPageCopy[language];
  const toggleGoal = (g: string) => {
    setGoals(goals.includes(g) ? goals.filter(x => x !== g) : [...goals, g]);
  };

  return (
    <div className="p-5 bg-white rounded-2xl border border-[#EAE6EF]">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-4 h-4 text-[#6B7280]" />
        <span className="text-sm font-semibold text-[#111827]">{copy.preferences}</span>
        <span className="ml-auto text-[10px] text-[#6B7280] bg-gray-100 px-2 py-0.5 rounded-full">{copy.affectsRecommendations}</span>
      </div>

      <div className="mb-4">
        <p className="text-xs text-[#6B7280] font-medium mb-2">{copy.skinType}</p>
        <div className="flex flex-wrap gap-1.5">
          {skinTypeOptions.map(s => (
            <button
              key={s}
              onClick={() => setSkinType(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                skinType === s
                  ? 'bg-brand-pink-500 text-white'
                  : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
              }`}
            >
              {skinType === s && <Check className="w-3 h-3 inline mr-1" />}
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-[#6B7280] font-medium mb-2">{copy.goals}</p>
        <div className="flex flex-wrap gap-1.5">
          {goalOptions.map(g => (
            <button
              key={g}
              onClick={() => toggleGoal(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                goals.includes(g)
                  ? 'bg-[#FF4DB8] text-white'
                  : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
              }`}
            >
              {goals.includes(g) && <Check className="w-3 h-3 inline mr-1" />}
              {g}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={isSaving}
        className="w-full h-9 rounded-xl border border-brand-pink-500 text-brand-pink-500 text-xs font-medium hover:bg-brand-pink-100/60 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
        {isSaving ? copy.updating : copy.updateRecommendations}
      </button>
    </div>
  );
}

function RecommendationEmptyState({
  title,
  description,
  ctaLabel,
  ctaTo,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  ctaTo: string;
}) {
  return (
    <div className="rounded-2xl border border-[#EAE6EF] bg-white p-5">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
        <ShoppingBag className="w-4 h-4 text-[#6B7280]" />
      </div>
      <h3 className="text-sm font-semibold text-[#111827] mb-1">{title}</h3>
      <p className="text-xs text-[#6B7280] mb-4">{description}</p>
      <Link
        to={ctaTo}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#111827] hover:text-[#FF4DB8] transition-colors"
      >
        {ctaLabel}
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function ColdStartState({
  initialSkinType,
  initialGoals,
  isSaving,
  onComplete,
  skinTypeOptions,
  goalOptions,
}: {
  initialSkinType?: string;
  initialGoals?: string[];
  isSaving: boolean;
  onComplete: (payload: { skinType: string; goals: string[] }) => Promise<void>;
  skinTypeOptions: string[];
  goalOptions: string[];
}) {
  const { language } = useI18n();
  const copy = forYouPageCopy[language];
  const [step, setStep] = useState((initialGoals?.length ?? 0) > 0 ? 2 : 1);
  const [skinType, setSkinType] = useState(initialSkinType ?? '');
  const [goals, setGoals] = useState<string[]>(initialGoals ?? []);

  const toggleGoal = (goal: string) => {
    setGoals((currentGoals) =>
      currentGoals.includes(goal)
        ? currentGoals.filter((item) => item !== goal)
        : [...currentGoals, goal],
    );
  };

  const handleFinish = async () => {
    if (!skinType || goals.length === 0 || isSaving) {
      toast.error(copy.selectSkinAndGoal);
      return;
    }

    await onComplete({ skinType, goals });
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="flex items-center gap-2 mb-8 justify-center">
        {[1, 2].map((item) => (
          <div
            key={item}
            className={`rounded-full transition-all ${
              item === step ? 'w-8 h-2 bg-brand-pink-500' : item < step ? 'w-2 h-2 bg-brand-pink-500' : 'w-2 h-2 bg-gray-200'
            }`}
          />
        ))}
      </div>

      {step === 1 ? (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FFE1F2] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#FF4DB8]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#111827] mb-2">{copy.setupTitle}</h2>
          <p className="text-[#6B7280] mb-8">{copy.setupDescription}</p>

          <div className="text-left mb-6">
            <p className="text-sm font-semibold text-[#111827] mb-3">{copy.whatSkinType}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {skinTypeOptions.map((value) => (
                <button
                  key={value}
                  onClick={() => setSkinType(value)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                    skinType === value
                      ? 'border-brand-pink-500 bg-brand-pink-500 text-white'
                      : 'border-[#EAE6EF] text-[#111827] hover:border-brand-pink-500/30'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => skinType && setStep(2)}
            disabled={!skinType}
            className="w-full h-12 rounded-xl bg-brand-pink-500 text-white font-medium text-sm hover:bg-brand-pink-600 transition-colors disabled:bg-gray-200 disabled:text-[#6B7280] flex items-center justify-center gap-2"
          >
            {copy.next} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#111827]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#111827] mb-2">{copy.goalsTitle}</h2>
          <p className="text-[#6B7280] mb-8">{copy.goalsDescription}</p>

          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {goalOptions.map((goal) => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium border-2 transition-all ${
                  goals.includes(goal)
                    ? 'border-[#FF4DB8] bg-[#FF4DB8] text-white'
                    : 'border-[#EAE6EF] text-[#111827] hover:border-[#FF4DB8]/30'
                }`}
              >
                {goals.includes(goal) && '✓ '}{goal}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 h-12 rounded-xl border border-[#EAE6EF] text-[#111827] font-medium text-sm hover:bg-gray-50"
            >
              {copy.back}
            </button>
            <button
              onClick={() => void handleFinish()}
              disabled={goals.length === 0 || isSaving}
              className="flex-2 flex-1 h-12 rounded-xl bg-brand-pink-500 text-white font-medium text-sm hover:bg-brand-pink-600 transition-colors disabled:bg-gray-200 disabled:text-[#6B7280] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isSaving ? copy.saving : copy.showRecommendations}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function EmailVerificationNotice({
  email,
  isSending,
  onResend,
}: {
  email: string;
  isSending: boolean;
  onResend: () => void;
}) {
  const { language } = useI18n();
  const copy = forYouPageCopy[language];
  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-amber-900 font-semibold">
            <Mail className="w-4 h-4" />
            {copy.confirmEmail}
          </div>
          <p className="mt-1 text-sm text-amber-800">
            {copy.confirmEmailDescription(email)}
          </p>
        </div>
        <button
          type="button"
          onClick={onResend}
          disabled={isSending}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isSending ? 'animate-spin' : ''}`} />
          {isSending ? copy.sending : copy.resendEmail}
        </button>
      </div>
    </div>
  );
}

export default function ForYouPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading, resendVerificationEmail } = useAuth();
  const { addToCart, getCartQuantity, setCartQuantity } = useCommerce();
  const { language } = useI18n();
  const copy = forYouPageCopy[language];

  const [skinType, setSkinType] = useState('Жирная');
  const [goals, setGoals] = useState(['Увлажнение', 'Сияние']);
  const [profileTaxonomy, setProfileTaxonomy] = useState<ProfileTaxonomy | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>([]);
  const [trendingRecommendations, setTrendingRecommendations] = useState<RecommendationCard[]>([]);
  const [personalOffer, setPersonalOffer] = useState<PersonalOfferCard | null>(null);
  const [roadmapPlan, setRoadmapPlan] = useState<RoadmapPlanApi | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1247);
  const [loyaltyTier, setLoyaltyTier] = useState('gold');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [showAutoOnboarding, setShowAutoOnboarding] = useState(false);
  const [isOnboardingSaving, setIsOnboardingSaving] = useState(false);
  const [isVerificationEmailSending, setIsVerificationEmailSending] = useState(false);
  const [onboardingInitialSkinType, setOnboardingInitialSkinType] = useState('');
  const [onboardingInitialGoals, setOnboardingInitialGoals] = useState<string[]>([]);
  const recommendationRequestIdRef = useRef<string | null>(null);
  const resolvedProfileTaxonomy = resolveProfileTaxonomy(profileTaxonomy, language);
  const skinTypeOptions = getProfileOptionLabels(resolvedProfileTaxonomy.skin_types);
  const goalOptions = getProfileOptionLabels(resolvedProfileTaxonomy.goals);

  const roadmapOverview = buildRoadmapOverview(roadmapPlan, copy, language) ?? buildFallbackRoadmapOverview(copy);
  const roadmapHeading = roadmapOverview.totalSteps > 0
    ? `${copy.stepLabel(Math.min(roadmapOverview.currentStepIndex, roadmapOverview.totalSteps))} / ${roadmapOverview.totalSteps}: ${roadmapOverview.nextStepTitle}`
    : roadmapOverview.nextStepTitle;
  const sidebarQuickActions = buildSidebarQuickActions({
    skinType,
    goals,
    roadmapPlan,
    roadmapOverview,
    personalOffer,
    recommendations,
    trendingRecommendations,
    copy,
  });
  const offerCountdownMs = personalOffer?.expiresAt
    ? personalOffer.expiresAt.getTime() - Date.now()
    : null;
  const hasOfferCountdown = offerCountdownMs !== null && offerCountdownMs > 0;
  const shouldShowEmailVerificationNotice = Boolean(user?.email && user.email_verified === false);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    let cancelled = false;

    const loadPersonalization = async () => {
      setIsDataLoading(true);
      setLoadError(null);
      const recommendationRequestId = createRequestId();
      recommendationRequestIdRef.current = recommendationRequestId;

      try {
        const [homeResult, offerResult, profileResult, loyaltyResult, profileTaxonomyResult] = await Promise.allSettled([
          home({ requestId: recommendationRequestId }),
          nextOffer(),
          getProfile(),
          getLoyalty(),
          getProfileTaxonomy(),
        ]);

        if (cancelled) {
          return;
        }

        const rejectedReasons: unknown[] = [];
        for (const result of [homeResult, offerResult, profileResult, loyaltyResult, profileTaxonomyResult]) {
          if (result.status === 'rejected') {
            rejectedReasons.push(result.reason);
          }
        }

        const authError = rejectedReasons.find(
          (reason) =>
            reason instanceof ApiError &&
            (reason.status === 401 || reason.status === 403),
        );

        if (authError) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        const activeProfileTaxonomy = resolveProfileTaxonomy(
          profileTaxonomyResult.status === 'fulfilled' ? profileTaxonomyResult.value : null,
          language,
        );
        setProfileTaxonomy(activeProfileTaxonomy);

        if (profileResult.status === 'fulfilled') {
          const profile = profileResult.value as Record<string, unknown>;
          const nextSkinType = mapProfileSingleApiToLabel(
            activeProfileTaxonomy.skin_types,
            profile.skin_type,
          ) ?? '';
          const nextGoals = mapProfileMultiApiToLabels(activeProfileTaxonomy.goals, profile.goals);
          const isProfileCompleted =
            typeof profile.profile_completed_at === 'string' &&
            profile.profile_completed_at.trim().length > 0;

          setOnboardingInitialSkinType(nextGoals.length > 0 ? nextSkinType : '');
          setOnboardingInitialGoals(nextGoals);

          if (nextSkinType) {
            setSkinType(nextSkinType);
          }

          if (nextGoals.length > 0) {
            setGoals(nextGoals);
          }

          setShowAutoOnboarding(!isProfileCompleted);
        } else {
          setShowAutoOnboarding(false);
        }

        if (loyaltyResult.status === 'fulfilled') {
          const points = toNumber(loyaltyResult.value.points_balance);
          if (points !== undefined) {
            setLoyaltyPoints(Math.max(0, Math.round(points)));
          }

          if (typeof loyaltyResult.value.tier === 'string' && loyaltyResult.value.tier.trim()) {
            setLoyaltyTier(loyaltyResult.value.tier.toLowerCase());
          }
        }

        const homeResponse = homeResult.status === 'fulfilled' ? homeResult.value : null;
        const normalized = homeResponse
          ? extractHomeResults(homeResponse).map(({ item, sectionKey }, index) =>
              normalizeRec(item, index, sectionKey, copy, language),
            )
          : [];

        if (normalized.length > 0) {
          const forYou = normalized.filter((item) => item.section === 'for_you');
          const becauseYouBought = normalized.filter((item) => item.section === 'because_you_bought');
          const trending = normalized.filter((item) => item.section === 'trending');
          const primaryPool = forYou.length > 0 ? [...forYou, ...becauseYouBought] : normalized;
          const primary = primaryPool.slice(0, 6);
          const primaryIds = new Set(primary.map((item) => item.id));
          const secondaryPool =
            trending.length > 0
              ? trending.filter((item) => !primaryIds.has(item.id))
              : normalized.filter((item) => !primaryIds.has(item.id));

          setRecommendations(primary);
          setTrendingRecommendations(secondaryPool.slice(0, 4));
        } else {
          setRecommendations([]);
          setTrendingRecommendations([]);
        }

        const homeNextOffer =
          homeResponse && typeof homeResponse === 'object' && !Array.isArray(homeResponse)
            ? (homeResponse as { next_offer?: unknown }).next_offer
            : undefined;
        const effectiveOffer =
          homeNextOffer && typeof homeNextOffer === 'object'
            ? (homeNextOffer as Record<string, unknown>)
            : offerResult.status === 'fulfilled'
              ? offerResult.value
              : null;

        setPersonalOffer(
          effectiveOffer && isRecord(effectiveOffer)
            ? buildPersonalOfferCard(effectiveOffer, copy, language)
            : null,
        );

        try {
          const nextRoadmapPlan = await loadForYouRoadmap();
          if (cancelled) {
            return;
          }
          setRoadmapPlan(nextRoadmapPlan);
        } catch (error) {
          if (isAuthError(error)) {
            navigate('/login', { replace: true, state: { from: location.pathname } });
            return;
          }
        }

        if (homeResult.status === 'rejected' && offerResult.status === 'rejected') {
          setLoadError(copy.loadRecommendationsError);
        } else if (homeResult.status === 'rejected') {
          setLoadError(copy.partialDataError);
        } else if (offerResult.status === 'rejected') {
          setLoadError(copy.loadOfferError);
        }
      } catch {
        if (!cancelled) {
          setLoadError(copy.loadRecommendationsError);
        }
      } finally {
        if (!cancelled) {
          setIsDataLoading(false);
        }
      }
    };

    loadPersonalization().catch(() => {
      if (!cancelled) {
        setLoadError(copy.loadRecommendationsError);
        setIsDataLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [copy, isAuthLoading, location.pathname, navigate, retryKey, user]);

  const handleRecommendationClick = (product: RecommendationCard) => {
    const productId = Number(product.id);
    if (!Number.isFinite(productId)) {
      return;
    }

    void sendEvent({
      action: 'click',
      product_id: productId,
      page: 'for_you',
      section_key: product.section,
      context: { assignment_id: personalOffer?.assignmentId },
    }, { requestId: recommendationRequestIdRef.current ?? undefined }).catch(() => undefined);
  };

  const handleRecommendationAddToCart = async (product: RecommendationCard, quantity: number) => {
    try {
      const nextQuantity = await addToCart(product.id, quantity);
      toast.success(copy.addedToCart, {
        description:
          nextQuantity > 1
            ? copy.cartNowHas(nextQuantity)
            : copy.pointsAfterPurchase(product.pointsEarned),
      });

      const productId = Number(product.id);
      if (Number.isFinite(productId)) {
        void sendEvent({
          action: 'add_to_cart',
          product_id: productId,
          page: 'for_you',
          section_key: product.section,
          context: { assignment_id: personalOffer?.assignmentId },
        }, { requestId: recommendationRequestIdRef.current ?? undefined }).catch(() => undefined);
      }
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      toast.error(error instanceof Error ? error.message : copy.addToCartError);
    }
  };

  const handleRecommendationQuantityChange = async (product: RecommendationCard, quantity: number) => {
    try {
      await setCartQuantity(product.id, quantity);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      toast.error(error instanceof Error ? error.message : copy.updateCartError);
    }
  };

  const handleRoadmapClick = () => {
    if (roadmapOverview.nextStepId === undefined) {
      return;
    }

    void clickRoadmapStep(roadmapOverview.nextStepId).catch(() => undefined);
  };

  const handleSavePrefs = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        skin_type: mapProfileSingleLabelToApiValue(
          resolvedProfileTaxonomy.skin_types,
          skinType,
          'normal',
        ),
        goals: mapProfileLabelsToApiValues(resolvedProfileTaxonomy.goals, goals),
      });
      setRetryKey((value) => value + 1);
      toast.success(copy.recommendationsUpdated);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(copy.saveSettingsError);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteOnboarding = async ({
    skinType: nextSkinType,
    goals: nextGoals,
  }: {
    skinType: string;
    goals: string[];
  }) => {
    setIsOnboardingSaving(true);
    try {
      await updateProfile({
        skin_type: mapProfileSingleLabelToApiValue(
          resolvedProfileTaxonomy.skin_types,
          nextSkinType,
          'normal',
        ),
        goals: mapProfileLabelsToApiValues(resolvedProfileTaxonomy.goals, nextGoals),
      });
      setSkinType(nextSkinType);
      setGoals(nextGoals);
      setOnboardingInitialSkinType(nextSkinType);
      setOnboardingInitialGoals(nextGoals);
      setShowAutoOnboarding(false);
      setRetryKey((value) => value + 1);
      toast.success(copy.recommendationsPersonalized);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(copy.savePersonalizationError);
      }
    } finally {
      setIsOnboardingSaving(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (isVerificationEmailSending) {
      return;
    }

    setIsVerificationEmailSending(true);
    try {
      const response = await resendVerificationEmail();
      if (response.already_verified) {
        toast.success(copy.emailAlreadyVerified);
      } else {
        toast.success(copy.emailSent(response.email));
      }
    } catch (error) {
      if (isAuthError(error)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      toast.error(error instanceof Error ? error.message : copy.emailSendError);
    } finally {
      setIsVerificationEmailSending(false);
    }
  };

  if (showAutoOnboarding) {
    return (
      <div className="page-with-navbar-offset min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-[800px] mx-auto px-6 py-8 lg:py-12">
          {shouldShowEmailVerificationNotice && user?.email ? (
            <EmailVerificationNotice
              email={user.email}
              isSending={isVerificationEmailSending}
              onResend={() => void handleResendVerificationEmail()}
            />
          ) : null}
          <ColdStartState
            initialSkinType={onboardingInitialSkinType || undefined}
            initialGoals={onboardingInitialGoals}
            isSaving={isOnboardingSaving}
            onComplete={handleCompleteOnboarding}
            skinTypeOptions={skinTypeOptions}
            goalOptions={goalOptions}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        {shouldShowEmailVerificationNotice && user?.email ? (
          <EmailVerificationNotice
            email={user.email}
            isSending={isVerificationEmailSending}
            onResend={() => void handleResendVerificationEmail()}
          />
        ) : null}

        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-[#6B7280] mb-1">{copy.personalCenter}</p>
            <h1 className="text-3xl font-semibold text-[#111827]">
              {copy.hello(user?.username ?? copy.defaultName)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-[#EAE6EF]">
              <Sparkles className="w-4 h-4 text-[#FF4DB8]" />
              <span className="text-sm font-semibold text-[#111827]">{loyaltyPoints.toLocaleString(forYouLocale[language])} {copy.points}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold ml-1">
                {formatTierLabel(loyaltyTier, copy)}
              </span>
            </div>
          </div>
        </div>

        {isDataLoading && (
          <div className="mb-4 p-3 rounded-xl border border-[#EAE6EF] bg-white text-sm text-[#6B7280]">
            {copy.loadingPersonalData}
          </div>
        )}

        {loadError && (
          <div className="mb-4 p-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2]">
            <p className="text-sm text-[#B42318]">{loadError}</p>
            <button
              onClick={() => setRetryKey((value) => value + 1)}
              className="mt-2 text-xs font-medium text-[#111827] underline underline-offset-2"
            >
              {copy.retry}
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ─── Main column ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* ─── Next Best Action ─────────────────────────────── */}
            <div className="relative bg-[#111827] rounded-2xl p-6 mb-6 overflow-hidden">
              {/* decorative */}
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
              <div className="absolute bottom-0 right-12 w-24 h-24 rounded-full bg-[#FF4DB8]/10 translate-y-1/2 pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FF4DB8]/20 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-[#FF4DB8]" />
                  </div>
                  <span className="text-xs text-white/60 font-medium uppercase tracking-wide">{copy.nextStep}</span>
                </div>

                <h2 className="text-xl font-semibold text-white mb-2">
                  {roadmapHeading}
                </h2>
                <p className="text-sm text-white/70 mb-1">
                  {roadmapOverview.nextStepDescription}
                </p>

                {/* Relevance tag */}
                <p className="text-xs text-[#FF4DB8] mb-5 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {copy.whyNow}: {roadmapOverview.nextStepWhy}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Link
                    to="/me/roadmap"
                    onClick={handleRoadmapClick}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#111827] text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    {copy.goToStep}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  {roadmapOverview.nextStepPoints ? (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF4DB8]" />
                      <span>{copy.pointsAfterPurchase(roadmapOverview.nextStepPoints)}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* ─── Recommendations: For You ─────────────────────── */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFE1F2] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#FF4DB8]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#111827]">{copy.specialForYou}</h2>
                    <p className="text-xs text-[#6B7280]">{copy.basedOn(skinType, goals)}</p>
                  </div>
                </div>
                <Link to="/catalog" className="text-sm text-[#6B7280] hover:text-[#111827] flex items-center gap-1 transition-colors">
                  {copy.all} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map(p => (
                    <EnhancedRecCard
                      key={p.id}
                      product={p}
                      cartQuantity={getCartQuantity(p.id)}
                      onAdd={handleRecommendationAddToCart}
                      onSetQuantity={handleRecommendationQuantityChange}
                      onProductClick={handleRecommendationClick}
                    />
                  ))}
                </div>
              ) : (
                <RecommendationEmptyState
                  title={copy.personalRecommendationsBuilding}
                  description={copy.personalRecommendationsBuildingDescription}
                  ctaLabel={copy.openCatalog}
                  ctaTo="/catalog"
                />
              )}
            </section>

            {/* ─── Recommendations: Trending ──────────────────────── */}
            <section className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-[#111827]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#111827]">{copy.trendingForYou}</h2>
                    <p className="text-xs text-[#6B7280]">{copy.trendingDescription}</p>
                  </div>
                </div>
                <Link to="/new" className="text-sm text-[#6B7280] hover:text-[#111827] flex items-center gap-1 transition-colors">
                  {copy.all} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {trendingRecommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trendingRecommendations.map(p => (
                    <EnhancedRecCard
                      key={p.id}
                      product={p}
                      cartQuantity={getCartQuantity(p.id)}
                      onAdd={handleRecommendationAddToCart}
                      onSetQuantity={handleRecommendationQuantityChange}
                      onProductClick={handleRecommendationClick}
                    />
                  ))}
                </div>
              ) : (
                <RecommendationEmptyState
                  title={copy.trendsPending}
                  description={copy.trendsPendingDescription}
                  ctaLabel={copy.viewNew}
                  ctaTo="/new"
                />
              )}
            </section>
          </div>

          {/* ─── Sidebar ─────────────────────────────────────────── */}
          <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">

            {/* Loyalty Progress */}
            <LoyaltyProgressMini points={loyaltyPoints} tier={loyaltyTier} />

            {/* Roadmap Progress */}
            <Link to="/me/roadmap" className="block group" onClick={handleRoadmapClick}>
              <div className="p-5 bg-white rounded-2xl border border-[#EAE6EF] hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Map className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-sm font-semibold text-[#111827]">{copy.myRoadmap}</span>
                  <span className="ml-auto text-[10px] text-[#FF4DB8] font-semibold flex items-center gap-1">
                    {copy.stepProgress(
                      Math.min(roadmapOverview.currentStepIndex, Math.max(1, roadmapOverview.totalSteps)),
                      Math.max(1, roadmapOverview.totalSteps),
                    )} <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-brand-pink-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, roadmapOverview.progressPercent))}%` }}
                  />
                </div>
                <div className="flex gap-1 mt-3">
                  {roadmapOverview.steps.map((step) => (
                    <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        step.state === 'completed' ? 'bg-brand-pink-500 text-white' :
                        step.state === 'current' ? 'bg-[#FF4DB8] text-white' :
                        'bg-gray-100 text-[#6B7280]'
                      }`}>
                        {step.state === 'completed' ? <Check className="w-3 h-3" /> : step.stepIndex}
                      </div>
                      <span className="text-[8px] text-[#6B7280] text-center hidden sm:block">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>

            {/* Active Offer */}
            <div className="p-5 bg-white rounded-2xl border border-[#EAE6EF]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FF4DB8] text-white">{copy.offerBadge}</span>
                <span className="text-xs text-[#6B7280]">{copy.personal}</span>
              </div>
              <h3 className="text-sm font-semibold text-[#111827] mt-2 mb-1">
                {personalOffer?.title ?? copy.noOfferTitle}
              </h3>
              <p className="text-xs text-[#6B7280] mb-3">
                {personalOffer?.description ?? copy.noOfferDescription}
              </p>

              {/* Saving highlight */}
              <div className="flex items-center gap-2 p-3 bg-[#FFE1F2] rounded-xl mb-3">
                <Sparkles className="w-4 h-4 text-[#FF4DB8] flex-shrink-0" />
                <p className="text-xs text-[#111827]">
                  {personalOffer?.highlight ?? copy.noOfferHighlight}
                </p>
              </div>

              {/* Countdown */}
              {hasOfferCountdown ? (
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{copy.expiresIn}</span>
                  <span className="font-semibold text-[#111827]">
                    {Math.floor((offerCountdownMs ?? 0) / 3600000)}{copy.hoursShort}{' '}
                    {Math.floor(((offerCountdownMs ?? 0) % 3600000) / 60000)}{copy.minutesShort}
                  </span>
                </div>
              ) : null}
              {personalOffer?.assignmentId ? (
                <Link
                  to={`/promotions/offers/${personalOffer.assignmentId}`}
                  onClick={() => {
                    void clickOffer(personalOffer.assignmentId as number, { source: 'for_you_sidebar' }).catch(() => undefined);
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#111827] transition-colors hover:text-[#FF4DB8]"
                >
                  {copy.offerDetails}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : null}
            </div>

            {/* Quick Preferences */}
            <QuickPrefsPanel
              skinType={skinType}
              setSkinType={setSkinType}
              goals={goals}
              setGoals={setGoals}
              onSave={handleSavePrefs}
              isSaving={isSaving}
              skinTypeOptions={skinTypeOptions}
              goalOptions={goalOptions}
            />

            {/* Quick actions */}
            <div className="p-5 bg-gray-50 rounded-2xl border border-[#EAE6EF]">
              <p className="text-xs font-semibold text-[#111827] mb-3">{copy.quickActions}</p>
              <div className="flex flex-col gap-2.5">
                {sidebarQuickActions.map((item) => (
                  <div key={item.key} className="flex items-start gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.done
                        ? 'bg-brand-pink-500'
                        : item.muted
                          ? 'border border-[#D1D5DB] bg-white'
                          : 'border border-gray-300 bg-white'
                    }`}>
                      {item.done && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${
                        item.done
                          ? 'text-[#6B7280] line-through'
                          : item.muted
                            ? 'text-[#6B7280]'
                            : 'text-[#111827]'
                      }`}>
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold ${
                      item.muted ? 'text-[#9CA3AF]' : 'text-[#FF4DB8]'
                    }`}>
                      {item.accent}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

