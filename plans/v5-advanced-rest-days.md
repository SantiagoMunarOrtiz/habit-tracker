# V5: Advanced Rest Days & Achievements Plan

## Requirements
1. **Rest Days & Mandatory Days**: Users must be able to specify rest days (e.g., weekends). Only mandatory days affect the streak negatively if missed.
2. **Flex Banking System**: Completing a habit on a non-mandatory day (rest day) "banks" a completion. This banked completion automatically replaces a missed mandatory day in the same week/month to keep the streak alive.
3. **Science-based Rewards**:
   - **Golden Days**: Reaching a significant milestone (e.g., 30-day streak) marks a day as "Golden" in the UI.
   - **Pink Days (Mini Gifts)**: Reaching smaller milestones (e.g., 7 days) marks a day as "Pink", signaling to the user they've earned a mini-reward (as defined in their habit's "miniReward" field).
4. **Full Achievements**: A comprehensive achievement system (e.g., First Step, 7-Day Streak, Weekend Warrior) tracked in the backend and displayed in the frontend.

## Implementation Steps

### 1. Database Schema Updates (`schema.prisma`)
- Add a `bankedDays` integer to `Habit` to track flex completions.
- Update `Achievement` model to support Golden/Pink milestones.
- Ensure `restDays` field is fully utilized (already exists as a JSON string, just needs robust logic).

### 2. Backend Logic (`backend/src/index.ts`)
- **Check-in Logic**: 
  - When checking in on a Rest Day -> Increment `bankedDays`.
  - When missing a Mandatory Day -> Check if `bankedDays > 0`. If yes, consume 1 banked day, mark as "auto-completed", keep streak alive.
- **Streak Calculation Engine**: Update the streak calculator to ignore rest days and respect banked days.
- **Milestone Detection**: During check-in, detect if the current streak hits 7 (Pink Day) or 30 (Golden Day) and unlock achievements.

### 3. Frontend Updates (`SpreadsheetView.tsx` & `HabitFormModal.tsx`)
- Update `HabitFormModal` to clearly select Mandatory vs. Rest Days.
- In `SpreadsheetView`:
  - Visually differentiate Mandatory days (bright borders/boxes) from Rest days (dimmed/dashed borders).
  - Add "Golden" CSS classes (gold borders/glow) and "Pink" CSS classes (pink borders/glow) for milestone days.
  - Show a "Banked Days: X" counter next to the habit.
- Update `Rewards.tsx` to pull from the new full achievements API.