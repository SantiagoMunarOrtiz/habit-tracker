const fs = require('fs');

let content = fs.readFileSync('backend/src/routes/reflectionRoutes.ts', 'utf8');
content = content.replace(/const \{ userId, date \} = req\.params;/g, "const { userId, date } = req.params as { userId: string, date: string };");
fs.writeFileSync('backend/src/routes/reflectionRoutes.ts', content);

console.log('Done');
