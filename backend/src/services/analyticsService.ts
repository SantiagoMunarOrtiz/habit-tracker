import { PrismaClient } from '@prisma/client';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format, parseISO } from 'date-fns';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || "postgresql://neondb_owner:npg_s57lHUvtwBod@ep-young-wave-ap5ir4ms-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require" } } });

export const getHabitAnalytics = async (habitId: string) => {
  const logs = await prisma.habitLog.findMany({
    where: { habitId }
  });
  
  let completedCount = 0;
  let missedCount = 0;
  
  logs.forEach(log => {
    if (log.status === 'completed') completedCount++;
    else if (log.status === 'skipped') missedCount++;
  });
  
  return { completedCount, missedCount };
};

export const analyticsService = {
  async getDailyStats(userId: string, dateStr: string, habitId?: string) {
    // We add T00:00:00 to avoid any timezone offset drift
    const targetDate = new Date(`${dateStr}T00:00:00.000`); 
    // Add 24h buffer to targetDateEnd to account for local timezone differences
    const targetDateEnd = new Date(`${dateStr}T23:59:59.999Z`);
    targetDateEnd.setHours(targetDateEnd.getHours() + 24);
    
    const dayOfWeek = targetDate.getDay(); // 0 (Sun) to 6 (Sat)

    // 1. Fetch habits active on this date
    const habitWhereClause: any = {
      userId,
      isArchived: false
    };
    if (habitId) {
      habitWhereClause.id = habitId;
    }

    const habits = await prisma.habit.findMany({
      where: habitWhereClause
    });

    // 2. Fetch vacations overlapping with this date
    const vacations = await prisma.vacation.findMany({
      where: {
        userId,
        startDate: { lte: dateStr },
        endDate: { gte: dateStr }
      }
    });

    // 3. Fetch logs for this date
    const logs = await prisma.habitLog.findMany({
      where: {
        habit: { userId },
        date: dateStr
      }
    });

    let expectedCount = 0;
    let completedCount = 0;
    let missedCount = 0;
    let restDaysCount = 0;
    let vacationDaysCount = 0;
    let replacementCount = 0;

    let catStats = {
      personal: { expected: 0, completed: 0 },
      work: { expected: 0, completed: 0 },
      study: { expected: 0, completed: 0 }
    };

    for (const habit of habits) {
      if (habit.isArchived) {
        // If it's archived, do not count it for any date >= the date it was archived
        const archivedDate = new Date(habit.updatedAt).toISOString().split('T')[0];
        if (dateStr >= archivedDate) continue;
      }
      if (!habit.active) continue;

      // Ensure habit is active on this specific date
      const hStart = new Date(habit.startDate);
      // We check if the habit was created after the END of the target date
      // This avoids timezone issues where UTC date pushes into "tomorrow"
      if (hStart > targetDateEnd) continue;

      if (habit.endDate) {
        const hEnd = new Date(`${habit.endDate}T23:59:59.999Z`); // End of the end date
        if (targetDate > hEnd) continue;
      }

      const pType = (habit.planType || 'Personal').toLowerCase() as 'personal' | 'work' | 'study';
      if (!catStats[pType]) catStats[pType] = { expected: 0, completed: 0 };

      // Check if habit falls on a vacation
      const isVacation = vacations.some(v => v.appliesTo === 'All' || v.appliesTo === habit.planType);
      if (isVacation) {
        vacationDaysCount++;
        continue;
      }

      // Check if it's a rest day
      let isRestDay = false;
      if (habit.restDays) {
        try {
          const restDaysArr = JSON.parse(habit.restDays);
          // UI uses 0=Mon...6=Sun
          const uiDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          if (restDaysArr.includes(uiDay)) isRestDay = true;
        } catch (e) {}
      }
      if (isRestDay) {
        restDaysCount++;
        continue;
      }

      // Check schedule
      let isScheduled = false;
      if (habit.scheduleType === 'daily') isScheduled = true;
      else if (habit.scheduleType === 'fixedDays' && habit.selectedDays) {
        try {
          const selected = JSON.parse(habit.selectedDays);
          // UI uses 0=Mon...6=Sun. JS getDay is 0=Sun...6=Sat.
          const uiDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          if (selected.includes(uiDay)) isScheduled = true;
        } catch (e) {}
      } else if (habit.scheduleType === 'flexible') {
        isScheduled = true; 
      }

      const log = logs.find(l => l.habitId === habit.id);
      const isCompleted = log?.status === 'completed';
      const isSkipped = log?.status === 'skipped';

      if (isScheduled) {
        expectedCount++;
        catStats[pType].expected++;
        if (isCompleted) {
          completedCount++;
          catStats[pType].completed++;
        } else if (isSkipped) {
          missedCount++;
        }
      } else {
        if (isCompleted) {
          replacementCount++;
          expectedCount++;
          completedCount++;
          catStats[pType].expected++;
          catStats[pType].completed++;
        } else if (isSkipped) {
          // Optional skip doesn't count against expected
        }
      }
    }

    let status = 'None';
    if (expectedCount > 0) {
      if (completedCount === expectedCount) status = 'Golden';
      else if (completedCount > 0) status = 'Partial';
      else status = 'Missed';
    } else if (vacationDaysCount > 0) {
      status = 'Vacation';
    } else if (restDaysCount > 0) {
      status = 'Rest';
    }

    return {
      date: dateStr,
      expectedCount,
      completedCount,
      missedCount,
      restDaysCount,
      vacationDaysCount,
      replacementCount,
      status,
      categories: catStats,
      progressPercentage: expectedCount === 0 ? null : (completedCount / expectedCount) * 100
    };
  },

  async getWeeklyStats(userId: string, dateStr: string, habitId?: string) {
    const targetDate = parseISO(dateStr);
    const start = startOfWeek(targetDate, { weekStartsOn: 1 });
    // Rule: from the start of the current week TO TODAY.
    const end = targetDate;
    
    const days = eachDayOfInterval({ start, end });
    const dailyBreakdown = await Promise.all(
      days.map((d: Date) => this.getDailyStats(userId, format(d, 'yyyy-MM-dd'), habitId))
    );

    let expectedCount = 0;
    let completedCount = 0;
    dailyBreakdown.forEach((d: any) => {
      expectedCount += d.expectedCount;
      completedCount += d.completedCount;
    });

    return {
      weekStartDate: format(start, 'yyyy-MM-dd'),
      weekEndDate: format(end, 'yyyy-MM-dd'),
      expectedCount,
      completedCount,
      missedCount: expectedCount - completedCount,
      progressPercentage: expectedCount === 0 ? null : (completedCount / expectedCount) * 100,
      dailyBreakdown
    };
  },

  async getMonthlyStats(userId: string, year: number, month: number, maxDateStr?: string, habitId?: string) {
    const targetDate = new Date(year, month - 1, 1);
    const start = startOfMonth(targetDate);
    
    // Rule: from the first day of the current month TO TODAY.
    let end = endOfMonth(targetDate);
    if (maxDateStr) {
      const maxDate = parseISO(maxDateStr);
      if (maxDate < end) end = maxDate;
    }
    
    // If the requested month is entirely in the future compared to maxDate, there are no days to check
    if (maxDateStr && start > parseISO(maxDateStr)) {
       return {
         month, year, expectedCount: 0, completedCount: 0, missedCount: 0, progressPercentage: null, dailyBreakdown: []
       };
    }

    const days = eachDayOfInterval({ start, end });
    const dailyBreakdown = await Promise.all(
      days.map((d: Date) => this.getDailyStats(userId, format(d, 'yyyy-MM-dd'), habitId))
    );

    let expectedCount = 0;
    let completedCount = 0;
    dailyBreakdown.forEach((d: any) => {
      expectedCount += d.expectedCount;
      completedCount += d.completedCount;
    });

    return {
      month,
      year,
      expectedCount,
      completedCount,
      missedCount: expectedCount - completedCount,
      progressPercentage: expectedCount === 0 ? null : (completedCount / expectedCount) * 100,
      dailyBreakdown
    };
  },

  async getYearlyStats(userId: string, year: number, maxDateStr?: string, habitId?: string) {
    const monthlyBreakdown = [];
    let expectedCount = 0;
    let completedCount = 0;

    for (let month = 1; month <= 12; month++) {
      const mStats = await this.getMonthlyStats(userId, year, month, maxDateStr, habitId);
      monthlyBreakdown.push(mStats);
      expectedCount += mStats.expectedCount;
      completedCount += mStats.completedCount;
    }

    return {
      year,
      expectedCount,
      completedCount,
      missedCount: expectedCount - completedCount,
      progressPercentage: expectedCount === 0 ? null : (completedCount / expectedCount) * 100,
      monthlyBreakdown
    };
  }
};
