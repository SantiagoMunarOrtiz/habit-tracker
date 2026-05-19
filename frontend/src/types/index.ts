export interface Habit {
  id: string;
  title: string;
  category: { name: string; color: string };
  timeOfDay?: string;
  planType: string;
  difficulty?: string;
  scheduleType: string;
  selectedDays?: string;
  restDays?: string;
  targetDaysPerWeek?: number;
  triggerCue?: string;
  ifThenPlan?: string;
  motivationPhrase?: string;
  miniReward?: string;
  bankedDays: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  logs: { date: string; status: string; note?: string }[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  level: number;
  points: number;
  categories: { id: string; name: string; color?: string }[];
}

export interface Vacation {
  id: string;
  startDate: string;
  endDate: string;
  appliesTo: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockCondition: string;
  points: number;
  message?: string;
  unlocked: boolean;
  dateEarned?: string;
  status?: string;
  currentProgress?: number;
  requiredProgress?: number;
  badgeColor?: string;
  icon?: string;
  achievementId?: string;
  completedAt?: string;
}
