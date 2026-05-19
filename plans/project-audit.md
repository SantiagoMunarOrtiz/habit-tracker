# Habit Tracker App - Project Audit & Strategy

## 1. Current Project Stage
**Development Stage (Early Phase)**
We have moved past discovery and planning. The React frontend and Node.js backend have been initialized, the Prisma database schema (SQLite for MVP) is set up, and basic API endpoints and UI components are in place. We are currently implementing Phase 1 and Phase 2 of the core features.

## 2. What is Already Defined
*   **Purpose:** Intelligent habit tracking across Personal Life, Work, and Study.
*   **Core Technology:** React (Vite), Node.js (Express), Prisma (SQLite for MVP), Tailwind CSS, Recharts.
*   **Database Schema:** Users, Categories, Habits, HabitLogs, Goals, Rewards, UserRewards.
*   **Basic API:** Endpoints for creating users, habits, and logging check-ins.
*   **Basic UI:** Sidebar navigation, Dashboard (Today's Habits), Analytics chart (Recharts), Rewards view.
*   **Project Structure:** Monorepo-style setup with a root package.json running both frontend and backend concurrently.

## 3. What is Missing
*   **Authentication:** Currently using a mock `temp-user-id`. Needs a real solution (e.g., Supabase, Auth0, or custom JWT).
*   **App Name:** Currently "HabitSync" as a placeholder.
*   **AI Recommendation Logic:** The rules for suggesting habit adjustments based on completion data are not yet implemented.
*   **Full Integration:** Connecting the React frontend state to the live Express API.
*   **Advanced Analytics:** Implementing the Recharts frontend with actual database metrics.
*   **Production Database:** Transitioning from SQLite to PostgreSQL.

## 4. MVP Definition
*   **Must-Have (Phase 1 & 2):**
    *   User Registration/Login.
    *   Create, Edit, Delete Habits (with categories and frequency).
    *   Daily Check-ins (Mark completed/failed).
    *   Basic Progress Visualization (Recharts weekly bar chart).
    *   Streak calculation.
*   **Nice-to-Have (Post-MVP):**
    *   AI Smart Recommendations.
    *   Advanced Gamification (Badges, levels, leaderboards).
    *   Complex analytics (Heatmaps, correlation graphs).
    *   Push notifications.

## 5. Technical Recommendation
*   **Frontend:** React (Vite) + TypeScript.
*   **Backend:** Node.js + Express + TypeScript.
*   **Database & ORM:** PostgreSQL + Prisma. (Currently using SQLite for local dev speed).
*   **Authentication:** Supabase Auth (easiest drop-in for this stack) or Clerk.
*   **UI/Styling:** Tailwind CSS + Lucide React (Icons).
*   **Charts:** Recharts.
*   **Deployment:** Vercel (Frontend) + Render/Railway (Backend) + Supabase (Database).

## 6. Database Structure (Already Implemented in Prisma)
*   `User`: id, email, level, points.
*   `Category`: id, name (Personal, Work, Study), color.
*   `Habit`: id, title, frequency, timeOfDay, active, categoryId.
*   `HabitLog`: id, date, status (completed, skipped), note, habitId.
*   `Goal`: id, title, targetDate, status.
*   `Reward/UserReward`: Gamification tracking.

## 7. User Interface Structure
*   **Dashboard:** Today's habits, quick check-in buttons, current streak indicators.
*   **Habit List/Creation:** Modal or dedicated page to define a habit, assign a category, and set frequency.
*   **Analytics:** Recharts views showing weekly completion rates and category balance.
*   **Rewards:** A gamified view showing current level, points, and unlocked badges.
*   **Reflections (Future):** A journal view tied to skipped/failed habits to understand friction.

## 8. Science-Based Motivation Strategy
*   **Small Wins & Streaks:** Visual feedback (confetti, fire icons) immediately upon check-in.
*   **Reducing Friction:** 1-click check-ins on the dashboard.
*   **Habit Stacking:** UI prompts during creation to link habits.
*   **Implementation Intentions:** Forcing users to specify `timeOfDay` (Morning/Evening).
*   **Weekly Reviews:** An automated prompt every Sunday summarizing the `Analytics` view.

## 9. Risks and Problems
*   **Risk:** Overcomplicating the MVP.
    *   *Solution:* Stick strictly to the "Must-Have" list. Delay AI and complex gamification until users are actually tracking habits.
*   **Risk:** User Drop-off due to high friction.
    *   *Solution:* Make the check-in process take less than 3 seconds. Avoid mandatory long reflection notes.
*   **Risk:** Timezone handling for daily check-ins and streaks.
    *   *Solution:* Store all dates in standard UTC but handle streak calculations relative to the user's local timezone.

## 10. Development Roadmap
*   **Step 1:** Finalize the mock UI and Express API integration. (In Progress)
*   **Step 2:** Implement actual Database Queries for the Recharts Analytics.
*   **Step 3:** Implement Authentication (JWT/Supabase) and replace mock IDs.
*   **Step 4:** Migrate from SQLite to PostgreSQL.
*   **Step 5:** Polish UI/UX and deploy to Vercel/Render.

## 11. Next Action
The most critical next step before writing more new feature code is **Integrating the frontend with the backend**. We need to connect the React `Dashboard` to the Express `GET /api/users/:userId/habits` endpoint and the `POST` check-in endpoint to ensure the core data flow is working end-to-end.