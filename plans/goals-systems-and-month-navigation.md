# Plan: Month Navigation & Goals/Systems Tracker

## 1. Month Navigation (Spreadsheet View)

### Current State
`SpreadsheetView.tsx` currently hardcodes the displayed month to the current real-world month using `const currentMonth = today.getMonth()`.

### Implementation Steps
- [ ] Convert `currentMonth` and `currentYear` from normal constants to `useState` hooks.
- [ ] Initialize them with `new Date().getMonth()` and `new Date().getFullYear()`.
- [ ] Add navigation buttons (`<` and `>`) in the header next to the Month Name (e.g., `JANUARY`).
- [ ] Create `handlePrevMonth` and `handleNextMonth` functions to safely update the state, wrapping around years.
- [ ] Ensure calendar grid recalculates `daysInMonth` and `daysArray` based on these state variables.

## 2. Goals & Systems Feature

### Concept
A feature to define goals (Short, Medium, Long term) and a mandatory "System" composed of specific instructions/rules you must check off to achieve the goal.
- **Goal:** The desired outcome (e.g., "Write a book", "Lose 10kg").
- **Term:** Short-term, Medium-term, or Long-term.
- **Mandatory System Rules:** A checklist of strict instructions/rules you must comply with (e.g., "Rule 1: Write 500 words daily", "Rule 2: Read 1 chapter of a book on writing").

### Database Schema (Prisma)
- [ ] Update `schema.prisma` to include `Goal` and `SystemRule` models:
  ```prisma
  model Goal {
    id        String       @id @default(uuid())
    title     String       // The goal itself
    term      String       @default("short") // "short", "medium", or "long"
    completed Boolean      @default(false)
    userId    String
    user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
    rules     SystemRule[]
    createdAt DateTime     @default(now())
    updatedAt DateTime     @updatedAt
  }

  model SystemRule {
    id        String   @id @default(uuid())
    goalId    String
    goal      Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)
    text      String   // The mandatory instruction
    completed Boolean  @default(false)
  }
  ```
- [ ] Run Prisma migration (`npx prisma migrate dev --name add_goals_and_rules`).

### Backend API
- [ ] Create `backend/src/routes/goalRoutes.ts` with endpoints:
  - `GET /api/goals/user/:userId` - Fetch all goals and their rules.
  - `POST /api/goals` - Create a new goal with its rules.
  - `PATCH /api/goals/:id` - Mark goal as completed.
  - `PATCH /api/goals/rules/:ruleId` - Check/uncheck a specific system rule.
  - `DELETE /api/goals/:id` - Remove a goal.
- [ ] Mount `/api/goals` in `backend/src/index.ts`.

### Frontend Implementation
- [ ] Create `src/types/Goal.ts` interfaces for `Goal` and `SystemRule`.
- [ ] Create `src/pages/Goals.tsx` and group goals by term (Short, Medium, Long).
- [ ] Add a `GoalCard` component displaying the Goal title and a checklist of its Mandatory System Rules.
- [ ] Add a `GoalFormModal` for creating a Goal, selecting its term, and adding multiple mandatory system rules dynamically.
- [ ] Update `Sidebar.tsx` to link to the new Goals page.
