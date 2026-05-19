# Habit Analytics & Calculation Fix Plan

## Problem Statement
When multiple habits are created on a given day, the system does not accurately reflect the total expected count for that day if the calculation evaluates date boundaries or schedule logic incorrectly. As a result, completing just 1 out of 4 habits incorrectly yields a "100%" completion rate because only 1 habit is considered "expected". Furthermore, the user requested additional granular metrics, including tracking "days in streaks" and "how many times a habit has been done".

## Root Causes
1. **Frontend `totalMandatory` Logic:** In `HabitGrid.tsx`, `totalMandatory` only increments for newly created habits if `isMandatory` evaluates to true and date boundary/start date conditions align. Sometimes, due to UTC vs Local Time mismatches, or missing `startDate` filtering logic, habits created today are excluded from expected totals on the day of creation.
2. **Backend `expectedCount` Logic:** `analyticsService.ts` correctly fetches habits, but the date comparison `targetDateEnd` against `habit.startDate` or `habit.createdAt` is either missing or mishandled. Additionally, flexible schedules increment `expectedCount` on every day, which may skew analytics.
3. **Missing Metrics:** Current models and services only surface raw completed/expected logs and do not expose streak calculations or total lifetime completion counts.

## Action Plan

### 1. Fix Expected Count Calculation (Backend)
- Update `backend/src/services/analyticsService.ts` to properly handle `startDate` and `createdAt` when determining if a habit should be counted in `expectedCount` for a specific date.
- Ensure timezones are correctly handled so habits created "today" in local time are counted as active "today".
- Refine the loop that checks `isScheduled` to strictly determine expected days based on `scheduleType` and `startDate`.

### 2. Fix Grid Expected Totals (Frontend)
- Update `frontend/src/components/HabitGrid.tsx` daily total calculations to match the backend's expected behavior.
- Ensure that `totalMandatory` correctly sums up all non-rest, non-vacation, scheduled habits for the current grid date.
- Factor in the habit's `startDate` so habits don't artificially lower completion percentages for dates before they were created.

### 3. Implement Streak and Total Computations
- Add logic to the backend to calculate the **Current Streak** (consecutive days a habit has been completed) and **Total Completed Count**.
- Expose these properties in the `habitRoutes.ts` or `analyticsRoutes.ts` responses.

### 4. Update UI to Show Streaks and Totals
- Integrate the newly calculated "Current Streak" and "Total Completed" metrics into the Habit Grid or Analytics views.
- Make these metrics clearly visible to the user so they can track long-term progress.

## Conclusion
Executing these steps will ensure that if 4 habits are scheduled for today, completing 1 will result in a 25% daily completion rate, not 100%. Additionally, users will have access to deeper engagement metrics like streaks and total times completed.