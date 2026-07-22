const fs = require('fs');

const files = [
  './backend/src/routes/goalRoutes.ts',
  './backend/src/routes/lifeReviewRoutes.ts',
  './backend/src/routes/reflectionRoutes.ts',
  './backend/src/routes/workPlannerRoutes.ts'
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // Just replace `, userId: (req as any).user?.userId` exactly
    content = content.replace(/,\s*userId:\s*\(req\s+as\s+any\)\.user\?\.userId/g, "");

    fs.writeFileSync(file, content);
}
console.log('Done');
