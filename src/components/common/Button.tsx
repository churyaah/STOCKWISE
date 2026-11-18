import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'pill' | 'signal';
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
    'inline-flex items-center justify-center font-mono font-medium tracking-wider uppercase transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-[10px] px-3 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2 gap-2',
    lg: 'text-xs px-6 py-3 gap-2.5',
  };

  const variants = {
    // Primary: Solid Ink
    primary:
      'bg-[#0D0D0F] text-white border border-[#0D0D0F] hover:bg-[#2F5BFF] hover:border-[#2F5BFF] hover:text-white transition-colors shadow-xs',
    // Signal: Electric Blue from Superdesign
    signal:
      'bg-[#2F5BFF] text-white border border-[#2F5BFF] hover:bg-[#1D44DB] hover:border-[#1D44DB] transition-colors shadow-xs',
    // Pill: Rounded-full pill with electric blue hover
    pill:
      'rounded-full bg-[#0D0D0F] text-white hover:bg-[#2F5BFF] hover:text-white transition-colors shadow-xs',
    // Secondary: Stage ground
    secondary:
      'bg-[#F2F2F4] text-[#0D0D0F] border border-[#D7D8DD] hover:bg-[#0D0D0F] hover:text-white transition-colors',
    // Outline: Transparent with hairline
    outline:
      'bg-transparent text-[#0D0D0F] border border-[#D7D8DD] hover:border-[#0D0D0F] hover:bg-[#F2F2F4] transition-colors',
    // Ghost: No border
    ghost:
      'bg-transparent text-[#6E6F76] hover:text-[#0D0D0F] hover:bg-[#F2F2F4]',
    // Danger: High contrast border with signal strike
    danger:
      'bg-[#FFF5F2] text-[#FF3D00] border border-[#FFCCBC] hover:bg-[#FF3D00] hover:text-white',
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
