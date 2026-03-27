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
    </button>
  );
}