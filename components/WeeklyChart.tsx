'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { DayEntry } from '@/lib/types';

function shortDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm shadow-xl">
      <p className="text-gray-400 text-xs mb-0.5">{payload[0]?.payload?.date}</p>
      <p className="text-white font-bold text-lg">{payload[0]?.value}</p>
    </div>
  );
}

export function WeeklyChart({ entries }: { entries: DayEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
        No entries yet — log your first day to see the chart.
      </div>
    );
  }

  const data = entries.map(e => ({
    date: shortDate(e.date),
    score: e.score.score,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          ticks={[0, 25, 50, 75, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={75} stroke="#374151" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={{ fill: '#3b82f6', r: 5, strokeWidth: 0 }}
          activeDot={{ r: 7, fill: '#60a5fa', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
