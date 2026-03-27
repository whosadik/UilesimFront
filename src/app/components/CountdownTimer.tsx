import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { getTimeRemaining } from "../utils/formatters";
import { useI18n } from "../../shared/i18n/LanguageContext";

interface CountdownTimerProps {
  expiryDate: Date | string;
  onExpire?: () => void;
  variant?: "normal" | "compact";
}

export function CountdownTimer({
  expiryDate,
  onExpire,
  variant = "normal",
}: CountdownTimerProps) {
  const { language } = useI18n();
  const copy = language === "kk"
    ? { expired: "Аяқталды", expiresIn: "Аяқталуына", min: "мин", hour: "сағ", day: "күн" }
    : language === "en"
      ? { expired: "Expired", expiresIn: "Expires in", min: "min", hour: "h", day: "d" }
      : { expired: "Истекло", expiresIn: "Истекает через", min: "мин", hour: "ч", day: "дн" };
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(expiryDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(expiryDate);
      setTimeLeft(remaining);

      if (remaining.totalHours <= 0 && onExpire) {
        onExpire();
        clearInterval(interval);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [expiryDate, onExpire]);

  if (timeLeft.totalHours <= 0) {
    return (
      <div className="text-sm text-gray-500 flex items-center gap-1">
        <Clock className="w-4 h-4" />
        <span>{copy.expired}</span>
      </div>
    );
  }

  const isWarning = timeLeft.isWarning;

  if (variant === "compact") {
    return (
      <div className={`text-sm flex items-center gap-1 ${isWarning ? "text-pink-500" : "text-gray-600"}`}>
        <Clock className="w-4 h-4" />
        <span>{timeLeft.hours}{copy.hour} {timeLeft.minutes}{copy.min}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isWarning ? "bg-pink-50 text-pink-500 border border-pink-100" : "bg-gray-50 text-gray-600 border border-gray-200"}`}>
      <Clock className="w-4 h-4" />
      <span>
        {isWarning ? (
          <>
            {copy.expiresIn} <span className="font-semibold">{timeLeft.minutes} {copy.min}</span>
          </>
        ) : timeLeft.hours < 24 ? (
          <>
            {copy.expiresIn} <span className="font-semibold">{timeLeft.hours} {copy.hour} {timeLeft.minutes} {copy.min}</span>
          </>
        ) : (
          <>
            {copy.expiresIn} <span className="font-semibold">{Math.floor(timeLeft.hours / 24)} {copy.day}</span>
          </>
        )}
      </span>
    </div>
  );
}
