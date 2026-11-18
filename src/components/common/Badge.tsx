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
    sm: 'text-[9px] px-2 py-0.5 gap-1.5',
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
              'bg-[#E8F8EE] text-[#008736] border border-[#A6E8BA] font-bold',
              className
            )}
          >
            <span className="w-1.5 h-1.5 bg-[#00C853] rounded-full inline-block" />
            {children || 'Optimal'}
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span
            className={cn(
              base,
              sizeStyles[size],
              'bg-[#EEF2FF] text-[#2F5BFF] border border-[#BAC7FF] font-bold',
              className
            )}
          >
            <span className="w-1.5 h-1.5 bg-[#2F5BFF] rounded-full inline-block animate-pulse" />
            {children || 'Low Stock'}
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span
            className={cn(
              base,
              sizeStyles[size],
              'bg-[#FFF3F0] text-[#FF3D00] border border-[#FFCCBC] font-bold',
              className
            )}
          >
            <span className="w-1.5 h-1.5 bg-[#FF3D00] rounded-full inline-block" />
            {children || 'Depleted'}
          </span>
        );
    }
  }

  const variants = {
    solid: 'bg-[#0D0D0F] text-white border border-[#0D0D0F]',
    outline: 'bg-transparent text-[#0D0D0F] border border-[#D7D8DD]',
    neutral: 'bg-[#F2F2F4] text-[#4E5058] border border-[#D7D8DD]',
    subtle: 'bg-white text-[#6E6F76] border border-[#D7D8DD]',
  };

  return (
    <span className={cn(base, sizeStyles[size], variants[variant], className)}>
      {children}
    </span>
  );
};
