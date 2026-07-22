import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes';
import habitRoutes from './routes/habitRoutes';
import vacationRoutes from './routes/vacationRoutes';
import authRoutes from './routes/authRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import achievementRoutes from './routes/achievementRoutes';
import { authenticateToken } from './middleware/authMiddleware';

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow any localhost origin (5173, 5174, etc.) for local dev
    if (!origin || origin.startsWith('http://localhost:')) {
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

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
