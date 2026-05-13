import { ReactNode } from 'react';

interface IconButtonProps {
  icon: ReactNode;
  badge?: number;
  onClick?: () => void;
}

export function IconButton({ icon, badge, onClick }: IconButtonProps) {
  const normalizedBadge =
    typeof badge === 'number' && Number.isFinite(badge)
      ? Math.max(0, Math.round(badge))
      : 0;
  const showBadge = normalizedBadge > 0;
  const badgeLabel = normalizedBadge > 99 ? '99+' : String(normalizedBadge);
  const className =
    'relative w-10 h-10 flex items-center justify-center rounded-full bg-white/80 border border-[#EAE6EF] text-[#111827] hover:bg-white hover:shadow-md hover:border-[#FF4DB8]/20 transition-all duration-200 backdrop-blur-sm';
  const content = (
    <>
      {icon}
      {showBadge ? (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full border-2 border-white bg-[#FF4DB8] text-[10px] font-bold leading-none text-white shadow-sm">
          {badgeLabel}
        </span>
      ) : null}
    </>
  );

  if (!onClick) {
    return <span className={className}>{content}</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
    >
      {content}
    </button>
  );
}
