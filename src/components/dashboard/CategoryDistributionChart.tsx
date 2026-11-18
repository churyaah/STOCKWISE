import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '../common/Card';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CategoryDistributionChartProps {
  products: Product[];
}

export const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({ products }) => {
  const data = useMemo(() => {
    const map: Record<string, { valuation: number; units: number }> = {};
    for (const p of products) {
      if (!map[p.category]) {
        map[p.category] = { valuation: 0, units: 0 };
      }
      map[p.category].valuation += p.current_quantity * p.purchase_price;
      map[p.category].units += p.current_quantity;
    }

    return Object.entries(map).map(([name, val]) => ({
      name,
      value: Math.round(val.valuation),
      units: val.units,
    })).sort((a, b) => b.value - a.value);
  }, [products]);

  // Strict monochromatic + Signal palette
  const COLORS = [
    '#2F5BFF', // signal accent
    '#0D0D0F', // deep ink
    '#4E5058', // graphite
    '#82838C', // medium grey
    '#B5B6BE', // light silver
    '#D7D8DD', // whisper grey
  ];

  return (
    <Card
      title="Asset Distribution by Category"
      subtitle="Deterministic valuation weight per inventory echelon"
      className="w-full bg-white"
    >
      <div className="h-72 w-full pt-1">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center font-mono text-xs text-ink-muted">
            No catalog category data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                stroke="#FFFFFF"
                strokeWidth={2}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D0D0F',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '0px',
                  color: '#ffffff',
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '11px',
                }}
                formatter={(val: any, name: any, item: any) => [
                  `${formatCurrency(Number(val))} (${item.payload.units} units)`,
                  name,
                ]}
              />
              <Legend
                wrapperStyle={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  paddingTop: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
