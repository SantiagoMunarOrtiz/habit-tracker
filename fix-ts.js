const fs = require('fs');
const path = require('path');

const files = [
  './backend/src/routes/goalRoutes.ts',
  './backend/src/routes/lifeReviewRoutes.ts',
  './backend/src/routes/reflectionRoutes.ts',
  './backend/src/routes/workPlannerRoutes.ts'
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    content = content.replace(/const \{ id \} = req\.params;/g, "const id = req.params.id as string;");
    content = content.replace(/const \{([^}]*)id([^}]*)\} = req\.params;/g, "const { $1 id, $2 } = req.params as any;");

    fs.writeFileSync(file, content);
}
console.log('Done');
