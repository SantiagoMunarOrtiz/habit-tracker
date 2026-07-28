import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes';
import habitRoutes from './routes/habitRoutes';
import vacationRoutes from './routes/vacationRoutes';
import authRoutes from './routes/authRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import achievementRoutes from './routes/achievementRoutes';
import goalRoutes from './routes/goalRoutes';
import reflectionRoutes from './routes/reflectionRoutes';
import workPlannerRoutes from './routes/workPlannerRoutes';
import lifeReviewRoutes from './routes/lifeReviewRoutes';
import { authenticateToken } from './middleware/authMiddleware';

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow any localhost origin and any vercel app for dev/prod
    if (!origin || origin.startsWith('http://localhost:') || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/habits', authenticateToken, habitRoutes);
app.use('/api/vacations', authenticateToken, vacationRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/achievements', authenticateToken, achievementRoutes);
app.use('/api/goals', authenticateToken, goalRoutes);
app.use('/api/reflections', authenticateToken, reflectionRoutes);
app.use('/api/work-planner', authenticateToken, workPlannerRoutes);
app.use('/api/life-reviews', authenticateToken, lifeReviewRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || String(err),
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
