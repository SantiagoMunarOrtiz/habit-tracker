# V4 Advanced Features Audit & Strategy Plan

## 1. Audit of the Specific Features

### Why the App May Show 10% (Progress Calculation Bug)
The progress calculation currently aggregates `totalExpectedSessionsThisMonth` by assuming a flat 4 weeks per month and multiplying the target days. 
**The Bug:** If you create a habit in the 3rd week of the month, the app still expects 4 weeks of completions, vastly inflating the denominator. Also, if a habit is paused or rescheduled, the app currently still counts it as "expected". 
**The Fix:** The calculation loop must strictly evaluate date-by-date. It must check if a date is within the habit's `startDate` and `endDate`, check if it's a mandatory day, and check if it falls under a `Vacation` window.

### Correct Progress Formulas
```javascript
// For a given date range (e.g., Month):
let totalExpected = 0;
let totalCompleted = 0;

for (each date in range) {
  if (isVacation(date) || isPlannedRest(date, habit) || date < habit.createdAt || !habit.isActive) {
    continue; // Skip denominator
  }
  if (isMandatoryDay(date, habit)) {
    totalExpected++;
    if (checkLog(habit, date) === 'Completed') totalCompleted++;
  }
}
const progressPercentage = (totalCompleted / totalExpected) * 100;
```

## 2. Feature Strategies

### Delete Habit Strategy
*   **Approach:** Implement **Soft Delete** (`isArchived: boolean`, `deletedAt: DateTime?`).
*   **Why:** Hard deleting wipes out `HabitLog` rows, destroying historical analytics and causing old graphs to plummet. Soft deleting hides the habit from the active dashboard but allows the analytics engine to read its logs up until the `deletedAt` date.

### Reschedule Mandatory Day Strategy
*   **Approach:** Allow a user to click a missed mandatory day and select "Reschedule". This creates a `HabitReschedule` record.
*   **Logic:** The analytics engine reads the `HabitReschedule` table. If a day was officially rescheduled, the original date's `expectedCount` is reduced by 1, and the new date's `expectedCount` increases by 1. Streaks ignore the original date.

### Vacation Mode Strategy
*   **Approach:** A global or scoped `Vacation` table (`startDate`, `endDate`). 
*   **Logic:** During the `GET /analytics` loop, if a date falls inside a vacation window, it is instantly excluded from the "expected" denominator. The UI renders these days visually distinct (e.g., a tropical icon or blue tint) so the user sees a seamless, unbroken streak.

### Reward Every 10 Completions Strategy
*   **Approach:** A `totalLifetimeCompletions` counter in the backend. When `totalLifetimeCompletions % 10 === 0`, trigger an unlock.
*   **Logic:** Generate a `Reward` object. The UI uses a progress bar (e.g., "7/10") below the dashboard to build anticipation. 

## 3. Science-Based Explanation
*   **Positive Reinforcement:** Variable, small rewards (like a 10-minute break) release dopamine. Tying this explicitly to every 10th completion leverages a *fixed-ratio schedule of reinforcement*, which builds high response rates.
*   **Avoiding Guilt-Based Motivation:** By treating Vacation and Rescheduling as "planned recovery," we eliminate the "what-the-hell effect" (where users miss one day, feel guilty, and abandon the habit entirely).
*   **Self-Monitoring & Visualization:** Seeing the progress bar hit 8/10 provides visual feedback that propels the user to finish the cycle.

## 4. Database Changes (Prisma)
```prisma
model Habit {
  // Existing fields...
  isActive    Boolean   @default(true)
  isArchived  Boolean   @default(false)
  deletedAt   DateTime?
}

model HabitLog {
  // Add 'Rescheduled', 'Vacation', 'Bonus' to status enums
}

model HabitReschedule {
  id           String   @id @default(uuid())
  habitId      String
  originalDate DateTime
  newDate      DateTime
}

model Vacation {
  id        String   @id @default(uuid())
  userId    String
  startDate DateTime
  endDate   DateTime
  appliesTo String   @default("All") // "All", "Personal", "Work"
}
```

## 5. API Endpoints
*   `PATCH /api/habits/:id/archive` - Soft deletes the habit.
*   `POST /api/habits/:id/reschedule` - Moves a mandatory day.
*   `POST /api/vacations` - Creates a vacation block.
*   `GET /api/analytics/debug-percentage` - Returns the exact numerator/denominator math for UI transparency.

## 6. React Component Plan
*   **`VacationBanner`**: A sticky banner alerting the user they are currently on break.
*   **`DeleteHabitConfirmationModal`**: Explains soft-delete vs hard-delete.
*   **`RewardProgressCard`**: A sticky widget showing "X / 10 to next reward!".

## 7. Implementation Roadmap
1.  **Phase 1: DB & Architecture Update:** Apply soft-delete, Reschedule, and Vacation tables to Prisma.
2.  **Phase 2: Analytics Engine Overhaul:** Rewrite the math to loop date-by-date (fixing the 10% bug and respecting vacations/archives).
3.  **Phase 3: Reschedule & Delete UX:** Add the archive buttons and reschedule modals to the Habit Cards.
4.  **Phase 4: Gamification & Rewards:** Build the "Every 10" unlock logic and the `RewardProgressCard`.