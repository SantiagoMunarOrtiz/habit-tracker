"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// PROJECTS
router.get('/user/:userId/projects', authMiddleware_1.authenticateToken, async (req, res) => {
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    try {
        const { userId } = req.params;
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        const projects = await prisma.workProject.findMany({
            where: { userId },
            include: { tasks: true }
        });
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/projects', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { userId, title, area, outcome, deadline } = req.body;
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        const project = await prisma.workProject.create({
            data: { userId, title, area, outcome, deadline }
        });
        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// TASKS
router.get('/user/:userId/tasks', authMiddleware_1.authenticateToken, async (req, res) => {
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    try {
        const { userId } = req.params;
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        const tasks = await prisma.workTask.findMany({
            where: { userId },
            include: { project: true, focusSessions: true }
        });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/tasks', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { userId, title, area, projectId, deadline, scheduledDate, priority } = req.body;
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        const task = await prisma.workTask.create({
            data: {
                userId, title, area, projectId: projectId || null,
                deadline, scheduledDate, priority: priority || 'medium'
            }
        });
        res.status(201).json(task);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.patch('/tasks/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;
        const task = await prisma.workTask.findUnique({ where: { id } });
        if (task?.userId !== req.user?.userId)
            return res.status(403).json({ error: 'Forbidden' });
        const updated = await prisma.workTask.update({
            where: { id },
            data: updates
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.delete('/tasks/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const task = await prisma.workTask.findUnique({ where: { id } });
        if (task?.userId !== req.user?.userId)
            return res.status(403).json({ error: 'Forbidden' });
        await prisma.workTask.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// FOCUS SESSIONS
router.post('/focus', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { taskId, duration, outcome, notes } = req.body;
        const task = await prisma.workTask.findUnique({ where: { id: taskId } });
        if (task?.userId !== req.user?.userId)
            return res.status(403).json({ error: 'Forbidden' });
        const session = await prisma.focusSession.create({
            data: {
                taskId,
                duration,
                outcome,
                notes,
                endTime: new Date()
            }
        });
        // Update task actual time
        if (duration) {
            await prisma.workTask.update({
                where: { id: taskId },
                data: { actualTime: { increment: duration } }
            });
        }
        res.status(201).json(session);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// COURSES
router.get('/user/:userId/courses', authMiddleware_1.authenticateToken, async (req, res) => {
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    try {
        const { userId } = req.params;
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        const courses = await prisma.workCourse.findMany({
            where: { userId }
        });
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/courses', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { userId, title, deadline } = req.body;
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        const course = await prisma.workCourse.create({
            data: { userId, title, deadline }
        });
        res.status(201).json(course);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
