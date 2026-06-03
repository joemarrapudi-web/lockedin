'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { DayEntry } from '@/lib/types';
import {
  getTodayEntry,
  getStreak,
  getPersonalBest,
  getRecentEntries,
  getWeeklyAvg,
} from '@/lib/storage';
import { ScoreCard } from '@/components/ScoreCard';
import { BreakdownBar } from '@/components/BreakdownBar';

const WeeklyChart = dynamic(
  () => import('@/components/WeeklyChart').then(m => m.WeeklyChart),
  { ssr: false }
);

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-white">{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [todayEntry, setTodayEntry] = useState<DayEntry | null>(null);
  const [recentEntries, setRecentEntries] = useState<DayEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [personalBest, setPersonalBest] = useState(0);
  const [thisWeekAvg, setThisWeekAvg] = useState<number | null>(null);
  const [lastWeekAvg, setLastWeekAvg] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTodayEntry(getTodayEntry());
    setRecentEntries(getRecentEntries(14));
    setStreak(getStreak());
    setPersonalBest(getPersonalBest());
    setThisWeekAvg(getWeeklyAvg(0));
    setLastWeekAvg(getWeeklyAvg(1));
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const weekDelta =
    thisWeekAvg !== null && lastWeekAvg !== null ? thisWeekAvg - lastWeekAvg : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-black tracking-tight text-white">🔒 Locked In</span>
        <div className="flex gap-6 text-sm text-gray-400">
          <Link href="/log" className="hover:text-white transition-colors">Log Day</Link>
          <Link href="/history" className="hover:text-white transition-colors">History</Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">

        {todayEntry ? (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest">Today</p>
            <ScoreCard score={todayEntry.score.score} label={todayEntry.score.label} large />
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <BreakdownBar breakdown={todayEntry.score.breakdown} />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-sm text-gray-300 italic">&ldquo;{todayEntry.score.motivation}&rdquo;</p>
            </div>
            <Link href="/log" className="block text-center text-sm text-gray-500 hover:text-gray-300 transition-colors">
              View full breakdown →
            </Link>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center space-y-4">
            <p className="text-5xl">📋</p>
            <h2 className="text-xl font-bold">You haven&apos;t logged today yet</h2>
            <p className="text-gray-500 text-sm">End your day with a score. Takes 2 minutes.</p>
            <Link
              href="/log"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Log Today →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Streak"
            value={streak > 0 ? `${streak}d` : '0'}
            sub={streak > 0 ? 'keep it going' : 'start today'}
          />
          <StatCard label="Personal Best" value={personalBest || '—'} sub="all time" />
          <StatCard
            label="This Week"
            value={thisWeekAvg ?? '—'}
            sub={
              weekDelta !== null
                ? weekDelta > 0
                  ? `+${weekDelta} vs last wk`
                  : weekDelta < 0
                  ? `${weekDelta} vs last wk`
                  : 'same as last wk'
                : lastWeekAvg !== null
                ? `last week: ${lastWeekAvg}`
                : 'no prev data'
            }
          />
        </div>

        {weekDelta !== null && (
          <div
            className={`rounded-2xl border p-4 flex items-center justify-between ${
              weekDelta > 0
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : weekDelta < 0
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-gray-800 border-gray-700'
            }`}
          >
            <div>
              <p className="text-sm font-semibold">
                {weekDelta > 0
                  ? `Up ${weekDelta} pts vs last week`
                  : weekDelta < 0
                  ? `Down ${Math.abs(weekDelta)} pts vs last week`
                  : 'Same as last week'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                This week avg: {thisWeekAvg} · Last week avg: {lastWeekAvg}
              </p>
            </div>
            <span className="text-2xl">{weekDelta > 0 ? '🔥' : weekDelta < 0 ? '💪' : '➡️'}</span>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Last 14 days</p>
          <WeeklyChart entries={recentEntries} />
        </div>

      </main>
    </div>
  );
}
