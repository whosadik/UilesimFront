import { useState } from 'react';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from './Button';
import * as Slider from '@radix-ui/react-slider';
import { toast } from 'sonner';

interface ProfileWizardProps {
  onComplete?: (data: ProfileData) => void;
  onClose?: () => void;
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

const steps = [
  { id: 1, title: 'Тип кожи', description: 'Выберите ваш тип кожи' },
  { id: 2, title: 'Цели', description: 'Что вы хотите улучшить?' },
  { id: 3, title: 'Избегать', description: 'Исключения и аллергены' },
  { id: 4, title: 'Бюджет', description: 'Комфортный ценовой диапазон' },
  { id: 5, title: 'Волосы', description: 'Тип волос и уход (опционально)' },
  { id: 6, title: 'Макияж', description: 'Предпочтения по макияжу (опционально)' },
  { id: 7, title: 'Парфюм', description: 'Любимые ароматы (опционально)' },
];

const skinTypes = ['Сухая', 'Жирная', 'Комбинированная', 'Нормальная', 'Чувствительная'];
const skinGoals = ['Увлажнение', 'Анти-эйдж', 'Против акне', 'Осветление', 'Защита от солнца', 'Сужение пор'];
const avoidFlags = ['Парабены', 'Силиконы', 'Отдушки', 'Спирт', 'Эфирные масла', 'Глютен'];
const hairTypes = ['Прямые', 'Волнистые', 'Кудрявые', 'Афро'];
const hairConcerns = ['Выпадение', 'Секущиеся концы', 'Сухость', 'Жирность', 'Перхоть', 'Объём'];
const coverageOptions = ['Лёгкое', 'Среднее', 'Плотное'];
const fragranceNotes = ['Цитрус', 'Цветочные', 'Древесные', 'Восточные', 'Свежие', 'Пряные'];
const intensityOptions = ['Лёгкий', 'Средний', 'Интенсивный'];

export function ProfileWizard({ onComplete, onClose }: ProfileWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ProfileData>({
    skinType: [],
    goals: [],
    avoidFlags: [],
    budgetMin: 500,
    budgetMax: 5000,
    hairProfile: { type: [], concerns: [] },
    makeupProfile: {},
    fragranceProfile: { notes: [] },
  });

  const toggleSelection = (field: keyof ProfileData, value: string) => {
    const current = data[field] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setData({ ...data, [field]: updated });
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      onComplete?.(data);
      toast.success('Профиль сохранён', {
        description: '+50 баллов за завершение профиля',
      });
    }, 1000);
  };

  const canProceed = () => {
    if (currentStep === 1) return data.skinType && data.skinType.length > 0;
    if (currentStep === 2) return data.goals && data.goals.length > 0;
    return true; // Other steps are optional
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentStep > step.id
                      ? 'bg-[#FF4DB8] text-white'
                      : currentStep === step.id
                      ? 'bg-[#111827] text-white'
                      : 'bg-gray-200 text-[#6B7280]'
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className="text-xs text-[#6B7280] mt-2 hidden lg:block text-center">
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 flex-1 ${currentStep > step.id ? 'bg-[#FF4DB8]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#111827] mb-2">{steps[currentStep - 1].title}</h2>
          <p className="text-sm text-[#6B7280]">{steps[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[300px] mb-8">
        {/* Step 1: Skin Type */}
        {currentStep === 1 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {skinTypes.map((type) => (
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

        {/* Step 2: Goals */}
        {currentStep === 2 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {skinGoals.map((goal) => (
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

        {/* Step 3: Avoid Flags */}
        {currentStep === 3 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {avoidFlags.map((flag) => (
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

        {/* Step 4: Budget */}
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

        {/* Step 5: Hair Profile */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-[#111827] mb-3">Тип волос</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {hairTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      const current = data.hairProfile?.type || [];
                      const updated = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
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
                {hairConcerns.map((concern) => (
                  <button
                    key={concern}
                    onClick={() => {
                      const current = data.hairProfile?.concerns || [];
                      const updated = current.includes(concern) ? current.filter(c => c !== concern) : [...current, concern];
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

        {/* Step 6: Makeup */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-[#111827] mb-3">Покрытие</p>
              <div className="grid grid-cols-3 gap-3">
                {coverageOptions.map((coverage) => (
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

        {/* Step 7: Fragrance */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-[#111827] mb-3">Любимые ноты</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {fragranceNotes.map((note) => (
                  <button
                    key={note}
                    onClick={() => {
                      const current = data.fragranceProfile?.notes || [];
                      const updated = current.includes(note) ? current.filter(n => n !== note) : [...current, note];
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
                {intensityOptions.map((intensity) => (
                  <button
                    key={intensity}
                    onClick={() => setData({ ...data, fragranceProfile: { ...data.fragranceProfile, intensity } })}
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

      {/* Actions */}
      <div className="flex items-center gap-3 sticky bottom-0 bg-white pt-4 border-t border-[#EAE6EF]">
        <Button
          variant="ghost"
          onClick={currentStep === 1 ? onClose : handleBack}
          disabled={isLoading}
        >
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
          ) : currentStep === steps.length ? (
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
