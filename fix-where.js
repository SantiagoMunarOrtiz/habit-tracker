const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('./backend/src/routes').map(f => path.join('./backend/src/routes', f));

for (const file of files) {
    if (!file.endsWith('.ts')) continue;

    let content = fs.readFileSync(file, 'utf8');

    // Remove `, userId: (req as any).user?.userId`
    content = content.replace(/,\s*userId:\s*\(req\s*as\s*any\)\.user\?\.userId/g, "");

    fs.writeFileSync(file, content);
}
console.log('Done');
