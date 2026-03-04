import { ReactNode } from 'react';

interface IconButtonProps {
  icon: ReactNode;
  badge?: number;
  onClick?: () => void;
}

export function IconButton({ icon, badge, onClick }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/80 border border-[#EAE6EF] text-[#111827] hover:bg-white hover:shadow-md hover:border-[#FF4DB8]/20 transition-all duration-200 backdrop-blur-sm"
    >
      {icon}
      {badge && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-[#FF4DB8] text-white text-xs font-medium rounded-full border-2 border-white">
          {badge}
        </span>
      )}
    </button>
  );
}