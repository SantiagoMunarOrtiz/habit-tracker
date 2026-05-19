# Habit-Specific Analytics and Rewards Plan

## Objective
Enhance the Rewards and Analytics pages so that users can track milestones and view statistical progress for *individual* habits, rather than just aggregated overall progress. 

## 1. Analytics Page Enhancements (Filtering by Habit)
Currently, the Analytics page shows overall progress (Today, This Week, This Month, This Year). 
### Proposed Changes:
- **Add a Habit Selector:** Introduce a dropdown at the top of the Analytics page to select either "All Habits" (default) or a specific active habit.
- **Dynamic Data Fetching:** 
  - Update the backend `analyticsRoutes` to accept a `habitId` query parameter.
  - When a specific habit is selected, the charts (progress over time, streak, mini-reward progress) will re-calculate and display data exclusively for that habit.
- **UI Adjustments:** The "Active Habits Completions" block will show detailed stats specific to the selected habit (e.g., longest streak for this habit, completion rate).

## 2. Rewards Page Enhancements (Per-Habit Milestones)
Currently, the Rewards page groups milestones together based on the user's overall highest-performing habit.
### Proposed Changes:
- **Separated Habit Views:** Instead of a single flat checklist, group the achievements by Habit. 
- **Expandable/Collapsible Sections:** Show each habit as a section (e.g., "Reading", "Exercise"). Expanding a section reveals the milestone checklist (Pink Day, Classic, Science, etc.) specifically for that habit.
- **Backend Adjustments:** 
  - Modify `GET /api/achievements/checklist` to return an array of objects grouped by habit. 
  - Example output structure:
    ```json
    [
      {
        "habitId": "123",
        "habitTitle": "Read 10 pages",
        "milestones": [
           { "name": "Pink Day", "status": "Completed", "progress": 10 },
           { "name": "Classic", "status": "InProgress", "progress": 12 }
        ]
      }
    ]
    ```
- **UI Adjustments:** Update `frontend/src/pages/Achievements.tsx` to iterate over these habit groups, rendering the badges and progress bars distinctively for each habit.

## 3. Implementation Steps
- [ ] **Backend:** Update `achievementRoutes.ts` to calculate and group milestones per habit instead of finding the global maximum.
- [ ] **Backend:** Update `analyticsRoutes.ts` and `analyticsService.ts` to filter by `habitId` when provided.
- [ ] **Frontend (Rewards):** Update `Achievements.tsx` UI to display a grouped layout (one section per habit).
- [ ] **Frontend (Analytics):** Add a `<select>` dropdown for habits, hook it up to state, and pass the selected `habitId` to the backend analytics requests.
