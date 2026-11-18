import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

interface CategoryCapitalBarChartProps {
  data: Array<{
    name: string;
    count: number;
    units: number;
    valuation: number;
    pct: number;
  }>;
}

export const CategoryCapitalBarChart: React.FC<CategoryCapitalBarChartProps> = ({ data }) => {
  return (
    <div className="bg-mono-50 border border-mono-200 p-4 space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-mono text-xs font-bold text-mono-950 uppercase tracking-wider">
            Capital Distribution by Category ($ Valuation)
          </h4>
          <p className="font-mono text-[11px] text-mono-500">
            Relative balance sheet exposure across product lines
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-signal text-white font-bold">
          CAPITAL ALLOCATION
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 35, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(13, 13, 15, 0.08)" horizontal={false} />
            <XAxis
              type="number"
              stroke="#6E6F76"
              fontSize={10}
              fontFamily="IBM Plex Mono, monospace"
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#0D0D0F"
              fontSize={11}
              fontFamily="IBM Plex Mono, monospace"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0D0D0F',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '0px',
                color: '#ffffff',
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '11px',
              }}
              formatter={(val: any, _name: any, item: any) => [
                `${formatCurrency(Number(val))} (${item.payload.units} units, ${item.payload.pct.toFixed(1)}% of total)`,
                item.payload.name,
              ]}
            />
            <Bar dataKey="valuation" fill="#2F5BFF" barSize={16} radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
