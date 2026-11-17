import React from 'react';
import { Card } from '../common/Card';
import { cn } from '../../utils/cn';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    label: string;
    direction?: 'up' | 'down' | 'neutral';
  };
  highlight?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = false,
}) => {
  return (
    <Card
      hoverable
      className={cn(
        'relative overflow-hidden transition-all duration-150',
        highlight && 'border-mono-950 bg-mono-50'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-mono-500 font-semibold">
            {title}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-mono-950 mt-2">
            {value}
          </h2>
          {subtitle && (
            <p className="font-sans text-xs text-mono-600 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-2.5 bg-mono-150 text-mono-900 border border-mono-200">
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-mono-200/60 flex items-center justify-between text-xs font-mono">
          <span className="text-mono-600">{trend.label}</span>
          <span className="font-semibold text-mono-900 uppercase">
            {trend.direction === 'up' && '↑ OPTIMAL'}
            {trend.direction === 'down' && '↓ ATTENTION'}
            {trend.direction === 'neutral' && '• TRACKED'}
          </span>
        </div>
      )}
    </Card>
  );
};
