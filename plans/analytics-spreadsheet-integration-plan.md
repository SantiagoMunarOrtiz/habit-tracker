# Analytics and Spreadsheet Integration Plan

## Goal
Connect the existing `SpreadsheetView.tsx` with the `analyticsService.ts` so that habit creation and check-ins seamlessly reflect in daily, weekly, monthly, and yearly analytics. The integration should correctly calculate total expected habits, total completed, and the number of times a habit was missed.

## Current State Analysis
- **SpreadsheetView**: Currently calculates daily totals, weekly scores, and percentages purely on the frontend by iterating over habits and logs.
- **AnalyticsService**: Has robust backend logic for `getDailyStats`, `getWeeklyStats`, `getMonthlyStats`, and `getYearlyStats`, considering rest days, schedules, and vacations. It returns `expectedCount`, `completedCount`, `missedCount`, and `progressPercentage`.
- **Analytics Page**: Fetches and visualizes data directly from the backend. 

## Actionable Steps

- [ ] **1. Standardize Calculation Logic**: Refactor `SpreadsheetView.tsx` to either fetch totals directly from the `analyticsService` (via the existing `/api/analytics/monthly` endpoint) or ensure the frontend calculation perfectly mirrors the backend logic for `expectedCount`, `completedCount`, and `missedCount` (including rest days and flexible schedules).
- [ ] **2. Unify State Updates**: When a habit is created, checked in, or archived in `SpreadsheetView.tsx`, trigger a global refetch or event that allows the Analytics cache/state to update immediately, preventing stale data.
- [ ] **3. Detailed Spreadsheet Tooltips**: Add tooltips or explicit displays in the Spreadsheet View to show `missedCount` alongside `completedCount` and `expectedCount` for each day and week, pulling directly from the unified logic.
- [ ] **4. Habit-Specific Analytics**: Enhance the backend to provide analytics per-habit (implementing the empty `getHabitAnalytics` in `analyticsService.ts`) to show detailed stats (missed days, completed days, streak) for individual habits directly when clicking them on the spreadsheet.
- [ ] **5. Verification & Testing**: Create a habit with specific days, check it in, miss a day, and verify that the daily, monthly, and yearly analytics reflect exactly 1 expected, 1 completed, and 1 missed appropriately across all components.