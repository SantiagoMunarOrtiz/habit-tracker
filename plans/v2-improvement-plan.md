# Habit Tracker App - V2 Improvement Plan & Audit

## 15. Audit of the Existing App
**What already works:**
*   A functional monorepo structure with React (Vite) and Node.js (Express) running concurrently.
*   Basic Prisma SQLite database schema for Users, Categories, Habits, and HabitLogs.
*   Basic REST API endpoints for user creation, habit creation, and logging.
*   Frontend integration via React fetching data and basic Recharts setup.

**What is missing:**
*   Advanced scheduling logic (specific days of the week, X times per week).
*   Rest day and flexible completion logic (currently, missed days default to failing).
*   Deep analytical calculations (weekly/monthly/yearly progress percentages).
*   Comprehensive gamification (dynamic achievements, conditional rewards).
*   "If-then" plans and motivation phrases on habits.

**What needs to be refactored:**
*   **Habit Schema:** Needs massive expansion to support `targetDaysPerWeek`, `selectedDays`, `difficulty`, `restDays`, `trigger`, and `ifThenPlan`.
*   **Progress Calculation:** Currently basic streak logic on the frontend. Needs robust backend aggregation logic to handle "X times per week" vs "Specific days".
*   **Dashboard UX:** Needs to dynamically handle "Today's Scheduled Habits" filtering out Rest Days.

## 1. Improved Habit Creation & Logic
The new habit creation form must capture:
*   **Basic Info:** Title, Description, Plan Type (Work/Study), Category.
*   **Scheduling:** 
    *   *Type A (Fixed Days):* Checkboxes for Mon, Tue, Wed, etc.
    *   *Type B (Flexible):* Numeric input for `targetDaysPerWeek` (e.g., 3x a week).
*   **Details:** Estimated duration (mins), Difficulty (Easy/Medium/Hard).
*   **Behavioral Setup:** Trigger/Cue, If-Then Plan, Motivation Phrase.
*   **Rest Days:** Explicitly marked days where the habit is skipped without penalty.

## 4. Progress Calculation Formulas
*   **Daily Progress:** `(Habits Completed Today / Scheduled Habits Today) * 100`. (Exclude rest days from denominator).
*   **Flexible Weekly Progress:** `(Total Sessions Completed This Week / targetDaysPerWeek) * 100`. Cap at 100%.
*   **Streak:** Only breaks if a scheduled day is missed. Rest days carry the streak over invisibly.
*   **Work vs Study Progress:** Separate aggregate queries comparing completion rates of habits mapped to "Work" vs "Study" plan types.

## 12. Database Improvement Plan (Prisma Schema Updates)
```prisma
model Habit {
  id                String   @id @default(uuid())
  title             String
  description       String?
  planType          String   // "Work" or "Study"
  difficulty        String   @default("Medium") // "Easy", "Medium", "Hard"
  
  // Scheduling Logic
  scheduleType      String   // "FixedDays" or "Flexible"
  selectedDays      String?  // JSON string e.g., "[1,3,5]" (Mon, Wed, Fri)
  targetDaysPerWeek Int?     // e.g., 4
  restDays          String?  // JSON string e.g., "[0,6]" (Sun, Sat)
  
  // Behavioral Science
  triggerCue        String?
  ifThenPlan        String?
  motivationPhrase  String?
  miniReward        String?
  
  // Relations
  logs              HabitLog[]
}

model Achievement {
  id              String @id @default(uuid())
  name            String
  description     String
  unlockCondition String // e.g., "7_DAY_STREAK"
  points          Int
}
// New models: HabitSchedule, RestDay, WeeklyReview, MonthlyStats
```

## 13. API Improvement Plan
*   `POST /api/habits`: Updated to accept the massive new payload (schedules, difficulty, if-then).
*   `GET /api/users/:userId/dashboard?date=YYYY-MM-DD`: A smart endpoint that returns ONLY habits scheduled for `date`, filtering out rest days.
*   `GET /api/analytics/weekly-progress`: Calculates flexible and fixed weekly stats.
*   `GET /api/analytics/yearly-heatmap`: Returns a 365-day array of daily completion rates.
*   `POST /api/habits/:id/checkin`: Updated to trigger the Achievement unlock evaluation engine.

## 14. Frontend Component Plan
*   `DashboardPage`: Central hub. Splits habits into "To Do Today" and "Planned Rest".
*   `HabitForm`: Multi-step wizard to handle the complex behavioral science inputs without overwhelming the user.
*   `HabitCalendarHeatmap`: GitHub-style grid using Recharts or simple CSS grid.
*   `AchievementCard` & `SmartRecommendationCard`: Beautiful UI elements to provide positive reinforcement.

## 7 & 8. Achievement and Reward System
*   **Achievements:** Stored in the DB, evaluated upon check-in. E.g., "First Full Week", "Best Study Week".
*   **Mini Rewards:** Short-term, healthy rewards (e.g., "Go for a walk") integrated directly into the `Habit` model. When a user completes a habit, the UI immediately surfaces their defined `miniReward`.

## 9. Science-Based Productivity Strategy Implementation
*   **Implementation Intentions:** Handled by the `ifThenPlan` field. The UI will explicitly ask "If [unexpected event], then I will [fallback action]."
*   **Small Wins:** The immediate surfacing of the `miniReward` and Confetti upon check-in.
*   **Planned Rest:** Hardcoded into the scheduling logic so users do not feel guilty for non-scheduled days.

## 16. Step-by-Step Implementation Roadmap
*   **Phase 1: Backend Refactor (Week 1)** - Update Prisma schema with V2 fields. Run migrations. Update CRUD APIs.
*   **Phase 2: Complex Scheduling Engine (Week 2)** - Implement the backend logic to correctly identify "Scheduled Days" vs "Rest Days" vs "Flexible Weekly Goals".
*   **Phase 3: Frontend Overhaul (Week 3)** - Update Habit Creation Wizard. Redesign Dashboard to reflect daily dynamic filtering.
*   **Phase 4: Deep Analytics (Week 4)** - Implement Weekly, Monthly, and Yearly calculation endpoints and hook them up to Recharts.
*   **Phase 5: Gamification & AI Rules (Week 5)** - Build the Achievement evaluation engine and the rule-based Smart Recommendations engine.