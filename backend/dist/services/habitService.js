"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateWeeklyProgress = exports.checkInHabit = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const checkInHabit = async (habitId, date, status, note) => {
    const habit = await prisma.habit.findUnique({
        where: { id: habitId },
        include: { logs: true, achievements: true }
    });
    if (!habit)
        throw new Error('Habit not found');
    const log = await prisma.habitLog.upsert({
        where: { habitId_date: { habitId, date } },
        update: { status, note: note || undefined },
        create: { habitId, date, status, note: note || undefined }
    });
    let unlockedAchievement = null;
    if (status === 'completed') {
        const totalCompletedThisHabit = await prisma.habitLog.count({
            where: { habitId: habit.id, status: 'completed' }
        });
        const milestones = [
            { count: 1, type: "1_COMPLETION", name: "First Step Celebration", description: "You took the first step!" },
            { count: 3, type: "3_COMPLETION", name: "Early Action Celebration", description: "Three days completed. Great start!" },
            { count: 7, type: "7_COMPLETION", name: "First Week Momentum", description: "A full week of progress." },
            { count: 10, type: "10_COMPLETION", name: "Pink Day", description: "10 completions! Double digits." },
            { count: 21, type: "21_COMPLETION", name: "Classic Milestone", description: "21 days! A classic milestone." },
            { count: 66, type: "66_COMPLETION", name: "Science Milestone", description: "Science says it takes 66 days to form a habit." },
            { count: 90, type: "90_COMPLETION", name: "Discipline Badge", description: "90 days of unyielding discipline." },
            { count: 180, type: "180_COMPLETION", name: "Identity Badge", description: "Half a year of success. This is who you are now." },
            { count: 365, type: "365_COMPLETION", name: "Year Badge", description: "A full year! Total mastery." },
        ];
        const reached = milestones.find(m => m.count === totalCompletedThisHabit);
        if (reached) {
            const existingAch = await prisma.habitAchievement.findUnique({
                where: { habitId_achievementType: { habitId: habit.id, achievementType: reached.type } }
            });
            if (!existingAch) {
                unlockedAchievement = await prisma.habitAchievement.create({
                    data: {
                        habitId: habit.id,
                        achievementType: reached.type,
                        name: reached.name,
                        description: reached.description
                    }
                });
            }
        }
    }
    return { log, unlockedAchievement };
};
exports.checkInHabit = checkInHabit;
const calculateWeeklyProgress = async (habitId, startDateStr, endDateStr) => {
    const habit = await prisma.habit.findUnique({
        where: { id: habitId },
        include: {
            logs: {
                where: {
                    date: { gte: startDateStr, lte: endDateStr }
                }
            }
        }
    });
    if (!habit)
        throw new Error("Habit not found");
    let mandatoryDaysOfWeek = [];
    if (habit.scheduleType === 'daily') {
        mandatoryDaysOfWeek = [0, 1, 2, 3, 4, 5, 6];
    }
    else if (habit.scheduleType === 'fixedDays' && habit.selectedDays) {
        try {
            mandatoryDaysOfWeek = JSON.parse(habit.selectedDays);
        }
        catch { }
    }
    let start = new Date(startDateStr);
    let end = new Date(endDateStr);
    const todayStr = new Date().toISOString().split('T')[0];
    let mandatoryDays = [];
    let optionalDays = [];
    let optionalCompleted = [];
    let missedMandatory = [];
    let completedMandatory = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const mappedDay = d.getDay() === 0 ? 6 : d.getDay() - 1; // 0=Mon, 6=Sun
        const isMandatory = mandatoryDaysOfWeek.includes(mappedDay);
        const log = habit.logs.find(l => l.date === dateStr);
        const isVacation = log?.status === 'vacation'; // Assuming vacation logic might pre-fill logs or we'd query vacations
        if (isMandatory) {
            mandatoryDays.push(dateStr);
            if (log?.status === 'completed') {
                completedMandatory.push(dateStr);
            }
            else if (!isVacation && dateStr <= todayStr) {
                missedMandatory.push(dateStr);
            }
        }
        else {
            optionalDays.push(dateStr);
            if (log?.status === 'completed') {
                optionalCompleted.push(dateStr);
            }
        }
    }
    let replacedMandatory = [];
    let availableOptionals = [...optionalCompleted];
    for (const missed of missedMandatory) {
        if (availableOptionals.length > 0) {
            const replacedBy = availableOptionals.shift();
            replacedMandatory.push({ missed, replacedBy });
        }
    }
    const finalMissed = missedMandatory.filter(m => !replacedMandatory.find(r => r.missed === m));
    return {
        mandatoryDays,
        optionalDays,
        completedMandatory,
        optionalCompleted,
        missedMandatory: finalMissed,
        replacedMandatory,
        unusedOptionals: availableOptionals
    };
};
exports.calculateWeeklyProgress = calculateWeeklyProgress;
