import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';

import { useI18n } from '../../shared/i18n/LanguageContext';
import type { AppLanguage } from '../../shared/i18n/messages';
import { Button } from './Button';

interface ProfileWizardProps {
  onComplete?: (data: ProfileData) => void | Promise<void>;
  onClose?: () => void;
  options?: Partial<ProfileWizardOptions>;
  initialData?: ProfileData;
}

interface ProfileData {
  skinType?: string[];
  goals?: string[];
  avoidFlags?: string[];
  budgetMin?: number;
  budgetMax?: number;
  hairProfile?: {
    type?: string[];
    concerns?: string[];
  };
  makeupProfile?: {
    coverage?: string;
    skinTone?: string;
  };
  fragranceProfile?: {
    notes?: string[];
    intensity?: string;
  };
}

type WizardStep = { id: number; title: string; description: string };

interface ProfileWizardOptions {
  steps: WizardStep[];
  skinTypes: string[];
  skinGoals: string[];
  avoidFlags: string[];
  hairTypes: string[];
  hairConcerns: string[];
  coverageOptions: string[];
  fragranceNotes: string[];
  intensityOptions: string[];
}

const localeByLanguage: Record<AppLanguage, string> = {
  ru: 'ru-RU',
  kk: 'kk-KZ',
  en: 'en-US',
};

const wizardCopy = {
  ru: {
    steps: [
      { id: 1, title: 'Тип кожи', description: 'Выберите ваш тип кожи' },
      { id: 2, title: 'Цели ухода', description: 'Что вы хотите улучшить в первую очередь?' },
      { id: 3, title: 'Избегать', description: 'Ингредиенты и категории, которых вы хотите избегать' },
      { id: 4, title: 'Бюджет', description: 'Комфортный ценовой диапазон' },
      { id: 5, title: 'Волосы', description: 'Тип волос и цели ухода' },
      { id: 6, title: 'Макияж', description: 'Предпочтения по макияжу' },
      { id: 7, title: 'Ароматы', description: 'Любимые ноты и интенсивность' },
    ],
    skinTypes: ['Сухая', 'Жирная', 'Комбинированная', 'Нормальная', 'Чувствительная'],
    skinGoals: ['Увлажнение', 'Антивозрастной уход', 'Против акне', 'Сияние и тон', 'Защита SPF', 'Успокоение'],
    avoidFlags: ['Парабены', 'Силиконы', 'Отдушки', 'Спирт', 'Эфирные масла', 'Глютен'],
    hairTypes: ['Прямые', 'Волнистые', 'Кудрявые', 'Афро'],
    hairConcerns: ['Выпадение', 'Восстановление', 'Сухость', 'Жирность', 'Перхоть', 'Объем'],
    coverageOptions: ['Легкое', 'Среднее', 'Плотное'],
    fragranceNotes: ['Цитрус', 'Цветочные', 'Древесные', 'Восточные', 'Свежие', 'Пряные'],
    intensityOptions: ['Легкий', 'Средний', 'Интенсивный'],
    from: 'От',
    to: 'До',
    hairType: 'Тип волос',
    hairConcernsLabel: 'Проблемы',
    coverage: 'Покрытие',
    favoriteNotes: 'Любимые ноты',
    intensity: 'Интенсивность',
    cancel: 'Отмена',
    back: 'Назад',
    saving: 'Сохранение...',
    saveProfile: 'Сохранить профиль',
    next: 'Далее',
  },
  kk: {
    steps: [
      { id: 1, title: 'Тері түрі', description: 'Теріңіздің түрін таңдаңыз' },
      { id: 2, title: 'Күтім мақсаттары', description: 'Ең алдымен нені жақсартқыңыз келеді?' },
      { id: 3, title: 'Болдырмау', description: 'Аулақ болғыңыз келетін ингредиенттер мен санаттар' },
      { id: 4, title: 'Бюджет', description: 'Өзіңізге ыңғайлы баға диапазоны' },
      { id: 5, title: 'Шаш', description: 'Шаш түрі мен күтім мақсаттары' },
      { id: 6, title: 'Макияж', description: 'Макияж бойынша қалаулар' },
      { id: 7, title: 'Хош иіс', description: 'Ұнайтын ноталар мен қарқын' },
    ],
    skinTypes: ['Құрғақ', 'Майлы', 'Аралас', 'Қалыпты', 'Сезімтал'],
    skinGoals: ['Ылғалдандыру', 'Қартаюға қарсы күтім', 'Безеуге қарсы', 'Жарқырау мен реңк', 'SPF қорғаныс', 'Тыныштандыру'],
    avoidFlags: ['Парабендер', 'Силикондар', 'Хош иіс', 'Спирт', 'Эфир майлары', 'Глютен'],
    hairTypes: ['Тік', 'Толқынды', 'Бұйра', 'Афро'],
    hairConcerns: ['Түсу', 'Қалпына келтіру', 'Құрғақтық', 'Майлылық', 'Қайызғақ', 'Көлем'],
    coverageOptions: ['Жеңіл', 'Орташа', 'Тығыз'],
    fragranceNotes: ['Цитрус', 'Гүлді', 'Ағашты', 'Шығыстық', 'Балғын', 'Дәмдеуішті'],
    intensityOptions: ['Жеңіл', 'Орташа', 'Қанық'],
    from: 'Бастап',
    to: 'Дейін',
    hairType: 'Шаш түрі',
    hairConcernsLabel: 'Мәселелер',
    coverage: 'Жабын',
    favoriteNotes: 'Ұнайтын ноталар',
    intensity: 'Қарқын',
    cancel: 'Бас тарту',
    back: 'Артқа',
    saving: 'Сақтап жатырмыз...',
    saveProfile: 'Профильді сақтау',
    next: 'Келесі',
  },
  en: {
    steps: [
      { id: 1, title: 'Skin type', description: 'Choose your skin type' },
      { id: 2, title: 'Care goals', description: 'What would you like to improve?' },
      { id: 3, title: 'Avoid', description: 'Ingredients and allergens to avoid' },
      { id: 4, title: 'Budget', description: 'A comfortable price range' },
      { id: 5, title: 'Hair', description: 'Hair type and care goals' },
      { id: 6, title: 'Makeup', description: 'Makeup preferences' },
      { id: 7, title: 'Fragrance', description: 'Favorite notes and intensity' },
    ],
    skinTypes: ['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive'],
    skinGoals: ['Hydration', 'Anti-aging care', 'Acne care', 'Glow and tone', 'SPF protection', 'Soothing'],
    avoidFlags: ['Parabens', 'Silicones', 'Fragrance', 'Alcohol', 'Essential oils', 'Gluten'],
    hairTypes: ['Straight', 'Wavy', 'Curly', 'Coily'],
    hairConcerns: ['Hair loss', 'Repair', 'Dryness', 'Oiliness', 'Dandruff', 'Volume'],
    coverageOptions: ['Light', 'Medium', 'Full'],
    fragranceNotes: ['Citrus', 'Floral', 'Woody', 'Oriental', 'Fresh', 'Spicy'],
    intensityOptions: ['Light', 'Medium', 'Strong'],
    from: 'From',
    to: 'To',
    hairType: 'Hair type',
    hairConcernsLabel: 'Concerns',
    coverage: 'Coverage',
    favoriteNotes: 'Favorite notes',
    intensity: 'Intensity',
    cancel: 'Cancel',
    back: 'Back',
    saving: 'Saving...',
    saveProfile: 'Save profile',
    next: 'Next',
  },
} as const;

