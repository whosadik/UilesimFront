import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-full font-medium text-sm transition-all duration-200';
  
  const variantStyles = {
    // Primary: Dark Ink background
    primary: 'bg-[#111827] text-white hover:bg-[#0B1220] hover:shadow-lg active:scale-[0.98]',
    // Ghost: White with subtle pink glow on hover
    ghost: 'bg-white/80 text-gray-800 border border-[#EAE6EF] hover:bg-white hover:shadow-md hover:shadow-[#FF4DB8]/10 hover:border-[#FF4DB8]/20 active:scale-[0.98] backdrop-blur-sm',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
