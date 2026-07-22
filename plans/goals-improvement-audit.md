# Goals & Systems - Improvement Audit & Plan

## 1. What already exists
- **Database Models**: `Goal` (title, targetDate, status, term) and `SystemRule` (text, completed boolean) exist and are related.
- **Backend API**: `goalRoutes.ts` with basic CRUD operations for goals and a toggle for `SystemRule` completion.
- **Frontend UI**: `Goals.tsx` fetches and displays goals grouped by term, allows creating goals with multiple rules, toggling rules, and deleting goals.
- **Visual Design**: Sleek dark mode design using TailwindCSS and Lucide React icons.

## 2. What is missing or incomplete
- **Measurable Goals**: Goals lack a progress calculation metric; `targetDate` exists but isn't well utilized or displayed in relation to progress.
- **Recurring Actions in Rules**: `SystemRule` only supports a single `completed` boolean (one-off). It cannot currently model recurring actions (frequency, minimum completion, active days).
- **Daily/Weekly Consistency Tracking**: There is no history or logging mechanism for `SystemRule` to track consistency over time.
- **Visibility & Notifications**: Today's required rules are not highlighted, and there are no warnings for missing "mandatory rules". Goals without rules/systems aren't explicitly flagged.
- **State Management for Rules**: Rules can't be paused, archived, or properly edited (only toggled).

## 3. Which files need changes
- `backend/prisma/schema.prisma` (to upgrade `Goal` and `SystemRule` models)
- `backend/src/routes/goalRoutes.ts` (to handle new fields, logging, and progress calculation)
- `frontend/src/types/index.ts` (to update interfaces)
- `frontend/src/pages/Goals.tsx` (to add UI for recurring rules, editing, archiving, progress visualization, and warnings)
- *Potentially* `frontend/src/components/Dashboard.tsx` or similar (to show "Today's required actions" if meant for the main dashboard).

## 4. Short implementation plan
1. **Database Schema Update**: 
   - Add `status` (active/paused/archived), `frequency`, `activeDays`, `minCompletion` to `SystemRule`.
   - Add a `SystemRuleLog` model to track completions over time without duplicating all of `Habit`'s complexity, OR link `Goal` directly to `Habit` for recurring actions and keep `SystemRule` for one-offs. (Reusing `Habit` logic for recurring actions is highly recommended to avoid duplicating the complex scheduling/logging logic).
2. **Backend API Enhancements**: 
   - Update `POST /goals` and `PATCH /goals/:id` to handle new rule types and goal statuses.
   - Add endpoints for logging recurring system rules, or fetching linked habits.
   - Add a calculation endpoint/logic to compute goal progress based on completed rules and logs.
3. **Frontend UI Updates**: 
   - Update the `GoalFormModal` to allow setting rule frequency, active days, and minimum completion.
   - Add progress bars to `GoalCard`.
   - Add UI indicators for "Goals without an effective system" and warnings for "missed rules".
   - Implement Edit, Pause, and Archive actions for goals and rules.
4. **Dashboard Integration**: 
   - Display today's required system rules on the goals page (or main dashboard).
