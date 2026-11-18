import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

interface FastMovingVelocityChartProps {
  data: Array<{
    product: {
      id: string;
      sku: string;
      name: string;
    };
    unitsDispatched: number;
    turnoverRevenue: number;
  }>;
}

export const FastMovingVelocityChart: React.FC<FastMovingVelocityChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    return data.slice(0, 6).map(item => ({
      sku: item.product.sku,
      name: item.product.name,
      units: item.unitsDispatched,
      revenue: item.turnoverRevenue,
    }));
  }, [data]);

  return (
    <div className="bg-mono-50 border border-mono-200 p-4 space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-mono text-xs font-bold text-mono-950 uppercase tracking-wider">
            Dispatched Volume Velocity (Top SKUs)
          </h4>
          <p className="font-mono text-[11px] text-mono-500">
            Ranked outbound fulfillment frequency in selected timeframe
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-mono-950 text-white font-bold">
          LIVE VELOCITY
        </span>
      </div>

      <div className="h-64 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center font-mono text-xs text-mono-400">
            No outbound dispatches in selected window.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(13, 13, 15, 0.08)" vertical={false} />
              <XAxis
                dataKey="sku"
                stroke="#6E6F76"
                fontSize={11}
                fontFamily="IBM Plex Mono, monospace"
              />
              <YAxis
                stroke="#6E6F76"
                fontSize={11}
                fontFamily="IBM Plex Mono, monospace"
                allowDecimals={false}
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
                formatter={(_val: any, _name: any, item: any) => [
                  `${item.payload.units} units (${formatCurrency(item.payload.revenue)} turnover)`,
                  item.payload.name,
                ]}
              />
              <Bar dataKey="units" fill="#0D0D0F" radius={[2, 2, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#2F5BFF' : '#0D0D0F'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
