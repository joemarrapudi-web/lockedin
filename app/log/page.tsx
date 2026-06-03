'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DailyScore, Subject } from '@/lib/types';
import { saveEntry, getTodayEntry, getTodayDate } from '@/lib/storage';
import { ScoreCard } from '@/components/ScoreCard';
import { BreakdownBar } from '@/components/BreakdownBar';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function LogPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([{ name: '', hours: 0 }]);
  const [description, setDescription] = useState('');
  const [homeworkDone, setHomeworkDone] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DailyScore | null>(null);
  const [error, setError] = useState('');
  const [alreadyLogged, setAlreadyLogged] = useState(false);

  useEffect(() => {
    const existing = getTodayEntry();
    if (existing) {
      setAlreadyLogged(true);
      setResult(existing.score);
    }
  }, []);

  function addSubject() {
    setSubjects(prev => [...prev, { name: '', hours: 0 }]);
  }

  function removeSubject(i: number) {
    setSubjects(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateSubject(i: number, field: keyof Subject, value: string | number) {
    setSubjects(prev =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (homeworkDone === null) {
      setError('Tell me if you finished your homework.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects, description, homeworkDone }),
      });

      if (!res.ok) throw new Error('API error');
      const data: DailyScore = await res.json();

      saveEntry({
        id: generateId(),
        date: getTodayDate(),
        subjects,
        description,
        homeworkDone,
        score: data,
        createdAt: new Date().toISOString(),
      });

      setResult(data);
    } catch {
      setError('Something went wrong. Check that your API key is set up.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-black tracking-tight text-white">
          🔒 Locked In
        </Link>
        <div className="flex gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/history" className="hover:text-white transition-colors">History</Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {alreadyLogged && result ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">Already logged today</p>
              <h1 className="text-2xl font-black">Today&apos;s Score</h1>
            </div>
            <ScoreCard score={result.score} label={result.label} large />
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
              <BreakdownBar breakdown={result.breakdown} />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">What you did well</p>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-300">
                      <span className="text-emerald-400 mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Level up tomorrow</p>
                <ul className="space-y-2">
                  {result.improvements.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-300">
                      <span className="text-blue-400 mt-0.5">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-200 italic">&ldquo;{result.motivation}&rdquo;</p>
              </div>
            </div>
            <Link href="/" className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors">
              View Dashboard
            </Link>
          </div>
        ) : result ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">Today&apos;s Score</p>
              <h1 className="text-2xl font-black">Here&apos;s how you did</h1>
            </div>
            <ScoreCard score={result.score} label={result.label} large />
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
              <BreakdownBar breakdown={result.breakdown} />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">What you did well</p>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-300">
                      <span className="text-emerald-400 mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Level up tomorrow</p>
                <ul className="space-y-2">
                  {result.improvements.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-300">
                      <span className="text-blue-400 mt-0.5">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-200 italic">&ldquo;{result.motivation}&rdquo;</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors"
            >
              View Dashboard →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h1 className="text-3xl font-black mb-1">Log Your Day</h1>
              <p className="text-gray-500 text-sm">Fill this out at the end of the day — be honest.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-3">
                  What did you study?
                </label>
                <div className="space-y-2">
                  {subjects.map((s, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Subject (e.g. Math)"
                        value={s.name}
                        onChange={e => updateSubject(i, 'name', e.target.value)}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <input
                        type="number"
                        placeholder="hrs"
                        min={0}
                        max={24}
                        step={0.5}
                        value={s.hours || ''}
                        onChange={e => updateSubject(i, 'hours', parseFloat(e.target.value) || 0)}
                        className="w-20 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-center"
                      />
                      {subjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubject(i)}
                          className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none px-1"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addSubject}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-400 transition-colors"
                >
                  + Add subject
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-3">
                  Describe your day
                </label>
                <textarea
                  rows={4}
                  placeholder="What did you focus on? What distracted you? How was your energy? Be real."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-3">
                  Did you finish your homework?
                </label>
                <div className="flex gap-3">
                  {[true, false].map(val => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setHomeworkDone(val)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        homeworkDone === val
                          ? val
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                            : 'bg-red-500/20 border-red-500/50 text-red-400'
                          : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {val ? 'Yes ✓' : 'No ✗'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg transition-colors"
            >
              {loading ? 'Scoring your day...' : 'Score My Day →'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
