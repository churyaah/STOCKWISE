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
import { Card } from '../common/Card';
import { Product } from '../../types';

interface StockHealthRadarChartProps {
  products: Product[];
}

export const StockHealthRadarChart: React.FC<StockHealthRadarChartProps> = ({ products }) => {
  const stockRatioData = useMemo(() => {
    return products.slice(0, 7).map(p => {
      const ratio = p.reorder_level > 0 ? (p.current_quantity / p.reorder_level) * 100 : 100;
      return {
        sku: p.sku,
        name: p.name,
        ratio: Math.min(250, Math.round(ratio)),
        quantity: p.current_quantity,
        reorder: p.reorder_level,
      };
    });
  }, [products]);

  return (
    <Card
      title="Stock Health Index (% of Safety Threshold)"
      subtitle="Ratio vs reorder watermark (100% = exact safety line, <100% = deficit)"
      className="w-full bg-white"
    >
      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stockRatioData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(13, 13, 15, 0.08)" horizontal={false} />
            <XAxis
              type="number"
              stroke="#6E6F76"
              fontSize={10}
              fontFamily="IBM Plex Mono, monospace"
              domain={[0, 250]}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="sku"
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
              formatter={(_val: any, _name: any, item: any) => [
                `${item.payload.quantity} units (Threshold: ${item.payload.reorder} units) — ${item.payload.ratio}%`,
                item.payload.name,
              ]}
            />
            <Bar dataKey="ratio" barSize={14}>
              {stockRatioData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.ratio <= 50 ? '#0D0D0F' : entry.ratio <= 100 ? '#2F5BFF' : '#4E5058'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
