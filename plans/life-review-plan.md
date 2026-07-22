# Life Review Implementation Plan

## 1. How the existing Daily Reflection feature works
The existing Daily Reflection feature operates via the `Reflections.tsx` frontend page and `reflectionRoutes.ts` backend API. It allows users to answer 5 structured questions (`q1Progress`, `q2Learned`, etc.) and rate their Focus, Energy, and Satisfaction out of 5 stars. The entries are saved daily (unique to `userId` and `date`) using an `upsert` mechanism. 

## 2. Existing database models related to reflections
The `DailyReflection` model in `schema.prisma` stores:
- `date`: string (YYYY-MM-DD)
- `note`: optional general text
- `focusRating`, `energyRating`, `satisfactionRating`: integers
- `q1Progress`, `q2Learned`, `q3Blocked`, `q4NextAction`, `q5ObstaclePlan`: text
- Relationships: `User`, `Goal`, `Habit`
- `createdAt`, `updatedAt`

## 3. Existing routes, services, server actions, and components
- **Frontend Component**: `Reflections.tsx` handles the form and displays historical daily entries and weekly summaries.
- **Backend API**: `reflectionRoutes.ts` provides `GET /user/:userId`, `GET /user/:userId/date/:date`, and `POST /` (upsert).

## 4. What can be reused
- Existing layout structure and styling patterns (colors, cards).
- Authentication and User ID context.
- API structure (standard Express CRUD pattern).

## 5. What is missing
- Models for `LifeReview` and `LifeAreaRating` (or similar).
- Fields to track draft/completed status, review type (Quarterly/Annual), cycle/year identifiers, question versioning.
- The 10 distinct life areas.
- Quarterly and Annual specific question sets.
- Comparison logic to calculate changes in score and display side-by-side data.
- Action follow-up system tied to the review.
- Historical trend visualization specific to Life Reviews.

## 6. Required database changes
We need new Prisma models to not clutter `DailyReflection`.
```prisma
model LifeReview {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type            String   // "quarterly" | "annual"
  year            Int
  cycle           Int      // 1-4 for quarters, 1 for annual
  status          String   @default("draft") // "draft" | "completed"
  
  // General responses (JSON to handle versioning flexibly, or explicit fields)
  responses       String?  // JSON containing general Q&A
  mainPriority    String?
  nextAction      String?
  actionTargetDate String?
  actionStatus    String?  // "not_started", "completed", etc.
  notes           String?
  
  questionVersion Int      @default(1)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  completedAt     DateTime?

  areas           LifeReviewArea[]

  @@unique([userId, type, year, cycle])
}

model LifeReviewArea {
  id            String     @id @default(uuid())
  lifeReviewId  String
  lifeReview    LifeReview @relation(fields: [lifeReviewId], references: [id], onDelete: Cascade)
  
  areaName      String     // e.g., "Physical health"
  rating        Int?       // 1-10
  responses     String?    // JSON storing area-specific Q&A answers
}
```

## 7. Required API or server-action changes
Create a new API route `backend/src/routes/lifeReviewRoutes.ts`:
- `GET /user/:userId` - fetch all reviews
- `GET /user/:userId/cycle?type=&year=&cycle=` - fetch specific
- `POST /` - create or update a draft (upsert)
- `PATCH /:id/complete` - mark as completed
- `PATCH /:id/action` - update the status of the final action

## 8. Files that need modification
- `backend/src/index.ts` (to register new routes)
- `backend/prisma/schema.prisma` (new models)
- `frontend/src/pages/Reflections.tsx` (to add a link or tab for Life Reviews, or rename it completely - keeping them separate as requested)

## 9. New files that need creation
- `backend/src/routes/lifeReviewRoutes.ts`
- `frontend/src/components/LifeReview/LifeReviewDashboard.tsx`
- `frontend/src/components/LifeReview/LifeReviewForm.tsx`
- `frontend/src/components/LifeReview/LifeReviewComparison.tsx`
- `frontend/src/components/LifeReview/LifeReviewTrends.tsx`
- `backend/test-life-review.ts` (for automated tests)

## 10. Risks to existing data
Minimal. Since we are creating new database models (`LifeReview` and `LifeReviewArea`), the existing `DailyReflection` table and its records will remain untouched and unaffected.

## 11. Short phased implementation plan
1. **Schema & API**: Update Prisma schema, run migration, and build the `lifeReviewRoutes.ts` CRUD operations.
2. **Frontend Foundation**: Update types, add the "Life Review" section inside the `Reflections.tsx` page (via a new tab).
3. **Form UI**: Implement the guided step-by-step flow (Areas -> Ratings -> Questions -> Final Priority). Autosave drafts.
4. **Comparison & History**: Build the side-by-side comparison view and historical trend visualizations.
5. **Testing**: Write automated tests and verify end-to-end functionality.
