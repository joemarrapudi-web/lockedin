'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DayEntry } from '@/lib/types';
import { getEntries } from '@/lib/storage';
import { BreakdownBar } from '@/components/BreakdownBar';

function scoreColor(score: number) {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 75) return 'text-blue-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function EntryCard({ entry }: { entry: DayEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-800/50 transition-colors text-left"
      >
        <div>
          <p className="text-xs text-gray-500 mb-0.5">{formatDate(entry.date)}</p>
          <p className="text-sm font-medium text-gray-300">{entry.score.label}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-4xl font-black tabular-nums ${scoreColor(entry.score.score)}`}>
            {entry.score.score}
          </span>
          <span className={`text-gray-500 text-sm transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
        </div>
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-5 border-t border-gray-800 pt-5">
          {entry.subjects.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Studied</p>
              <div className="flex flex-wrap gap-2">
                {entry.subjects
                  .filter(s => s.name)
                  .map((s, i) => (
                    <span key={i} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                      {s.name} · {s.hours}h
                    </span>
                  ))}
              </div>
            </div>
          )}

          <BreakdownBar breakdown={entry.score.breakdown} />

          {entry.score.strengths.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Strengths</p>
              <ul className="space-y-1.5">
                {entry.score.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-300">
                    <span className="text-emerald-400">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {entry.score.improvements.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">To improve</p>
              <ul className="space-y-1.5">
                {entry.score.improvements.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-300">
                    <span className="text-blue-400">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-300 italic">&ldquo;{entry.score.motivation}&rdquo;</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<DayEntry[]>([]);

  useEffect(() => {
    setEntries(getEntries().reverse());
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-black tracking-tight text-white">
          🔒 Locked In
        </Link>
        <div className="flex gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/log" className="hover:text-white transition-colors">Log Day</Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black">History</h1>
          <span className="text-sm text-gray-500">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="text-4xl mb-4">📋</p>
            <p className="mb-4">No entries yet.</p>
            <Link href="/log" className="text-blue-500 hover:text-blue-400 transition-colors">
              Log your first day →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
