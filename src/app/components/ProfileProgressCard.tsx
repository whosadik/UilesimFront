import { User, ChevronRight } from 'lucide-react';
import * as Progress from '@radix-ui/react-progress';
import { Button } from './Button';

interface ProfileProgressCardProps {
  progress: number; // 0-100
  completedFields: number;
  totalFields: number;
  onComplete?: () => void;
}

export function ProfileProgressCard({
  progress,
  completedFields,
  totalFields,
  onComplete,
}: ProfileProgressCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-[#EAE6EF]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FFE1F2] flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-[#FF4DB8]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-[#111827] mb-1">
              Заполните профиль
            </h3>
            <p className="text-sm text-[#6B7280]">
              Получите персональные рекомендации и эксклюзивные офферы
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6B7280]">
              Заполнено {completedFields} из {totalFields} полей
            </span>
            <span className="font-semibold text-[#FF4DB8]">
              {progress}%
            </span>
          </div>

          <Progress.Root
            className="relative overflow-hidden bg-[#EAE6EF] rounded-full w-full h-2"
            value={progress}
          >
            <Progress.Indicator
              className="bg-gradient-to-r from-[#FF4DB8] to-pink-400 h-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${100 - progress}%)` }}
            />
          </Progress.Root>
        </div>

        {/* Missing Fields */}
        {progress < 100 && (
          <div className="p-3 rounded-xl bg-white border border-[#EAE6EF]">
            <p className="text-xs text-[#6B7280] mb-2">Осталось указать:</p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2 text-xs text-[#111827]">
                <span className="w-1 h-1 rounded-full bg-[#FF4DB8]"></span>
                Тип кожи
              </li>
              <li className="flex items-center gap-2 text-xs text-[#111827]">
                <span className="w-1 h-1 rounded-full bg-[#FF4DB8]"></span>
                Любимые категории
              </li>
            </ul>
          </div>
        )}

        {/* CTA */}
        <Button
          variant="ghost"
          onClick={onComplete}
          className="w-full justify-between"
        >
          <span>Заполнить профиль</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
