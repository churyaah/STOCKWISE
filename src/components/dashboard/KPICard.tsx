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
        'relative overflow-hidden transition-all duration-150 border-[#D7D8DD] hover:border-[#2F5BFF]',
        highlight && 'border-[#FF3D00] bg-[#FFF5F2]'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-[#6E6F76] font-semibold">
            {title}
          </p>
          <h2 className="font-display text-3xl font-black tracking-tight text-[#0D0D0F] mt-2">
            {value}
          </h2>
          {subtitle && (
            <p className="font-mono text-xs text-[#5A5C64] mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-2.5 bg-[#F8F8FA] text-[#0D0D0F] border border-[#D7D8DD] hover:border-[#2F5BFF] transition-colors">
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-[#EAEBED] flex items-center justify-between text-xs font-mono">
          <span className="text-[#6E6F76]">{trend.label}</span>
          <span className="font-bold text-[#0D0D0F] uppercase">
            {trend.direction === 'up' && <span className="text-[#008736]">↑ OPTIMAL</span>}
            {trend.direction === 'down' && <span className="text-[#FF3D00]">↓ ATTENTION</span>}
            {trend.direction === 'neutral' && <span className="text-[#2F5BFF]">● NOMINAL</span>}
          </span>
        </div>
      )}
    </Card>
  );
};
