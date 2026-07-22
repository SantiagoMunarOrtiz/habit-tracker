# Unified Task, Calendar & Focus System Plan

## 1. What already exists
- **Goals & Systems**: Users can define Goals (with deadlines, progress) and Systems (Habits & Rules).
- **Daily Reflection**: A system already exists for end-of-day check-ins (progress, learned, blocked, next action, obstacle plan). This directly covers the requested "Daily Check-in" feature.
- **Categories/Areas**: Basic categories exist (Personal, Work, Study).
- **Dashboard & Analytics**: Basic dashboard and analytics views exist.
- **Calendar/Spreadsheet**: A basic month view exists for habits.

## 2. What can be reused
- **Daily Reflection Feature**: Can be directly reused for the "End-of-day check-in".
- **Goals System**: Tasks can be linked to existing `Goal` records.
- **Categories**: The existing `Category` model can be mapped or extended to cover the required areas (Work, Entrepreneurship, Learning, Personal).
- **Habit Scheduling**: Existing logic for active days can be referenced, but Tasks need their own specific fields.

## 3. What is missing
- **Task Model**: A robust `Task` model with statuses (Inbox, Next, Scheduled, etc.), priority, deadlines, scheduled times, durations, and next actions.
- **Project Model**: A `Project` model linked to Tasks and Goals, containing outcome, progress, milestones, and risk status.
- **Course Tracker**: A `Course` and `Module` model for learning tracking.
- **Calendar View**: A robust Day/Week/Month calendar component capable of drag-and-drop, overlapping detection, and mixing Tasks, Deadlines, and Meetings.
- **Focus Mode**: A timer component ensuring only one task is active, recording actual time, and prompting for next actions.
- **Weekly Review**: A dedicated view to review incomplete tasks, blockers, and plan maximum 3 weekly outcomes.
- **Evidence-Informed Rules**: Logic to restrict to 1 essential daily task, 1 active focus session, and warn about task switching.

## 4. Database changes required (`schema.prisma`)
- **Task**: `title`, `area`, `projectId`, `goalId`, `description`, `status`, `priority`, `deadline`, `scheduledDate`, `estimatedDuration`, `actualDuration`, `nextAction`, `blocker`, `completionPct`, `recurrence`, `notes`, `isEssential`.
- **Project**: `title`, `outcome`, `deadline`, `progress`, `timeInvested`, `riskStatus`, `area`.
- **Course**: `name`, `goalId`, `completionPct`, `deadline`, `certificateStatus`.
- **CourseModule**: `courseId`, `title`, `status`.
- **FocusSession**: `taskId`, `startTime`, `endTime`, `actualDuration`, `outcome`, `notes`.
- **WeeklyReview**: `weekStartDate`, `outcomes` (JSON array of 3), `notes`.

## 5. Files that must change
- `backend/prisma/schema.prisma`
- `backend/src/routes/taskRoutes.ts` (New)
- `backend/src/routes/projectRoutes.ts` (New)
- `backend/src/routes/courseRoutes.ts` (New)
- `backend/src/routes/focusRoutes.ts` (New)
- `backend/src/index.ts`
- `frontend/src/types/index.ts`
- `frontend/src/pages/Today.tsx` (New)
- `frontend/src/pages/Tasks.tsx` (New)
- `frontend/src/pages/Calendar.tsx` (New)
- `frontend/src/pages/Projects.tsx` (New)
- `frontend/src/pages/Learning.tsx` (New)
- `frontend/src/pages/WeeklyReview.tsx` (New)
- `frontend/src/components/FocusMode.tsx` (New)
- `frontend/src/pages/Dashboard.tsx` (Major update)
- `frontend/src/components/Sidebar.tsx`

## 6. Phased implementation plan
**Phase 1: Database & API Foundation**
- Update Prisma schema with `Task`, `Project`, `Course`, `FocusSession`, and `WeeklyReview`.
- Create CRUD backend routes for all new entities.
- Update frontend types.

**Phase 2: Core Task & Project Management**
- Build the `Projects` view (milestones, risk status, linked tasks).
- Build the `Tasks` view (List/Kanban, filtering by Area/Status/Priority, distinguishing deadline from scheduled time).

**Phase 3: Calendar & Focus Mode**
- Build the `Calendar` view (Day/Week/Month, overlapping detection).
- Build the `Focus Mode` overlay (Timer, active task locking, session saving).

**Phase 4: Today View & Learning Tracker**
- Build the `Today` view (1 essential task limit, 2 secondary tasks, quick capture).
- Build the `Course and Learning Tracker` view.

**Phase 5: Reviews & Dashboard**
- Build the `Weekly Review` view (max 3 outcomes, review blockers).
- Update the `Dashboard` to aggregate all this new data (Today's essential task, next block, upcoming deadlines, progress bars).
