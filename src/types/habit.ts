export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday ... 6 = Saturday

export type Frequency =
  | { type: 'daily' }
  | { type: 'weekdays'; days: Weekday[] };

export interface Habit {
  id: string;
  name: string;
  icon: string; // emoji
  color: string; // hex color used for accents
  frequency: Frequency;
  createdAt: string; // ISO date string
  completions: string[]; // ISO date strings (yyyy-MM-dd) the habit was completed on
}

export type NewHabitInput = Omit<Habit, 'id' | 'createdAt' | 'completions'>;

export type EditHabitInput = Partial<NewHabitInput>;
