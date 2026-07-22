# Daily Reflection & Growth Plan

## 1. Overview
The goal is to add a "Daily Reflection & Growth" section that allows users to quickly review their day, rate their energy/focus, and answer 5 key questions to drive continuous improvement. This reflection can be linked to a specific Goal or Habit (System) to provide targeted insights.

## 2. Database Changes (`backend/prisma/schema.prisma`)
We will create a new model `DailyReflection` without duplicating existing features.

```prisma
model DailyReflection {
  id              String   @id @default(uuid())
  date            String   // YYYY-MM-DD
  note            String?
  
  // Ratings (1-5)
  focusRating     Int?
  energyRating    Int?
  satisfactionRating Int?
  
  // Questions
  q1Progress      String?  // What meaningful progress did I make today?
  q2Learned       String?  // What did I learn?
  q3Blocked       String?  // What blocked or distracted me?
  q4NextAction    String?  // What is my next concrete action?
  q5ObstaclePlan  String?  // If this obstacle happens tomorrow, what will I do?
  
  // Relations (Optional linking)
  goalId          String?
  goal            Goal?    @relation(fields: [goalId], references: [id], onDelete: SetNull)
  habitId         String?
  habit           Habit?   @relation(fields: [habitId], references: [id], onDelete: SetNull)

  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, date]) // Usually one reflection per day
}
```

## 3. Backend API (`backend/src/routes/reflectionRoutes.ts`)
1. `GET /api/reflections/user/:userId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
   - Fetch reflections within a date range (for history and weekly summaries).
2. `GET /api/reflections/user/:userId/date/:date`
   - Fetch a specific day's reflection to edit or view.
3. `POST /api/reflections`
   - Create or update (upsert) a daily reflection.

## 4. Frontend UI & Components
- **`src/types/index.ts`**: Add `DailyReflection` interface.
- **`src/components/Sidebar.tsx`**: Add "Reflections" link.
- **`src/pages/Reflections.tsx`**: The main hub for this feature.
  - **Daily Entry Form**: A clean, responsive form to write notes, select 1-5 ratings (star/circle components), and answer the 5 questions.
  - **Link Dropdown**: Allow users to optionally link the reflection to a Goal or Habit (fetched from existing state).
  - **History View**: A list of past daily reflections.
  - **Weekly Summary View**: A simple dashboard that calculates average ratings and displays aggregated lists of "repeated blockers", "lessons learned", and "unfinished next actions" from the past 7 days.
  - **Empty States & Validation**: Handle cases where no reflection exists for a day, and ensure ratings stay between 1-5.

## 5. Implementation Steps
1. Add `DailyReflection` to Prisma schema and run migrations.
2. Create `reflectionRoutes.ts`, implement endpoints, and mount it in `index.ts`.
3. Build the `DailyReflectionForm` component (UI for ratings and 5 questions).
4. Build the `Reflections.tsx` page (Tabs for "Today's Reflection", "History", and "Weekly Summary").
5. Write basic unit tests for the reflection calculation logic.
6. Ensure fully responsive styling using existing Tailwind configuration.
