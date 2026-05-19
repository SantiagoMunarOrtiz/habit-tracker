# Rewards & Milestones Implementation Plan

## Objective
Implement a tiered milestone system based on habit completions to motivate users, rewarding them with specific badges and colors as they hit significant streaks or total completions.

## Defined Milestones

| Completions | Milestone Name | Suggested Color |
| :--- | :--- | :--- |
| 10 | Pink Day | Pink (`#FFC0CB` or similar) |
| 21 | Classic Milestone | *To be determined* (e.g., Bronze / `#CD7F32`) |
| 66 | Science Milestone | *To be determined* (e.g., Silver / `#C0C0C0`) |
| 90 | Discipline Badge | *To be determined* (e.g., Gold / `#FFD700`) |
| 180 | Identity Badge | *To be determined* (e.g., Amethyst / `#9966CC`) |
| 365 | Year Badge | *To be determined* (e.g., Diamond / `#b9f2ff`) |

## Implementation Steps

### 1. Database & Backend Updates
- [ ] Ensure the database schema can support these specific achievements/badges (or update `seedAchievements.js` / `schema.prisma` if achievements are stored in the DB).
- [ ] Add logic in `backend/src/services/habitService.ts` or `achievementRoutes.ts` to evaluate and award these specific milestones when a user reaches the required completion counts.

### 2. Frontend Updates
- [ ] Update frontend types (`frontend/src/types/index.ts`) to include the new milestones and their corresponding color codes.
- [ ] Create UI components or update existing ones (e.g., `frontend/src/pages/Rewards.tsx` and `frontend/src/pages/Achievements.tsx`) to display these badges.
- [ ] Apply the specific colors to the badges in the UI.

### 3. Testing
- [ ] Verify that completing a habit exactly 10, 21, 66, 90, 180, and 365 times triggers the correct milestone.
- [ ] Verify that the UI correctly displays the unlocked badges with their assigned colors.