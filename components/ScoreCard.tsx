'use client';

interface ScoreCardProps {
  score: number;
  label: string;
  date?: string;
  large?: boolean;
}

function scoreColors(score: number) {
  if (score >= 90) return { text: 'text-emerald-400', glow: 'shadow-emerald-500/20', border: 'border-emerald-500/30', bg: 'from-emerald-500/10 to-transparent' };
  if (score >= 75) return { text: 'text-blue-400', glow: 'shadow-blue-500/20', border: 'border-blue-500/30', bg: 'from-blue-500/10 to-transparent' };
  if (score >= 60) return { text: 'text-yellow-400', glow: 'shadow-yellow-500/20', border: 'border-yellow-500/30', bg: 'from-yellow-500/10 to-transparent' };
  if (score >= 40) return { text: 'text-orange-400', glow: 'shadow-orange-500/20', border: 'border-orange-500/30', bg: 'from-orange-500/10 to-transparent' };
  return { text: 'text-red-400', glow: 'shadow-red-500/20', border: 'border-red-500/30', bg: 'from-red-500/10 to-transparent' };
}

export function ScoreCard({ score, label, date, large = false }: ScoreCardProps) {
  const c = scoreColors(score);
  return (
    <div className={`rounded-2xl border ${c.border} bg-gradient-to-b ${c.bg} bg-gray-900 p-6 text-center shadow-xl ${c.glow}`}>
      {date && (
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest">{date}</p>
      )}
      <p className={`font-black tabular-nums ${c.text} ${large ? 'text-9xl' : 'text-6xl'}`}>
        {score}
      </p>
      <p className={`mt-2 font-semibold ${large ? 'text-xl' : 'text-sm'} ${c.text}`}>{label}</p>
    </div>
  );
}
