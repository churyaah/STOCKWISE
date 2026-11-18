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
  const chartData = useMemo(() => {
    const map: Record<string, { date: string; stockIn: number; stockOut: number }> = {};

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
    return result.slice(-10);
  }, [transactions]);

  return (
    <Card
      title="Stock Movement Velocity (30D Rolling)"
      subtitle="Inbound Ingress (Procurement) vs Outbound Egress (Fulfillment)"
      className="w-full bg-white"
    >
      <div className="h-72 w-full pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center font-mono text-xs text-ink-muted">
            No stock movement recorded in current ledger window.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(13, 13, 15, 0.08)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#6E6F76"
                fontSize={11}
                fontFamily="IBM Plex Mono, monospace"
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
                itemStyle={{ color: '#ffffff' }}
                cursor={{ fill: 'rgba(47, 91, 255, 0.06)' }}
              />
              <Legend
                wrapperStyle={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '11px',
                  paddingTop: '12px',
                  textTransform: 'uppercase',
                }}
              />
              {/* Technical Precision: Ink #0D0D0F (Stock In) vs Signal Accent #2F5BFF (Stock Out) */}
              <Bar dataKey="stockIn" name="Ingress / Stock In (+)" fill="#0D0D0F" radius={[0, 0, 0, 0]} />
              <Bar dataKey="stockOut" name="Egress / Stock Out (-)" fill="#2F5BFF" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
