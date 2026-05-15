import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./Button";
import { Sparkles } from "lucide-react";
import { useI18n } from "../../shared/i18n/LanguageContext";

interface RoadmapRewardModalProps {
  open: boolean;
  points: number;
  onClose: () => void;
}

const copyByLanguage = {
  ru: {
    title: "Шаг выполнен",
    description: (points: number) =>
      `Вам начислено +${points} ${pointsWord(points, "ru")} за прохождение шага в roadmap.`,
    cta: "Отлично",
    suffix: "за роадмап",
  },
  kk: {
    title: "Қадам орындалды",
    description: (points: number) =>
      `Roadmap қадамын аяқтағаныңыз үшін +${points} ${pointsWord(points, "kk")} есептелді.`,
    cta: "Жақсы",
    suffix: "roadmap үшін",
  },
  en: {
    title: "Step completed",
    description: (points: number) =>
      `You earned +${points} ${pointsWord(points, "en")} for completing a roadmap step.`,
    cta: "Great",
    suffix: "for the roadmap",
  },
} as const;

function pointsWord(points: number, language: "ru" | "kk" | "en"): string {
  if (language === "en") return points === 1 ? "point" : "points";
  if (language === "kk") return "балл";
  const mod10 = points % 10;
  const mod100 = points % 100;
  if (mod10 === 1 && mod100 !== 11) return "балл";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "балла";
  return "баллов";
}

export function RoadmapRewardModal({ open, points, onClose }: RoadmapRewardModalProps) {
  const { language } = useI18n();
  const copy = copyByLanguage[language];

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-pink-500" />
          </div>
          <DialogTitle className="text-center">{copy.title}</DialogTitle>
          <DialogDescription className="text-center">
            {copy.description(points)}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <Button variant="primary" size="md" onClick={onClose} className="w-full">
            {copy.cta}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
