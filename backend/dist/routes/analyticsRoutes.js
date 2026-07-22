"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsService_1 = require("../services/analyticsService");
const router = (0, express_1.Router)();
// GET /analytics/daily?date=YYYY-MM-DD&habitId=optional
router.get('/daily', async (req, res) => {
    try {
        const userId = req.user.id;
        const date = req.query.date;
        const habitId = req.query.habitId;
        if (!date) {
            return res.status(400).json({ error: 'Date is required (YYYY-MM-DD)' });
        }
        const stats = await analyticsService_1.analyticsService.getDailyStats(userId, date, habitId);
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching daily stats:', error);
        res.status(500).json({ error: 'Failed to fetch daily stats' });
    }
});
// GET /analytics/weekly?date=YYYY-MM-DD&habitId=optional
router.get('/weekly', async (req, res) => {
    try {
        const userId = req.user.id;
        const date = req.query.date;
        const habitId = req.query.habitId;
        if (!date) {
            return res.status(400).json({ error: 'Date is required (YYYY-MM-DD)' });
        }
        const stats = await analyticsService_1.analyticsService.getWeeklyStats(userId, date, habitId);
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching weekly stats:', error);
        res.status(500).json({ error: 'Failed to fetch weekly stats' });
    }
});
// GET /analytics/monthly?year=YYYY&month=MM&date=YYYY-MM-DD&habitId=optional
router.get('/monthly', async (req, res) => {
    try {
        const userId = req.user.id;
        const year = parseInt(req.query.year);
        const month = parseInt(req.query.month);
        const dateStr = req.query.date;
        const habitId = req.query.habitId;
        if (isNaN(year) || isNaN(month)) {
            return res.status(400).json({ error: 'Year and month are required' });
        }
        const stats = await analyticsService_1.analyticsService.getMonthlyStats(userId, year, month, dateStr, habitId);
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching monthly stats:', error);
        res.status(500).json({ error: 'Failed to fetch monthly stats' });
    }
});
// GET /analytics/yearly?year=YYYY&date=YYYY-MM-DD&habitId=optional
router.get('/yearly', async (req, res) => {
    try {
        const userId = req.user.id;
        const year = parseInt(req.query.year);
        const dateStr = req.query.date;
        const habitId = req.query.habitId;
        if (isNaN(year)) {
            return res.status(400).json({ error: 'Year is required' });
        }
        const stats = await analyticsService_1.analyticsService.getYearlyStats(userId, year, dateStr, habitId);
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching yearly stats:', error);
        res.status(500).json({ error: 'Failed to fetch yearly stats' });
    }
});
exports.default = router;
