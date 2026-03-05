import { useMemo, useState } from 'react';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from './Button';
import * as Slider from '@radix-ui/react-slider';

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

const DEFAULT_OPTIONS: ProfileWizardOptions = {
  steps: [
    { id: 1, title: 'Тип кожи', description: 'Выберите ваш тип кожи' },
    { id: 2, title: 'Цели', description: 'Что вы хотите улучшить?' },
    { id: 3, title: 'Избегать', description: 'Исключения и аллергены' },
    { id: 4, title: 'Бюджет', description: 'Комфортный ценовой диапазон' },
    { id: 5, title: 'Волосы', description: 'Тип волос и уход (опционально)' },
    { id: 6, title: 'Макияж', description: 'Предпочтения по макияжу (опционально)' },
    { id: 7, title: 'Парфюм', description: 'Любимые ароматы (опционально)' },
  ],
  skinTypes: ['Сухая', 'Жирная', 'Комбинированная', 'Нормальная', 'Чувствительная'],
  skinGoals: ['Увлажнение', 'Анти-эйдж', 'Против акне', 'Осветление', 'Защита от солнца', 'Сужение пор'],
  avoidFlags: ['Парабены', 'Силиконы', 'Отдушки', 'Спирт', 'Эфирные масла', 'Глютен'],
  hairTypes: ['Прямые', 'Волнистые', 'Кудрявые', 'Афро'],
  hairConcerns: ['Выпадение', 'Секущиеся концы', 'Сухость', 'Жирность', 'Перхоть', 'Объём'],
  coverageOptions: ['Лёгкое', 'Среднее', 'Плотное'],
  fragranceNotes: ['Цитрус', 'Цветочные', 'Древесные', 'Восточные', 'Свежие', 'Пряные'],
  intensityOptions: ['Лёгкий', 'Средний', 'Интенсивный'],
};

const DEFAULT_DATA: ProfileData = {
  skinType: [],
  goals: [],
  avoidFlags: [],
  budgetMin: 500,
  budgetMax: 5000,
  hairProfile: { type: [], concerns: [] },
  makeupProfile: {},
  fragranceProfile: { notes: [] },
};

function mergeOptions(options?: Partial<ProfileWizardOptions>): ProfileWizardOptions {
  return {
    steps: options?.steps && options.steps.length > 0 ? options.steps : DEFAULT_OPTIONS.steps,
    skinTypes:
      options?.skinTypes && options.skinTypes.length > 0 ? options.skinTypes : DEFAULT_OPTIONS.skinTypes,
    skinGoals:
      options?.skinGoals && options.skinGoals.length > 0 ? options.skinGoals : DEFAULT_OPTIONS.skinGoals,
    avoidFlags:
      options?.avoidFlags && options.avoidFlags.length > 0 ? options.avoidFlags : DEFAULT_OPTIONS.avoidFlags,
    hairTypes:
      options?.hairTypes && options.hairTypes.length > 0 ? options.hairTypes : DEFAULT_OPTIONS.hairTypes,
    hairConcerns:
      options?.hairConcerns && options.hairConcerns.length > 0
        ? options.hairConcerns
        : DEFAULT_OPTIONS.hairConcerns,
    coverageOptions:
      options?.coverageOptions && options.coverageOptions.length > 0
        ? options.coverageOptions
        : DEFAULT_OPTIONS.coverageOptions,
    fragranceNotes:
      options?.fragranceNotes && options.fragranceNotes.length > 0
        ? options.fragranceNotes
        : DEFAULT_OPTIONS.fragranceNotes,
    intensityOptions:
      options?.intensityOptions && options.intensityOptions.length > 0
        ? options.intensityOptions
        : DEFAULT_OPTIONS.intensityOptions,
  };
}

