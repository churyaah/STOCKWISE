import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../common/Card';
import { InventoryTransaction } from '../../types';

interface MovementChartProps {
  transactions: InventoryTransaction[];
}

export const MovementChart: React.FC<MovementChartProps> = ({ transactions }) => {
  // Aggregate transactions by date (last 7 recorded days or timeline)
  const chartData = useMemo(() => {
    const map: Record<string, { date: string; stockIn: number; stockOut: number }> = {};

    // Sort chronologically
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
    );

    for (const tx of sorted) {
      const dateKey = tx.transaction_date.split('T')[0];
      if (!map[dateKey]) {
        map[dateKey] = { date: dateKey, stockIn: 0, stockOut: 0 };
      }
      if (tx.type === 'IN') {
        map[dateKey].stockIn += tx.quantity;
      } else if (tx.type === 'OUT') {
        map[dateKey].stockOut += tx.quantity;
      }
    }

    const result = Object.values(map);
    // Return last 10 entries
    return result.slice(-10);
  }, [transactions]);

  return (
    <Card
      title="Stock Movement Velocity"
      subtitle="Stock-In (Procurement) vs Stock-Out (Fulfillment) Inflow/Outflow"
      className="w-full"
    >
      <div className="h-72 w-full pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center font-mono text-xs text-mono-400">
            No stock movement recorded in current ledger window.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#777777"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
                tickFormatter={(val) => {
                  try {
                    const parts = val.split('-');
                    return `${parts[1]}/${parts[2]}`;
                  } catch {
                    return val;
                  }
                }}
              />
              <YAxis
                stroke="#777777"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000000',
                  border: '1px solid #333333',
                  borderRadius: '0px',
                  color: '#ffffff',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                }}
                itemStyle={{ color: '#ffffff' }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
              />
              <Legend
                wrapperStyle={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  paddingTop: '12px',
                  textTransform: 'uppercase',
                }}
              />
              {/* Pure Monochromatic Contrast: #111111 (Black) vs #838282 (Neutral Grey) */}
              <Bar dataKey="stockIn" name="Stock In (+)" fill="#111111" radius={[0, 0, 0, 0]} />
              <Bar dataKey="stockOut" name="Stock Out (-)" fill="#838282" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
