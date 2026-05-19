# Habit Tracker Analytics & Graphs Implementation Plan

This plan is based on science-backed habit-tracking principles to enhance the analytics system of your React and Node.js app using Recharts.

---

## Phase 1: Data Architecture & Backend Updates

### 1. Graph List & Purpose
1. **Daily Progress Card**: Quick snapshot of today's discipline.
2. **Weekly Progress Bar Chart**: Visualize short-term momentum and week-over-week consistency.
3. **Monthly Calendar Heatmap**: Detailed view of daily behavioral states (golden day, rest day, etc.).
4. **Streak Chart**: Focus on identity building and resilience (recovering lost streaks).
5. **Completed vs Expected Chart**: Macro visualization for capacity vs execution.
6. **Personal vs Work vs Study Chart**: Balance tracking across life categories.
7. **Yearly Discipline Graph**: Long-term macro trend over 12 months.
8. **Milestone Progress Graph**: Gamification of habit formation limits (7, 30, 66 days).
9. **Reward Progress Graph**: Short-term extrinsic motivation driver.
10. **Habit Reliability Score**: Identify friction points at the individual habit level.

### 2. Formulas & Rules
**Core Rules:**
- Only **mandatory expected habits** count in percentages.
- **Rest & Vacation days** = Do not reduce progress (Excluded from denominator).
- **Optional days** = Do not count as failures (Excluded from denominator if missed).
- **Deleted/Archived habits** = Excluded.
- **Replacement days** = Count positively if replacing a missed mandatory day.
- **Empty State** = If expected = 0, output "No habits scheduled".

**Formulas:**
- *Completion %*: `(Completed Mandatory + Valid Replacements) / (Expected Mandatory) * 100`
- *Habit Category %*: `(Completed in Category) / (Expected in Category) * 100`

### 3. Required Data Structure (Backend DTOs)
```typescript
interface DailyAnalyticState {
  date: string;
  expectedCount: number;
  completedCount: number;
  missedCount: number;
  restDaysCount: number;
  vacationDaysCount: number;
  replacementCount: number;
  status: 'Golden' | 'Completed' | 'Partial' | 'Missed' | 'Rest' | 'Vacation' | 'Pink' | 'Replacement' | 'None';
  categories: {
    personal: { expected: number; completed: number };
    work: { expected: number; completed: number };
    study: { expected: number; completed: number };
  }
}

interface MilestoneState {
  habitId: string;
  habitTitle: string;
  totalCompletions: number;
  currentStreak: number;
  bestStreak: number;
  nextMilestone: number; // e.g., 66
  progressToNext: number; // percentage
}
```

### 4. Backend API Endpoints (Node.js/Express)
- `GET /api/analytics/daily?date=YYYY-MM-DD`
- `GET /api/analytics/weekly?startDate=YYYY-MM-DD`
- `GET /api/analytics/monthly?year=YYYY&month=MM`
- `GET /api/analytics/yearly?year=YYYY`
- `GET /api/analytics/milestones`
- `GET /api/analytics/habit-reliability`

---

## Phase 2: React Component & Recharts Implementation

### React Component Plan
1. **`<DailyProgressCard />`**: Simple statistical display using Tailwind CSS.
2. **`<WeeklyProgressBar />`**: Recharts `<BarChart>` showing Mon-Sun.
3. **`<MonthlyHeatmap />`**: Custom Grid component mapped to days of the month with color-coded Tailwind classes based on `DailyAnalyticState.status`.
4. **`<StreakChart />`**: Recharts `<LineChart>` tracking consecutive days.
5. **`<CompletedVsExpected />`**: Recharts `<ComposedChart>` (Bar for Expected, Line for Completed).
6. **`<CategoryRadarChart />`**: Recharts `<RadarChart>` or `<BarChart>` stacked by category.
7. **`<YearlyDisciplineGraph />`**: Recharts `<BarChart>` aggregated by month.
8. **`<MilestoneTimeline />`**: Custom progressive steps component or Recharts `<ScatterChart>`.
9. **`<RewardProgressBox />`**: Circular progress bar (Tailwind/SVG).
10. **`<ReliabilityList />`**: Sorted Table or `<BarChart>` showing individual habit success rates.

### Recharts Implementation Example (Weekly Bar Chart)
```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const WeeklyProgressBar = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <XAxis dataKey="dayOfWeek" />
      <YAxis domain={[0, 100]} />
      <Tooltip cursor={{fill: '#2a2a2a'}} />
      <Bar dataKey="completionPercentage" fill="#10B981" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
```

---

## Phase 3: Edge Cases & Step-by-Step Roadmap

### Edge Cases to Handle
1. **Timezone Shifts**: The user creates a habit late at night; ensure UTC boundaries accurately reflect their local timezone.
2. **Dynamic Rest Days**: A user changes a rest day mid-week; historical data should lock past definitions, or gracefully recalculate without penalizing past streaks.
3. **Divisions by Zero**: Days with 0 expected habits must return `null` or a specific flag instead of `NaN` to trigger the "No habits scheduled" UI state.
4. **Streak Freezes**: Ensure the streak algorithm does not reset to 0 when passing through a Vacation or Rest day.

### Step-by-Step Roadmap
- **Step 1:** Update `analyticsService.ts` in the backend to calculate the new granular fields (rest days, vacation days, categories).
- **Step 2:** Expose the new DTOs via the existing `/analytics` routes.
- **Step 3:** Implement the core Recharts components (Weekly, Monthly trend, Yearly trend).
- **Step 4:** Build the custom Monthly Calendar Heatmap component using Tailwind Grid.
- **Step 5:** Implement the gamification charts (Milestones, Streaks, Rewards).
- **Step 6:** Handle all empty states ("No habits scheduled") and edge cases.
- **Step 7:** E2E testing using different habit combinations (flexible, mandatory, vacations).