export function ProfileWizard({ onComplete, onClose, options, initialData }: ProfileWizardProps) {
  const config = useMemo(() => mergeOptions(options), [options]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ProfileData>({
    ...DEFAULT_DATA,
    ...initialData,
    hairProfile: { ...DEFAULT_DATA.hairProfile, ...initialData?.hairProfile },
    makeupProfile: { ...DEFAULT_DATA.makeupProfile, ...initialData?.makeupProfile },
    fragranceProfile: { ...DEFAULT_DATA.fragranceProfile, ...initialData?.fragranceProfile },
  });

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
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {config.steps.map((item, idx) => (
            <div key={item.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentStep > item.id
                      ? 'bg-[#FF4DB8] text-white'
                      : currentStep === item.id
                        ? 'bg-[#111827] text-white'
                        : 'bg-gray-200 text-[#6B7280]'
                  }`}
                >
                  {currentStep > item.id ? <Check className="w-4 h-4" /> : item.id}
                </div>
                <span className="text-xs text-[#6B7280] mt-2 hidden lg:block text-center">
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
          <h2 className="text-2xl font-bold text-[#111827] mb-2">{step.title}</h2>
          <p className="text-sm text-[#6B7280]">{step.description}</p>
        </div>
      </div>

      <div className="min-h-[300px] mb-8">
        {currentStep === 1 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {config.skinTypes.map((type) => (
              <button
                key={type}
                onClick={() => toggleSelection('skinType', type)}
                className={`p-4 rounded-xl border-2 font-medium transition-all ${
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {config.skinGoals.map((goal) => (
              <button
                key={goal}
                onClick={() => toggleSelection('goals', goal)}
                className={`p-4 rounded-xl border-2 font-medium transition-all ${
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {config.avoidFlags.map((flag) => (
              <button
                key={flag}
                onClick={() => toggleSelection('avoidFlags', flag)}
                className={`p-4 rounded-xl border-2 font-medium transition-all ${
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
          <div className="space-y-6 max-w-md mx-auto">
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[data.budgetMin || 500, data.budgetMax || 5000]}
              onValueChange={([min, max]) => setData({ ...data, budgetMin: min, budgetMax: max })}
              max={10000}
              step={100}
              minStepsBetweenThumbs={5}
            >
              <Slider.Track className="bg-[#EAE6EF] relative grow rounded-full h-1">
                <Slider.Range className="absolute bg-[#FF4DB8] rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-[#FF4DB8] rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 transition-transform" />
              <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-[#FF4DB8] rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 transition-transform" />
            </Slider.Root>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280] mb-1">От</p>
                <p className="text-xl font-bold text-[#111827]">{data.budgetMin} ₽</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#6B7280] mb-1">До</p>
                <p className="text-xl font-bold text-[#111827]">{data.budgetMax} ₽</p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-[#111827] mb-3">Тип волос</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {config.hairTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      const current = data.hairProfile?.type || [];
                      const updated = current.includes(type)
                        ? current.filter((item) => item !== type)
                        : [...current, type];
                      setData({ ...data, hairProfile: { ...data.hairProfile, type: updated } });
                    }}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
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
              <p className="text-sm font-semibold text-[#111827] mb-3">Проблемы</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {config.hairConcerns.map((concern) => (
                  <button
                    key={concern}
                    onClick={() => {
                      const current = data.hairProfile?.concerns || [];
                      const updated = current.includes(concern)
                        ? current.filter((item) => item !== concern)
                        : [...current, concern];
                      setData({ ...data, hairProfile: { ...data.hairProfile, concerns: updated } });
                    }}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
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
              <p className="text-sm font-semibold text-[#111827] mb-3">Покрытие</p>
              <div className="grid grid-cols-3 gap-3">
                {config.coverageOptions.map((coverage) => (
                  <button
                    key={coverage}
                    onClick={() => setData({ ...data, makeupProfile: { ...data.makeupProfile, coverage } })}
                    className={`p-4 rounded-xl border-2 font-medium transition-all ${
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
              <p className="text-sm font-semibold text-[#111827] mb-3">Любимые ноты</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {config.fragranceNotes.map((note) => (
                  <button
                    key={note}
                    onClick={() => {
                      const current = data.fragranceProfile?.notes || [];
                      const updated = current.includes(note)
                        ? current.filter((item) => item !== note)
                        : [...current, note];
                      setData({ ...data, fragranceProfile: { ...data.fragranceProfile, notes: updated } });
                    }}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
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
              <p className="text-sm font-semibold text-[#111827] mb-3">Интенсивность</p>
              <div className="grid grid-cols-3 gap-3">
                {config.intensityOptions.map((intensity) => (
                  <button
                    key={intensity}
                    onClick={() =>
                      setData({ ...data, fragranceProfile: { ...data.fragranceProfile, intensity } })
                    }
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
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

      <div className="flex items-center gap-3 sticky bottom-0 bg-white pt-4 border-t border-[#EAE6EF]">
        <Button variant="ghost" onClick={currentStep === 1 ? onClose : handleBack} disabled={isLoading}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          {currentStep === 1 ? 'Отмена' : 'Назад'}
        </Button>

        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!canProceed() || isLoading}
          className="flex-1"
        >
          {isLoading ? (
            'Сохранение...'
          ) : currentStep === config.steps.length ? (
            'Сохранить профиль'
          ) : (
            <>
              Далее
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