const DEFAULT_DATA: ProfileData = {
  skinType: [],
  goals: [],
  avoidFlags: [],
  budgetMin: 0,
  budgetMax: 20000,
  hairProfile: { type: [], concerns: [] },
  makeupProfile: {},
  fragranceProfile: { notes: [] },
};

function getDefaultOptions(language: AppLanguage): ProfileWizardOptions {
  const copy = wizardCopy[language];

  return {
    steps: copy.steps,
    skinTypes: copy.skinTypes,
    skinGoals: copy.skinGoals,
    avoidFlags: copy.avoidFlags,
    hairTypes: copy.hairTypes,
    hairConcerns: copy.hairConcerns,
    coverageOptions: copy.coverageOptions,
    fragranceNotes: copy.fragranceNotes,
    intensityOptions: copy.intensityOptions,
  };
}

function mergeOptions(
  options: Partial<ProfileWizardOptions> | undefined,
  defaults: ProfileWizardOptions,
): ProfileWizardOptions {
  return {
    steps: options?.steps && options.steps.length > 0 ? options.steps : defaults.steps,
    skinTypes: options?.skinTypes && options.skinTypes.length > 0 ? options.skinTypes : defaults.skinTypes,
    skinGoals: options?.skinGoals && options.skinGoals.length > 0 ? options.skinGoals : defaults.skinGoals,
    avoidFlags: options?.avoidFlags && options.avoidFlags.length > 0 ? options.avoidFlags : defaults.avoidFlags,
    hairTypes: options?.hairTypes && options.hairTypes.length > 0 ? options.hairTypes : defaults.hairTypes,
    hairConcerns:
      options?.hairConcerns && options.hairConcerns.length > 0 ? options.hairConcerns : defaults.hairConcerns,
    coverageOptions:
      options?.coverageOptions && options.coverageOptions.length > 0
        ? options.coverageOptions
        : defaults.coverageOptions,
    fragranceNotes:
      options?.fragranceNotes && options.fragranceNotes.length > 0
        ? options.fragranceNotes
        : defaults.fragranceNotes,
    intensityOptions:
      options?.intensityOptions && options.intensityOptions.length > 0
        ? options.intensityOptions
        : defaults.intensityOptions,
  };
}

