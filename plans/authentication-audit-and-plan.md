# Authentication Audit & Phased Implementation Plan

## 1. Current frontend and backend stack
- Frontend: React, TypeScript, Tailwind CSS, Vite.
- Backend: Node.js, Express, Prisma ORM, SQLite.

## 2. Current authentication library or custom implementation
- Custom implementation using `bcryptjs` for password hashing and `jsonwebtoken` for token generation.

## 3. Existing registration and login flow
- **Registration**: Accepts name, email, and password. Checks if email exists, hashes the password, creates user and default categories, signs a JWT, and returns user/token.
- **Login**: Accepts email and password. Checks if user exists, validates password using `bcrypt.compare`, signs a JWT, and returns user/token. 
- UI: Both flows share the same simple form (`Auth.tsx`). The form is missing password confirmation, loading states, and explicit field-level error validations. 

## 4. Current session-storage method
- The JWT token is returned in the response body and stored solely in the client's `localStorage`. It is manually attached as a `Bearer` token in the `Authorization` header on subsequent requests. This violates the security requirement to not use `localStorage` as the only authentication mechanism.

## 5. Current database user model
- Contains: `id`, `email`, `password`, `name`, `level`, `points`, `createdAt`, `updatedAt`.
- Explicitly relates to high-level tables like `Category`, `Habit`, `Goal`, `UserReward`, `UserAchievement`, `Vacation`, `DailyReflection`, `WorkProject`, `WorkTask`, `WorkCourse`, and `LifeReview`.

## 6. Which private records already contain a user ID
- `Category`, `Habit`, `Goal`, `UserReward`, `UserAchievement`, `Vacation`, `DailyReflection`, `WorkProject`, `WorkTask`, `WorkCourse`, and `LifeReview`.

## 7. Which records are not connected to a user
- *Directly unconnected private records*: `SystemRule` (belongs to `Goal`), `FocusSession` (belongs to `WorkTask`), `HabitLog`, `HabitReschedule`, `HabitAchievement` (belong to `Habit`), and `LifeReviewArea` (belongs to `LifeReview`). While they are secured indirectly via their parent tables, strictly enforcing user ownership means they should ideally have their own `userId`.
- *Global tables*: `Reward` and `Achievement` (expected to be global templates).

## 8. Security problems found
- JWTs stored in `localStorage` are vulnerable to XSS.
- Hashed passwords are leaked to the client in the login/register/me API responses.
- Empty passwords are technically allowed by the schema (`@default("")`), which the guest login logic exploits.
- No password strength validation on the backend.
- Missing email normalization (e.g., lowercasing emails before saving/lookup).
- Unrestricted CORS (`origin: '*'`).
- No rate limiting to protect against brute-force login attempts.

## 9. Broken or incomplete flows
- Missing password confirmation field during registration.
- Missing loading and success states in the Auth page.
- Missing "show password" toggle.
- Generic error messages instead of field-level validation errors.
- Session cannot be securely restored without exposing tokens to `localStorage`.

## 10. Files that must be modified
- `backend/package.json` (to add `cookie-parser`)
- `backend/src/index.ts` (configure CORS securely and apply `cookie-parser`)
- `backend/src/routes/authRoutes.ts` (implement HttpOnly cookies, add input validation, remove password from response)
- `backend/src/middleware/authMiddleware.ts` (read token from cookies instead of the Authorization header)
- `backend/prisma/schema.prisma` (add `userId` to child tables for strict isolation)
- `frontend/src/App.tsx` (handle secure cookie-based session restoration)
- `frontend/src/pages/Auth.tsx` (rebuild forms to include missing UI requirements)
- `frontend/src/components/Sidebar.tsx` (add proper logout flow to clear cookies)
- All `frontend/src/**/*.tsx` files containing `fetch` (over 13 files need to be modified to include `credentials: 'include'` and remove `localStorage.getItem('token')`).

## 11. Database migrations required
- Update schema to add `userId` (String, nullable initially for safe migration) to `SystemRule`, `FocusSession`, `HabitLog`, `HabitReschedule`, `HabitAchievement`, and `LifeReviewArea`.
- Create and run a one-time Node script to backfill `userId` for these records based on their existing parent relationships, followed by making the field mandatory.

## 12. Phased implementation plan

### Phase 1: Database & Backend Auth
- Update `schema.prisma` to add `userId` to all unconnected private records. Write and run a migration script to populate the `userId`. 
- Install and configure `cookie-parser`. Update `authRoutes.ts` to set secure, HttpOnly cookies for sessions, normalize emails, enforce password validation, and prevent returning passwords in API responses. Update `authMiddleware.ts` to validate the cookie token.

### Phase 2: Frontend Auth & Session Persistence
- Update `Auth.tsx` to include separate forms for Login and Registration with password confirmation, loading states, and field-level validation.
- Update `App.tsx` and all `fetch` calls across the frontend to remove `localStorage` logic and include `credentials: 'include'` for secure cookie transmission.
- Implement the secure logout flow to destroy the cookie and redirect safely.

### Phase 3: User Isolation & Testing
- Review and update all backend routes to strictly filter, read, update, and create records using the authenticated `req.user.userId`, explicitly preventing ID tampering.
- Run comprehensive manual tests on registration, login, data persistence, and logout flows to ensure everything works flawlessly across full-page reloads.