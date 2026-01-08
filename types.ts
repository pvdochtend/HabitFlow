
export type Frequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: Frequency;
  createdAt: number;
  completedDates: string[]; // ISO Strings (YYYY-MM-DD)
  streak: number;
  color: string;
}

export interface UserStats {
  totalCompletions: number;
  currentStreak: number;
  bestStreak: number;
}

export interface AIInsight {
  type: 'encouragement' | 'analysis' | 'suggestion';
  content: string;
  timestamp: number;
}
