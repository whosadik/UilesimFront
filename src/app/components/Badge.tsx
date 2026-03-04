import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full bg-[#FFE1F2] border border-[#FF4DB8] text-xs text-[#FF4DB8] font-medium ${className}`}>
      {children}
    </div>
  );
}
