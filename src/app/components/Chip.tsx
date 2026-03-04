import { ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
  className?: string;
}

export function Chip({ children, className = '' }: ChipProps) {
  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full bg-white/80 border border-gray-200 text-xs text-gray-700 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}