export function ProfileWizard({ onComplete, onClose, options, initialData }: ProfileWizardProps) {
  const { language } = useI18n();
  const copy = wizardCopy[language];
  const defaults = useMemo(() => getDefaultOptions(language), [language]);
  const config = useMemo(() => mergeOptions(options, defaults), [defaults, options]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ProfileData>({
    ...DEFAULT_DATA,
    ...initialData,
    hairProfile: { ...DEFAULT_DATA.hairProfile, ...initialData?.hairProfile },
    makeupProfile: { ...DEFAULT_DATA.makeupProfile, ...initialData?.makeupProfile },
    fragranceProfile: { ...DEFAULT_DATA.fragranceProfile, ...initialData?.fragranceProfile },
  });
  const locale = localeByLanguage[language];

  const toggleSelection = (field: keyof ProfileData, value: string) => {
    const current = (data[field] as string[] | undefined) ?? [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setData({ ...data, [field]: updated });
  };

  const handleNext = () => {
    if (currentStep < config.steps.length) {
      setCurrentStep(currentStep + 1);
      return;
    }
    void handleSubmit();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onComplete?.(data);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return Boolean(data.skinType && data.skinType.length > 0);
    if (currentStep === 2) return Boolean(data.goals && data.goals.length > 0);
    return true;
  };

  const step = config.steps[currentStep - 1];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          {config.steps.map((item, idx) => (
            <div key={item.id} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    currentStep > item.id
                      ? 'bg-[#FF4DB8] text-white'
                      : currentStep === item.id
                        ? 'bg-brand-pink-500 text-white'
                        : 'bg-gray-200 text-[#6B7280]'
                  }`}
                >
                  {currentStep > item.id ? <Check className="h-4 w-4" /> : item.id}
                </div>
                <span className="mt-2 hidden text-center text-xs text-[#6B7280] lg:block">
                  {item.title}
                </span>
              </div>
              {idx < config.steps.length - 1 && (
                <div className={`h-0.5 flex-1 ${currentStep > item.id ? 'bg-[#FF4DB8]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-[#111827]">{step.title}</h2>
          <p className="text-sm text-[#6B7280]">{step.description}</p>
        </div>
      </div>

      <div className="mb-8 min-h-[300px]">
        {currentStep === 1 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {config.skinTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleSelection('skinType', type)}
                className={`rounded-xl border-2 p-4 font-medium transition-all ${
                  data.skinType?.includes(type)
                    ? 'border-[#FF4DB8] bg-[#FFE1F2] text-[#FF4DB8]'
                    : 'border-[#EAE6EF] bg-white text-[#6B7280] hover:border-[#FF4DB8]/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {currentStep === 2 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {config.skinGoals.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleSelection('goals', goal)}
                className={`rounded-xl border-2 p-4 font-medium transition-all ${
                  data.goals?.includes(goal)
                    ? 'border-[#FF4DB8] bg-[#FFE1F2] text-[#FF4DB8]'
                    : 'border-[#EAE6EF] bg-white text-[#6B7280] hover:border-[#FF4DB8]/50'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        )}

        {currentStep === 3 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {config.avoidFlags.map((flag) => (
              <button
                key={flag}
                type="button"
                onClick={() => toggleSelection('avoidFlags', flag)}
                className={`rounded-xl border-2 p-4 font-medium transition-all ${
                  data.avoidFlags?.includes(flag)
                    ? 'border-[#FF4DB8] bg-[#FFE1F2] text-[#FF4DB8]'
                    : 'border-[#EAE6EF] bg-white text-[#6B7280] hover:border-[#FF4DB8]/50'
                }`}
              >
                {flag}
              </button>
            ))}
          </div>
        )}

        {currentStep === 4 && (
          <div className="mx-auto max-w-md space-y-6">
            <Slider.Root
              className="relative flex h-5 w-full touch-none select-none items-center"
              value={[data.budgetMin ?? 0, data.budgetMax || 20000]}
              onValueChange={([min, max]) => setData({ ...data, budgetMin: min, budgetMax: max })}
              max={100000}
              step={1000}
              minStepsBetweenThumbs={1}
            >
              <Slider.Track className="relative h-1 grow rounded-full bg-[#EAE6EF]">
                <Slider.Range className="absolute h-full rounded-full bg-[#FF4DB8]" />
              </Slider.Track>
              <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-[#FF4DB8] bg-white transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20" />
              <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-[#FF4DB8] bg-white transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20" />
            </Slider.Root>
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-xs text-[#6B7280]">{copy.from}</p>
                <p className="text-xl font-bold text-[#111827]">{(data.budgetMin || 0).toLocaleString(locale)} ₸</p>
              </div>
              <div className="text-right">
                <p className="mb-1 text-xs text-[#6B7280]">{copy.to}</p>
                <p className="text-xl font-bold text-[#111827]">{(data.budgetMax || 0).toLocaleString(locale)} ₸</p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-semibold text-[#111827]">{copy.hairType}</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {config.hairTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      const current = data.hairProfile?.type || [];
                      const updated = current.includes(type)
                        ? current.filter((item) => item !== type)
                        : [...current, type];
                      setData({ ...data, hairProfile: { ...data.hairProfile, type: updated } });
                    }}
                    className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                      data.hairProfile?.type?.includes(type)
                        ? 'border-[#FF4DB8] bg-[#FFE1F2] text-[#FF4DB8]'
                        : 'border-[#EAE6EF] bg-white text-[#6B7280] hover:border-[#FF4DB8]/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-[#111827]">{copy.hairConcernsLabel}</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {config.hairConcerns.map((concern) => (
                  <button
                    key={concern}
                    type="button"
                    onClick={() => {
                      const current = data.hairProfile?.concerns || [];
                      const updated = current.includes(concern)
                        ? current.filter((item) => item !== concern)
                        : [...current, concern];
                      setData({ ...data, hairProfile: { ...data.hairProfile, concerns: updated } });
                    }}
                    className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                      data.hairProfile?.concerns?.includes(concern)
                        ? 'border-[#FF4DB8] bg-[#FFE1F2] text-[#FF4DB8]'
                        : 'border-[#EAE6EF] bg-white text-[#6B7280] hover:border-[#FF4DB8]/50'
                    }`}
                  >
                    {concern}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-semibold text-[#111827]">{copy.coverage}</p>
              <div className="grid grid-cols-3 gap-3">
                {config.coverageOptions.map((coverage) => (
                  <button
                    key={coverage}
                    type="button"
                    onClick={() => setData({ ...data, makeupProfile: { ...data.makeupProfile, coverage } })}
                    className={`rounded-xl border-2 p-4 font-medium transition-all ${
                      data.makeupProfile?.coverage === coverage
                        ? 'border-[#FF4DB8] bg-[#FFE1F2] text-[#FF4DB8]'
                        : 'border-[#EAE6EF] bg-white text-[#6B7280] hover:border-[#FF4DB8]/50'
                    }`}
                  >
                    {coverage}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-semibold text-[#111827]">{copy.favoriteNotes}</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {config.fragranceNotes.map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => {
                      const current = data.fragranceProfile?.notes || [];
                      const updated = current.includes(note)
                        ? current.filter((item) => item !== note)
                        : [...current, note];
                      setData({ ...data, fragranceProfile: { ...data.fragranceProfile, notes: updated } });
                    }}
                    className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                      data.fragranceProfile?.notes?.includes(note)
                        ? 'border-[#FF4DB8] bg-[#FFE1F2] text-[#FF4DB8]'
                        : 'border-[#EAE6EF] bg-white text-[#6B7280] hover:border-[#FF4DB8]/50'
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-[#111827]">{copy.intensity}</p>
              <div className="grid grid-cols-3 gap-3">
                {config.intensityOptions.map((intensity) => (
                  <button
                    key={intensity}
                    type="button"
                    onClick={() =>
                      setData({ ...data, fragranceProfile: { ...data.fragranceProfile, intensity } })
                    }
                    className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                      data.fragranceProfile?.intensity === intensity
                        ? 'border-[#FF4DB8] bg-[#FFE1F2] text-[#FF4DB8]'
                        : 'border-[#EAE6EF] bg-white text-[#6B7280] hover:border-[#FF4DB8]/50'
                    }`}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-[#EAE6EF] bg-white pt-4">
        <Button variant="ghost" onClick={currentStep === 1 ? onClose : handleBack} disabled={isLoading}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          {currentStep === 1 ? copy.cancel : copy.back}
        </Button>

        <Button variant="primary" onClick={handleNext} disabled={!canProceed() || isLoading} className="flex-1">
          {isLoading ? (
            copy.saving
          ) : currentStep === config.steps.length ? (
            copy.saveProfile
          ) : (
            <>
              {copy.next}
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
