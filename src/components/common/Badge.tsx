import React from 'react';
import { cn } from '../../utils/cn';
import { StockStatus } from '../../types';

interface BadgeProps {
  status?: StockStatus;
  variant?: 'solid' | 'outline' | 'neutral' | 'subtle';
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant = 'solid',
  children,
  className,
  size = 'md',
}) => {
  const base = 'inline-flex items-center font-mono uppercase tracking-wider select-none';
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  if (status) {
    switch (status) {
      case 'IN_STOCK':
        return (
          <span
            className={cn(
              base,
              sizeStyles[size],
              'bg-mono-950 text-mono-0 border border-mono-950',
              className
            )}
          >
            <span className="w-1.5 h-1.5 bg-mono-0 rounded-full inline-block" />
            {children || 'In Stock'}
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span
            className={cn(
              base,
              sizeStyles[size],
              'bg-mono-150 text-mono-950 border border-dashed border-mono-800 font-semibold',
              className
            )}
          >
            <span className="inline-block text-[9px]">▲</span>
            {children || 'Low Stock'}
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span
            className={cn(
              base,
              sizeStyles[size],
              'bg-mono-0 text-mono-600 border border-mono-300 line-through decoration-mono-600',
              className
            )}
          >
            <span className="w-1.5 h-1.5 border border-mono-500 rounded-full inline-block" />
            {children || 'Out of Stock'}
          </span>
        );
    }
  }

  const variants = {
    solid: 'bg-mono-950 text-mono-0 border border-mono-950',
    outline: 'bg-transparent text-mono-900 border border-mono-900',
    neutral: 'bg-mono-150 text-mono-800 border border-mono-200',
    subtle: 'bg-mono-50 text-mono-600 border border-mono-150',
  };

  return (
    <span className={cn(base, sizeStyles[size], variants[variant], className)}>
      {children}
    </span>
  );
};
