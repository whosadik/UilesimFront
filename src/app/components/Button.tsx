import { ButtonHTMLAttributes, MouseEvent, ReactNode, useRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  onClick,
  ...props
}: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const baseStyles =
    'group relative overflow-hidden px-6 py-3 rounded-full font-medium text-sm transition-all duration-[var(--motion-duration-base,240ms)] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform';

  const variantStyles = {
    primary:
      'bg-[#111827] text-white hover:bg-[#0B1220] hover:shadow-[0_18px_40px_-18px_rgba(255,77,184,0.55)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]',
    ghost:
      'bg-white/80 text-gray-800 border border-[#EAE6EF] hover:bg-white hover:shadow-md hover:shadow-[#FF4DB8]/10 hover:border-[#FF4DB8]/30 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98] backdrop-blur-sm',
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const button = ref.current;
    if (button && typeof window !== 'undefined') {
      const reduceMotion =
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduceMotion) {
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement('span');
        ripple.className = 'uilesim-ripple';
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
        button.appendChild(ripple);
        window.setTimeout(() => ripple.remove(), 600);
      }
    }
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-full"
      />
      <span className="relative inline-flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
