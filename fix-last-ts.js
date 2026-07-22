const fs = require('fs');

let authContent = fs.readFileSync('backend/src/routes/authRoutes.ts', 'utf8');
authContent = authContent.replace(/from 'bcrypt';/, "from 'bcryptjs';");
fs.writeFileSync('backend/src/routes/authRoutes.ts', authContent);

let lifeReviewContent = fs.readFileSync('backend/src/routes/lifeReviewRoutes.ts', 'utf8');
lifeReviewContent = lifeReviewContent.replace(/notes \!== undefined \? notes : review\.notes/g, "notes !== undefined ? notes : (review?.notes || null)");
fs.writeFileSync('backend/src/routes/lifeReviewRoutes.ts', lifeReviewContent);

let reflectionContent = fs.readFileSync('backend/src/routes/reflectionRoutes.ts', 'utf8');
// Fix: src/routes/reflectionRoutes.ts(65,21): error TS2322: Type 'string | string[]' is not assignable to type 'string'.
reflectionContent = reflectionContent.replace(/const \{ date \} = req\.query;/g, "const date = req.query.date as string;");
fs.writeFileSync('backend/src/routes/reflectionRoutes.ts', reflectionContent);

console.log('Done');
