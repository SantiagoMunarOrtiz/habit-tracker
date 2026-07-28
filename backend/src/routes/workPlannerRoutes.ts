import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || "postgresql://neondb_owner:npg_s57lHUvtwBod@ep-young-wave-ap5ir4ms-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require" } } });

// PROJECTS
router.get('/user/:userId/projects', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

    try {
        const { userId } = req.params;
        if (req.user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

        const projects = await prisma.workProject.findMany({
            where: { userId },
            include: { tasks: true }
        });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/projects', authenticateToken as any, async (req: AuthRequest, res: Response) => {
    try {
        const { userId, title, area, outcome, deadline } = req.body;
  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

        if (req.user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

        const project = await prisma.workProject.create({
            data: { userId, title, area, outcome, deadline }
        });
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// TASKS
router.get('/user/:userId/tasks', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

    try {
        const { userId } = req.params;
        if (req.user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

        const tasks = await prisma.workTask.findMany({
            where: { userId },
            include: { project: true, focusSessions: true }
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/tasks', authenticateToken as any, async (req: AuthRequest, res: Response) => {
    try {
        const { userId, title, area, projectId, deadline, scheduledDate, priority } = req.body;
  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

        if (req.user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

        const task = await prisma.workTask.create({
            data: { 
                userId, title, area, projectId: projectId || null, 
                deadline, scheduledDate, priority: priority || 'medium'
            }
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.patch('/tasks/:id', authenticateToken as any, async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const updates = req.body;
        
        const task = await prisma.workTask.findUnique({ where: { id } });
        if (task?.userId !== req.user?.userId) return res.status(403).json({ error: 'Forbidden' });

        const updated = await prisma.workTask.update({
            where: { id },
            data: updates
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/tasks/:id', authenticateToken as any, async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        
        const task = await prisma.workTask.findUnique({ where: { id } });
        if (task?.userId !== req.user?.userId) return res.status(403).json({ error: 'Forbidden' });

        await prisma.workTask.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// FOCUS SESSIONS
router.post('/focus', authenticateToken as any, async (req: AuthRequest, res: Response) => {
    try {
        const { taskId, duration, outcome, notes } = req.body;
        
        const task = await prisma.workTask.findUnique({ where: { id: taskId } });
        if (task?.userId !== req.user?.userId) return res.status(403).json({ error: 'Forbidden' });

        const session = await prisma.focusSession.create({
            data: {
                taskId,
                duration,
                outcome,
                notes,
                endTime: new Date(),
                userId: req.user?.userId
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
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// COURSES
router.get('/user/:userId/courses', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

    try {
        const { userId } = req.params;
        if (req.user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

        const courses = await prisma.workCourse.findMany({
            where: { userId }
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/courses', authenticateToken as any, async (req: AuthRequest, res: Response) => {
    try {
        const { userId, title, deadline } = req.body;
  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

        if (req.user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

        const course = await prisma.workCourse.create({
            data: { userId, title, deadline }
        });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
