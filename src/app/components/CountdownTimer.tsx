import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { getTimeRemaining } from "../utils/formatters";

interface CountdownTimerProps {
  expiryDate: Date | string;
  onExpire?: () => void;
  variant?: "normal" | "compact";
}

/**
 * Countdown timer component for offers
 * Shows warning state when < 1 hour remaining (not aggressive red, subtle accent)
 */
export function CountdownTimer({
  expiryDate,
  onExpire,
  variant = "normal",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(expiryDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(expiryDate);
      setTimeLeft(remaining);

      if (remaining.totalHours <= 0 && onExpire) {
        onExpire();
        clearInterval(interval);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiryDate, onExpire]);

  if (timeLeft.totalHours <= 0) {
    return (
      <div className="text-sm text-gray-500 flex items-center gap-1">
        <Clock className="w-4 h-4" />
        <span>Истекло</span>
      </div>
    );
  }

  const isWarning = timeLeft.isWarning;

  if (variant === "compact") {
    return (
      <div
        className={`text-sm flex items-center gap-1 ${
          isWarning ? "text-pink-500" : "text-gray-600"
        }`}
      >
        <Clock className="w-4 h-4" />
        <span>
          {timeLeft.hours}ч {timeLeft.minutes}м
        </span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
        isWarning
          ? "bg-pink-50 text-pink-500 border border-pink-100"
          : "bg-gray-50 text-gray-600 border border-gray-200"
      }`}
    >
      <Clock className="w-4 h-4" />
      <span>
        {isWarning ? (
          <>
            Истекает через <span className="font-semibold">{timeLeft.minutes} мин</span>
          </>
        ) : timeLeft.hours < 24 ? (
          <>
            Истекает через{" "}
            <span className="font-semibold">
              {timeLeft.hours} ч {timeLeft.minutes} мин
            </span>
          </>
        ) : (
          <>
            Истекает через{" "}
            <span className="font-semibold">
              {Math.floor(timeLeft.hours / 24)} дн
            </span>
          </>
        )}
      </span>
    </div>
  );
}
