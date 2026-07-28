"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('Starting backend...');
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const habitRoutes_1 = __importDefault(require("./routes/habitRoutes"));
const vacationRoutes_1 = __importDefault(require("./routes/vacationRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const achievementRoutes_1 = __importDefault(require("./routes/achievementRoutes"));
const goalRoutes_1 = __importDefault(require("./routes/goalRoutes"));
const reflectionRoutes_1 = __importDefault(require("./routes/reflectionRoutes"));
const workPlannerRoutes_1 = __importDefault(require("./routes/workPlannerRoutes"));
const lifeReviewRoutes_1 = __importDefault(require("./routes/lifeReviewRoutes"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow any localhost origin and any vercel app for dev/prod
        if (!origin || origin.startsWith('http://localhost:') || origin.endsWith('.vercel.app')) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/habits', authMiddleware_1.authenticateToken, habitRoutes_1.default);
app.use('/api/vacations', authMiddleware_1.authenticateToken, vacationRoutes_1.default);
app.use('/api/analytics', authMiddleware_1.authenticateToken, analyticsRoutes_1.default);
app.use('/api/achievements', authMiddleware_1.authenticateToken, achievementRoutes_1.default);
app.use('/api/goals', authMiddleware_1.authenticateToken, goalRoutes_1.default);
app.use('/api/reflections', authMiddleware_1.authenticateToken, reflectionRoutes_1.default);
app.use('/api/work-planner', authMiddleware_1.authenticateToken, workPlannerRoutes_1.default);
app.use('/api/life-reviews', authMiddleware_1.authenticateToken, lifeReviewRoutes_1.default);
const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
exports.default = app;
