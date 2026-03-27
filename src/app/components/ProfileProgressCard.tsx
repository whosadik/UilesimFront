import { User, ChevronRight } from 'lucide-react';
import * as Progress from '@radix-ui/react-progress';
import { Button } from './Button';
import { useI18n } from '../../shared/i18n/LanguageContext';

interface ProfileProgressCardProps {
  progress: number | string;
  completedFields: number | string;
  totalFields: number | string;
  missingFields?: string[];
  onComplete?: () => void;
}

const profileProgressCopy = {
  ru: {
    fallbackMissingFields: ['Тип кожи', 'Любимые категории'],
    title: 'Заполните профиль',
    description: 'Получите персональные рекомендации и эксклюзивные офферы.',
    progress: (completed: number, total: number) => `Заполнено ${completed} из ${total} полей`,
    remaining: 'Осталось указать:',
    button: 'Заполнить профиль',
  },
  kk: {
    fallbackMissingFields: ['Тері түрі', 'Ұнайтын санаттар'],
    title: 'Профильді толтырыңыз',
    description: 'Жеке ұсыныстар мен эксклюзивті офферлер алыңыз.',
    progress: (completed: number, total: number) => `${completed} / ${total} өріс толтырылған`,
    remaining: 'Тағы толтыру керек:',
    button: 'Профильді толтыру',
  },
  en: {
    fallbackMissingFields: ['Skin type', 'Favorite categories'],
    title: 'Complete your profile',
    description: 'Get personal recommendations and exclusive offers.',
    progress: (completed: number, total: number) => `${completed} of ${total} fields completed`,
    remaining: 'Still missing:',
    button: 'Complete profile',
  },
} as const;

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export function ProfileProgressCard({
  progress,
  completedFields,
  totalFields,
  missingFields,
  onComplete,
}: ProfileProgressCardProps) {
  const { language } = useI18n();
  const copy = profileProgressCopy[language];
  const completed = Math.max(0, Math.round(toNumber(completedFields) ?? 0));
  const totalFromApi = Math.round(toNumber(totalFields) ?? 0);
  const total = totalFromApi > 0 ? totalFromApi : completed;
  const progressFromApi = toNumber(progress);
  const progressPct =
    progressFromApi !== undefined
      ? Math.max(0, Math.min(100, Math.round(progressFromApi)))
      : total > 0
        ? Math.max(0, Math.min(100, Math.round((completed / total) * 100)))
        : 0;

  const fieldsToShow = Array.isArray(missingFields) && missingFields.length > 0 ? missingFields : copy.fallbackMissingFields;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-[#EAE6EF]">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FFE1F2] flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-[#FF4DB8]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-[#111827] mb-1">{copy.title}</h3>
            <p className="text-sm text-[#6B7280]">{copy.description}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6B7280]">{copy.progress(completed, total)}</span>
            <span className="font-semibold text-[#FF4DB8]">{progressPct}%</span>
          </div>
          <Progress.Root className="relative overflow-hidden bg-[#EAE6EF] rounded-full w-full h-2" value={progressPct}>
            <Progress.Indicator className="bg-gradient-to-r from-[#FF4DB8] to-pink-400 h-full transition-transform duration-300 ease-out" style={{ transform: `translateX(-${100 - progressPct}%)` }} />
          </Progress.Root>
        </div>

        {progressPct < 100 && fieldsToShow.length > 0 && (
          <div className="p-3 rounded-xl bg-white border border-[#EAE6EF]">
            <p className="text-xs text-[#6B7280] mb-2">{copy.remaining}</p>
            <ul className="space-y-1.5">
              {fieldsToShow.map((field) => (
                <li key={field} className="flex items-center gap-2 text-xs text-[#111827]">
                  <span className="w-1 h-1 rounded-full bg-[#FF4DB8]" />
                  {field}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button variant="ghost" onClick={onComplete} className="w-full justify-between">
          <span>{copy.button}</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
