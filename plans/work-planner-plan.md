# Work & Entrepreneurship Planner Plan

## 1. Audit & Reusable Components
- **Current App:** Contains robust layout systems (Sidebar), modal systems, form UI, and a Prisma backend with SQLite.
- **Reusable Elements:** 
  - `Sidebar` component for navigation.
  - Tailwind styling patterns (dark mode, cards, inputs).
  - API setup (Express, Prisma `userRoutes`, auth middleware).
- **What is Missing:** A completely isolated data structure and UI for a massive "Work & Entrepreneurship Planner". This needs to track tasks, projects, courses, calendar events, focus sessions, and weekly reviews entirely separate from the personal habit/goal tracker.

## 2. Implementation Plan

### Step 1: Database Isolation (`schema.prisma`)
Create models completely separated from the old habit logic:
- `WorkProject` (area: Work/Entrepreneurship, deadlines, outcome)
- `WorkTask` (priority, status, estimated/actual time, next action, relates to `WorkProject`)
- `WorkCourse` (mandatory training, modules)
- `FocusSession` (timer records for WorkTasks)

### Step 2: Backend API
Create `backend/src/routes/workPlannerRoutes.ts` with dedicated endpoints:
- CRUD for Projects, Tasks, and Courses.
- Focus session logging endpoint.
- Aggregation endpoints for "Planned vs Actual time" and Calendar views.

### Step 3: The Standalone View (`frontend/src/pages/WorkPlanner.tsx`)
Create a massive, self-contained dashboard page with internal tabs/sections:
- **Daily Planning:** Select 1 main task, 2 secondary tasks. Warnings for excessive workload.
- **Kanban/List Tasks:** Filter by area, project, status. 
- **Calendar & Deadlines:** Visual block representation of deadlines and meetings.
- **Focus Mode Overlay:** A built-in timer component for active tracking, blocking everything else.
- **Weekly Review:** End-of-week review flow (completed tasks, blockers, next priorities).

### Step 4: Evidence-Based Rule Enforcement
- Implement UI blocks: Cannot start focus mode if another is active. Cannot mark more than 1 task as "Main Task". Must enforce "If X, then Y" fields on tasks. Warn on over-scheduling.