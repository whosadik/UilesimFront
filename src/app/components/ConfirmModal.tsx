import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "../../shared/i18n/LanguageContext";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: "danger" | "default";
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  variant = "default",
  isLoading = false,
}: ConfirmModalProps) {
  const { language } = useI18n();
  const copy = language === "kk"
    ? { confirm: "Растау", cancel: "Бас тарту", loading: "Жүктелуде..." }
    : language === "en"
      ? { confirm: "Confirm", cancel: "Cancel", loading: "Loading..." }
      : { confirm: "Подтвердить", cancel: "Отмена", loading: "Загрузка..." };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {variant === "danger" && (
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          )}
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          <Button variant="secondary" size="md" onClick={() => onOpenChange(false)} className="flex-1" disabled={isLoading}>
            {cancelLabel ?? copy.cancel}
          </Button>
          <Button variant="primary" size="md" onClick={handleConfirm} className="flex-1" disabled={isLoading}>
            {isLoading ? copy.loading : confirmLabel ?? copy.confirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
