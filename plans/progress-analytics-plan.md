# Habit Progress & Analytics Implementation Plan

## Overview
This document outlines the step-by-step plan to correctly calculate habit progress (daily, weekly, monthly, yearly) and implement clear data visualization graphs using React, Node.js, and Recharts.

---

## 1. Daily Progress Calculation
To calculate daily progress, we must dynamically evaluate each habit against the target date to determine if it is "expected".

**Logic:**
1. Fetch all habits for the user that were `active` on the given date, created before or on the given date, and not archived/deleted before that date.
2. Exclude habits where the target date falls on a `restDay` or `Vacation` period.
3. Exclude habits where `scheduleType` or `selectedDays` doesn't match the target day of the week.
4. Exclude optional habits from the "expected" count (they add to completed but don't penalize).
5. Fetch `HabitLog` for the target date.
6. `total expected habits` = Count of habits meeting the above criteria.
7. `completed habits today` = Count of `HabitLog` with `status === "completed"` for those expected habits.
8. If `total expected habits === 0`, return "No habits scheduled" (or `null` % in API).

**Formula:**
`daily progress = (completed habits today / total expected habits) * 100`

---

## 2. Weekly Progress Calculation
The weekly progress is calculated by aggregating the daily statistics for the 7 days of the target week (e.g., Monday to Sunday).

**Logic:**
1. Iterate through each day of the week.
2. Perform the Daily Progress Calculation for each day to determine `expectedCount` and `completedCount` per day.
3. Sum the daily expected counts: `Weekly Expected = Sum(Daily Expected)`
4. Sum the daily completed counts: `Weekly Completed = Sum(Daily Completed)`

**Formula:**
`weekly progress = (Weekly Completed / Weekly Expected) * 100`

---

## 3. Monthly Progress Calculation
Similar to the weekly calculation, but aggregated over all days in the target month.

**Logic:**
1. Determine the number of days in the month.
2. Iterate through each day of the month, fetching the daily expected and completed counts.
3. Sum the counts across the month.

**Formula:**
`monthly progress = (Monthly Completed / Monthly Expected) * 100`

---

## 4. Yearly Progress Calculation
Aggregates the total expected and completed habits for an entire year (365/366 days).

**Logic:**
1. To optimize performance, aggregate the monthly calculations for all 12 months.
2. Sum the expected and completed counts across all months.

**Formula:**
`yearly progress = (Yearly Completed / Yearly Expected) * 100`

---

## 5. Graph Requirements & Design (Recharts)

### Daily Graphs
*   **Today’s progress percentage:** Donut chart or circular progress indicator showing the exact percentage.
*   **Completed vs expected habits:** Simple Bar chart (1 bar for Completed, 1 for Expected) or a stacked layout.
*   **Daily progress bar:** Linear horizontal progress bar `[████████░░]` (e.g., Tailwind `w-[75%]`).
*   **Daily habit completion list:** UI list clearly showing completed vs missed habits for that day.

### Weekly Graphs
*   **Progress by day of the week:** Bar chart mapping days (Mon, Tue, Wed...) on X-axis to % progress on Y-axis.
*   **Completed vs expected per day:** Grouped Bar chart (2 bars per day: expected vs completed).
*   **Weekly percentage line chart:** Line chart tracking completion percentage trends over the 7 days.

### Monthly Graphs
*   **Daily progress across the month:** Line chart plotting percentage for each day of the month.
*   **Monthly completion percentage:** Large KPI metric card.
*   **Completed vs missed habits:** Pie chart showing total completed vs total missed for the month.
*   **Calendar heatmap:** A grid representing the month, with cell colors varying by daily percentage (like GitHub contributions).

### Yearly Graphs
*   **Monthly progress across the year:** Bar or Line chart showing the 12 months on X-axis and aggregate monthly % on Y-axis.
*   **Yearly completion percentage:** KPI metric card.
*   **Total completed habits by month:** Area chart showing volume of completions over time.
*   **Yearly discipline trend:** Line chart plotting moving averages or month-over-month percentage changes.

---

## 6. Data Structure (API Responses)

```typescript
type DailyStats = {
  date: string; // YYYY-MM-DD
  expectedCount: number;
  completedCount: number;
  missedCount: number; // expectedCount - completedCount
  progressPercentage: number | null; // null if expectedCount is 0 ("No habits scheduled")
};

type WeeklyStats = {
  weekStartDate: string;
  weekEndDate: string;
  expectedCount: number;
  completedCount: number;
  missedCount: number;
  progressPercentage: number | null;
  dailyBreakdown: DailyStats[]; // Array of 7 days
};

type MonthlyStats = {
  month: number; // 1-12
  year: number;
  expectedCount: number;
  completedCount: number;
  missedCount: number;
  progressPercentage: number | null;
  dailyBreakdown: DailyStats[]; // Array of 28-31 days
};

type YearlyStats = {
  year: number;
  expectedCount: number;
  completedCount: number;
  missedCount: number;
  progressPercentage: number | null;
  monthlyBreakdown: MonthlyStats[]; // Array of 12 months
};
```

---

## 7. Backend Implementation

**Service Logic (`backend/src/services/analyticsService.ts`):**
*   `calculateDailyStats(userId, date)`: Core engine for evaluating active habits, rest days, vacations, and logs.
*   `calculateDateRangeStats(userId, startDate, endDate)`: Wrapper that iterates over a range and sums counts.

**API Endpoints (`backend/src/routes/analyticsRoutes.ts`):**
*   `GET /analytics/daily?date=YYYY-MM-DD`
*   `GET /analytics/weekly?date=YYYY-MM-DD` (Returns the week containing the date)
*   `GET /analytics/monthly?year=YYYY&month=MM`
*   `GET /analytics/yearly?year=YYYY`
*   `GET /analytics/summary` (Returns quick KPIs for today, this week, this month).

---

## 8. Frontend Implementation

**Components (`frontend/src/components/analytics/`):**
*   `DailyProgressCard.tsx`: Uses CircularProgressbar or Recharts PieChart.
*   `WeeklyProgressChart.tsx`: Uses Recharts `<BarChart>` or `<LineChart>`.
*   `MonthlyProgressChart.tsx`: Uses Recharts `<LineChart>`.
*   `YearlyProgressChart.tsx`: Uses Recharts `<AreaChart>` and `<BarChart>`.
*   `CompletedVsExpectedChart.tsx`: Uses Recharts `<BarChart>` (grouped).
*   `ProgressSummaryCard.tsx`: Reusable KPI UI.
*   `CalendarHeatmap.tsx`: Custom grid or library (e.g., `react-calendar-heatmap`).

**State & Fetching:**
Use React Query or `useEffect` to fetch data from the new endpoints and pass the `Stats` typed data into these visualization components.

---

## 9. Edge Cases Addressed

*   **No habits scheduled:** Handled by returning `progressPercentage: null`. Frontend displays "No habits scheduled" when `expectedCount === 0`.
*   **Rest days & Vacation days:** Excluded from `expectedCount` in the backend calculation engine.
*   **Deleted / Archived habits:** Excluded based on `createdAt`, `deletedAt`, and `isArchived` fields relative to the date being queried.
*   **Optional habits:** If marked optional, they do not increment `expectedCount` but *do* increment `completedCount` (can result in > 100%, which should be capped at 100% or explicitly handled in UI).
*   **Duplicate completions:** Backend service must ensure `completedCount` distinct queries based on `habitId` per day.
*   **Timezone issues:** API must enforce `YYYY-MM-DD` string inputs. Frontend must format local dates strictly to `YYYY-MM-DD` strings before querying.
*   **Partial completions:** Not strictly supported by current `schema.prisma` `HabitLog` status, but if implemented, logic would weigh status (e.g., 0.5 completion). Default to binary.

---

## 10. Testing Examples (Checklist)

*   [ ] **100% Completion:** 4 expected, 4 completed → 100%.
*   [ ] **75% Completion:** 4 expected, 3 completed → 75%.
*   [ ] **50% Completion:** 4 expected, 2 completed → 50%.
*   [ ] **25% Completion:** 4 expected, 1 completed → 25%.
*   [ ] **0% Completion:** 4 expected, 0 completed → 0%.
*   [ ] **No Habits Scheduled:** 0 expected → "No habits scheduled" (returns `null` percentage).
*   [ ] **Rest Day:** Target date is a rest day → Habit not in `expectedCount`.
*   [ ] **Vacation Day:** Target date is during active Vacation → Habit not in `expectedCount`.
*   [ ] **Optional Habit:** 1 mandatory, 1 optional habit. Completing mandatory = 100%. Completing both = 100% (or capped).
