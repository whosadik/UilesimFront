import { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="w-16 h-16 mb-4 rounded-2xl bg-gray-100 flex items-center justify-center text-[#6B7280]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-[#111827] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#6B7280] mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
