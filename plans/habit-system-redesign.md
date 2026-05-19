# Habit System Redesign Plan

## 1. Current system review
Areas requiring review:
*   **Habit service (`backend/src/services/habitService.ts`):** Contains logic for calculating streaks, handling "bankedDays", and "R" days which must be removed.
*   **Analytics service (`backend/src/services/analyticsService.ts`):** Calculates subtraction-based metrics and cross-week statistics that need to be replaced with weekly replacement logic.
*   **Achievement logic (`backend/prisma/schema.prisma`, `backend/src/services/achievementService.ts`?):** Currently has global achievements, needs per-habit achievement models and logic.
*   **Calendar components (`frontend/src/components/Calendar*`):** Lacks proper month navigation and distinct visual states for the new day types.
*   **Chart components (`frontend/src/components/Analytics*`):** Needs redesign to show clean, professional completions by day/month/year instead of old "R day" stats.
*   **Vacation Mode logic (`backend/src/services/vacationService.ts`, `frontend/src/components/VacationModal.tsx`):** Needs review to ensure it exempts mandatory days without breaking weekly replacement logic.
*   **Data models (`schema.prisma`):** `bankedDays` in `Habit` must go. New models for `HabitAchievement` tracking per-habit progress are needed. `HabitLog` statuses need alignment.
*   **API endpoints (`backend/src/routes/habitRoutes.ts`, `analyticsRoutes.ts`):** Must reflect new calculation results.

## 2. New day model
The system will conceptualize days into these distinct types:
*   **Mandatory day:** A day required by the habit's schedule (e.g., Mon, Wed, Fri).
*   **Optional day:** A day not required by the habit's schedule (e.g., Tue, Thu).
*   **Completed day:** Any day (mandatory or optional) where the user actually did the habit.
*   **Missed day:** A mandatory day in the past where the user did not complete the habit.
*   **Replaced day:** A missed mandatory day that has been substituted by an optional completed day within the same week.
*   **Vacation Mode day:** A day that falls under an active vacation period. It exempts the day from being "missed" if mandatory, keeping statistics unaffected.

## 3. Weekly replacement algorithm
For any given week (e.g., Monday to Sunday boundaries):
1.  **Identify mandatory days:** Based on the habit's configuration for the current week.
2.  **Identify completed mandatory days:** Mandatory days where `HabitLog` status is "completed".
3.  **Identify missed mandatory days:** Past mandatory days in the week without a "completed" or "vacation" status.
4.  **Identify optional completed days:** Days in the week that are not mandatory but have a "completed" status.
5.  **Match and replace:** Loop through missed mandatory days. For each, if an optional completed day exists and hasn't been used, pair them.
6.  **Mark replacement:** The missed mandatory day is treated as "completed by replacement" for analytics/streaks. The optional completed day is marked "used for replacement".
7.  **Calculate final result:** The weekly completion rate is based on (completed mandatory + replaced mandatory) / total mandatory. Leftover optional completed days simply count as extra completions but carry no replacement value. Leftover missed days break the streak.

## 4. Old logic removal
*   **"R" days, Golden days, Banked days, Bonus days:** Remove `bankedDays` from the database schema. Remove all frontend UI references to "R", "Golden", or "Banked" days.
*   **Subtraction-based logic:** Remove any code deducting points/days for misses. Misses simply lower the completion rate.
*   **Cross-week carryover:** Remove any logic that rolls over "extra" days from one week to the next. The weekly replacement algorithm strictly resets every week boundary.

## 5. Achievements implementation
*   **Data Model:** Add a `HabitAchievement` model (or update `UserAchievement` to relate directly to `Habit`) to track per-habit unlocks.
*   **Milestones:** 1, 3, 7, 10, 30, 66 (Habit Formation), 90, 180 (Long-Term Identity), 365 (One-Year Discipline).
*   **Calculation:** On each habit completion, calculate the total valid completions (mandatory + optional). If the count reaches a milestone, create a record in `HabitAchievement`.
*   **UI:** A dedicated achievements tab/section per habit showing locked/unlocked states, unlock dates, and a progress bar to the next milestone.

## 6. Analytics implementation
*   **Calculations:** Analytics will dynamically run the weekly replacement algorithm.
*   **Views:** Support querying by specific Day, Month, and Year boundaries.
*   **Metrics:** Show completions (mandatory vs. optional), replaced days, missed days, current streak, best streak.
*   **Charts:** Implement clean bar/line charts using Recharts or Chart.js showing daily/monthly trends. Replace any existing complex score graphs with straightforward completion frequency charts.

## 7. Calendar implementation
*   **Navigation:** Update the calendar component state to track `currentMonth` and `currentYear`. Add `<` and `>` buttons to mutate this state.
*   **Data Fetching:** When the month changes, fetch `HabitLog` data for that specific month.
*   **Visual Status:** Render days with distinct CSS classes/colors:
    *   Green check: Completed mandatory.
    *   Blue check: Completed optional (or used as replacement).
    *   Red cross: Missed mandatory.
    *   Gray/Hollow: Future or unused optional.
    *   Yellow/Beach icon: Vacation mode.

## 8. Vacation Mode integration
*   Vacation Mode overrides mandatory day logic. If a mandatory day falls on a Vacation day, it is not considered "missed".
*   It does not require replacement.
*   It preserves streaks seamlessly.
*   The weekly algorithm will filter out Vacation days from the "Identify missed mandatory days" step.

## 9. Backend changes
*   **Schema:** Remove `bankedDays`. Add `HabitAchievement`.
*   **Services:** Rewrite streak and weekly completion logic in `habitService.ts` to use the new weekly replacement algorithm.
*   **Endpoints:** Update analytics endpoints to return data structured for the new Day/Month/Year charts and calendar views.

## 10. Frontend changes
*   **UI/UX:** Redesign the habit detail view to house the new Calendar, Analytics, and Achievements tabs.
*   **Calendar:** Implement month pagination.
*   **Charts:** Integrate a charting library (if not present) to build the new visual analytics.
*   **Types:** Update frontend types to match backend schema changes (remove bankedDays, add per-habit achievements).

## 11. Testing plan
*   Habit with no mandatory days (all optional).
*   Habit with 1 mandatory day completed.
*   Habit with 1 mandatory day missed and 1 optional completed (tests successful replacement).
*   Habit with 2 missed mandatory days and 1 optional completed (1 replaced, 1 remains missed).
*   Optional completed day used as replacement cannot be reused.
*   Replacement across different weeks (should fail).
*   Vacation Mode preventing a missed mandatory day.
*   Completing 66th day triggers Habit Formation achievement.
*   Calendar fetches correct data when navigating Dec -> Jan.
*   Analytics returns correct monthly aggregation.
