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
        'bg-white hairline-all transition-all duration-150',
        hoverable && 'hover:border-ink hover:shadow-xs',
        className
      )}
      {...props}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-6 py-4 hairline-b bg-ground/50">
          <div>
            {title && (
              <h3 className="font-display font-black text-ink tracking-tight text-sm uppercase">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="font-mono text-[10px] text-ink-muted mt-0.5 uppercase tracking-wider">
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
