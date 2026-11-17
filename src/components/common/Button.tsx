import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-mono font-medium tracking-tight uppercase transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2.5 gap-2',
    lg: 'text-sm px-6 py-3.5 gap-2.5',
  };

  const variants = {
    // Primary: Pure Black background with crisp White text, inverts on hover
    primary:
      'bg-mono-950 text-mono-0 border border-mono-950 hover:bg-mono-0 hover:text-mono-950 hover:border-mono-950',
    // Secondary: Light grey background, dark grey on hover
    secondary:
      'bg-mono-150 text-mono-900 border border-mono-200 hover:bg-mono-200 hover:border-mono-400',
    // Outline: Transparent background with razor-thin black border
    outline:
      'bg-transparent text-mono-900 border border-mono-900 hover:bg-mono-950 hover:text-mono-0',
    // Ghost: No border until hover
    ghost:
      'bg-transparent text-mono-700 hover:text-mono-950 hover:bg-mono-150',
    // Danger: Monochromatic high-contrast warning (Heavy black outline with strike feel)
    danger:
      'bg-mono-0 text-mono-950 border-2 border-mono-950 hover:bg-mono-950 hover:text-mono-0',
  };

  return (
    <button
      className={cn(base, sizeStyles[size], variants[variant], className)}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
