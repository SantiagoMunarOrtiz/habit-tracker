# UI & Features Overhaul Plan (Dark Mode & Advanced Charts)

Based on the provided reference images and requirements, we need to transform the current V2 application into a sophisticated dark-mode dashboard with advanced Recharts visualizations.

## 1. Visual Overhaul (Dark Mode)
*   **Theme:** Switch Tailwind classes from `bg-white/slate-50` to a sleek dark theme (`bg-[#1a1a1a]`, `text-gray-200`, `border-gray-800`).
*   **Cards:** Use subtle dark gray cards with slight borders.
*   **Metrics:** Style the "Active Habits" and "Completion Rate" widgets exactly like the reference (clean typography, subtle icons, distinct colors for numbers).

## 2. Advanced Charts Implementation
*   **Completion by Habit (Donut Chart):**
    *   Use Recharts `PieChart` with `innerRadius`.
    *   Aggregate total completions per habit to feed this chart.
    *   Implement a custom legend matching the reference (colored squares next to labels).
*   **Habit Streak (Calendar Heatmap):**
    *   Create a GitHub-style contribution graph.
    *   This will require a custom grid layout or a specialized charting component mapping the last 365 days of `HabitLog` data.
    *   Color logic: Empty/Dark Green (`bg-green-900/20`) for 0 completions, Bright Green (`bg-green-500`) for active completions.

## 3. Frontend Functional Updates
*   **Mandatory Days Selection:** Update the `HabitFormModal` so that when `scheduleType` is "fixedDays", the user sees a row of 7 circular buttons (M, T, W, T, F, S, S) to toggle which days are mandatory.
*   **Plan Type Filtering:** Ensure the progress calculations and graphs explicitly separate or allow filtering between "Work" and "Personal/Study" tasks.

## 4. Execution Steps
1.  **Refactor CSS/Tailwind:** Apply the dark theme globally in `App.tsx` and `index.css`.
2.  **Update Habit Form:** Add the day-selector UI.
3.  **Build Metric Cards:** Create reusable components for the top-level stats.
4.  **Implement Donut Chart:** Build the Recharts Pie component.
5.  **Implement Heatmap:** Build the 52-week grid calendar view.