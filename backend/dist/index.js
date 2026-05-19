"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const habitRoutes_1 = __importDefault(require("./routes/habitRoutes"));
const vacationRoutes_1 = __importDefault(require("./routes/vacationRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins for dev
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/habits', authMiddleware_1.authenticateToken, habitRoutes_1.default);
app.use('/api/vacations', authMiddleware_1.authenticateToken, vacationRoutes_1.default);
app.use('/api/analytics', authMiddleware_1.authenticateToken, analyticsRoutes_1.default);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
