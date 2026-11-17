import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  headerAction?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  headerAction,
  title,
  subtitle,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-mono-0 border border-mono-200 transition-all duration-150',
        hoverable && 'hover:border-mono-800 hover:shadow-sm',
        className
      )}
      {...props}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-mono-200">
          <div>
            {title && (
              <h3 className="font-display font-semibold text-mono-950 tracking-tight text-base">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="font-mono text-xs text-mono-500 mt-0.5 uppercase tracking-wide">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
