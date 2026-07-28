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
  goalId?: string | null;
  goalTargetCount?: number | null;
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

export interface SystemRule {
  id: string;
  goalId: string;
  text: string;
  completed: boolean;
  status?: string;
}

export interface DailyReflection {
  id: string;
  date: string;
  note?: string;
  focusRating?: number;
  energyRating?: number;
  satisfactionRating?: number;
  q1Progress?: string;
  q2Learned?: string;
  q3Blocked?: string;
  q4NextAction?: string;
  q5ObstaclePlan?: string;
  goalId?: string;
  habitId?: string;
  goal?: Goal;
  habit?: Habit;
  createdAt: string;
}

export interface WorkTask {
  id: string;
  title: string;
  area: string;
  status: string;
  priority: string;
  deadline?: string;
  scheduledDate?: string;
  actualTime: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  term: 'short' | 'medium' | 'long';
  status: string;
  targetDate?: string;
  createdAt: string;
  rules: SystemRule[];
  habits?: Habit[];
}

export interface LifeReviewArea {
  id: string;
  lifeReviewId: string;
  areaName: string;
  rating?: number;
  responses?: Record<string, string>;
}

export interface LifeReview {
  id: string;
  userId: string;
  type: 'quarterly' | 'annual';
  year: number;
  cycle: number;
  status: 'draft' | 'completed';
  overallSatisfaction?: number;
  responses?: Record<string, string>;
  mainPriority?: string;
  threeChanges?: Record<string, string>;
  nextAction?: string;
  actionTargetDate?: string;
  actionStatus: string;
  notes?: string;
  questionVersion: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  areas: LifeReviewArea[];
}

