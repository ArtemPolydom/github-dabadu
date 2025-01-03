import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-medium transition-colors focus:outline-none',
          variant === 'primary' && 'bg-emerald-500 text-white hover:bg-emerald-600',
          variant === 'outline' && 'border border-emerald-500 text-emerald-500 hover:bg-emerald-50',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );
  }
);