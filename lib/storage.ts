import { DayEntry } from './types';

const STORAGE_KEY = 'lockedin_entries';

export function getEntries(): DayEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry: DayEntry): void {
  const entries = getEntries();
  const existingIndex = entries.findIndex(e => e.date === entry.date);
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  entries.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getEntryByDate(date: string): DayEntry | null {
  return getEntries().find(e => e.date === date) ?? null;
}

export function getTodayEntry(): DayEntry | null {
  return getEntryByDate(getTodayDate());
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getRecentEntries(n: number): DayEntry[] {
  return getEntries().slice(-n);
}

export function getStreak(): number {
  const entries = getEntries();
  if (entries.length === 0) return 0;

  const dateSet = new Set(entries.map(e => e.date));
  const today = getTodayDate();
  let streak = 0;
  const cursor = new Date();

  if (!dateSet.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const dateStr = cursor.toISOString().split('T')[0];
    if (dateSet.has(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getPersonalBest(): number {
  const entries = getEntries();
  if (entries.length === 0) return 0;
  return Math.max(...entries.map(e => e.score.score));
}

function getWeekBounds(weeksAgo: number): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7) - weeksAgo * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

export function getWeeklyAvg(weeksAgo = 0): number | null {
  const entries = getEntries();
  const { start, end } = getWeekBounds(weeksAgo);
  const week = entries.filter(e => {
    const d = new Date(e.date + 'T12:00:00');
    return d >= start && d <= end;
  });
  if (week.length === 0) return null;
  return Math.round(week.reduce((sum, e) => sum + e.score.score, 0) / week.length);
}
