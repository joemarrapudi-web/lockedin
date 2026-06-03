'use client';

import { ScoreBreakdown } from '@/lib/types';

function barColor(val: number) {
  if (val >= 90) return 'bg-emerald-400';
  if (val >= 75) return 'bg-blue-400';
  if (val >= 60) return 'bg-yellow-400';
  if (val >= 40) return 'bg-orange-400';
  return 'bg-red-400';
}

export function BreakdownBar({ breakdown }: { breakdown: ScoreBreakdown }) {
  const items = [
    { label: 'Focus Quality', value: breakdown.focus_quality },
    { label: 'Consistency', value: breakdown.consistency },
    { label: 'Effort', value: breakdown.effort },
  ];

  return (
    <div className="space-y-4">
      {items.map(({ label, value }) => (
        <div key={label}>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-400">{label}</span>
            <span className="font-mono font-bold text-white">{value}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor(value)} transition-all duration-700 ease-out`}
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
