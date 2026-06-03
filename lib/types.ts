export interface Subject {
  name: string;
  hours: number;
}

export interface ScoreBreakdown {
  focus_quality: number;
  consistency: number;
  effort: number;
}

export interface DailyScore {
  score: number;
  label: string;
  breakdown: ScoreBreakdown;
  strengths: string[];
  improvements: string[];
  motivation: string;
}

export interface DayEntry {
  id: string;
  date: string;
  subjects: Subject[];
  description: string;
  homeworkDone: boolean;
  score: DailyScore;
  createdAt: string;
}
