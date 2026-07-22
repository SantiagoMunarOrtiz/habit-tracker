const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('./backend/src/routes').map(f => path.join('./backend/src/routes', f));

for (const file of files) {
    if (!file.endsWith('.ts')) continue;
    if (file.includes('authRoutes')) continue;

    let content = fs.readFileSync(file, 'utf8');

    // 1. For routes like router.get('/user/:userId', ...
    content = content.replace(/router\.(get|post|put|patch|delete)\('\/user\/:userId([^']*)',\s*(?:authenticateToken as any,\s*)?async\s*\(req(.*?),\s*res(.*?)\)\s*=>\s*\{/g, (match) => {
        if (match.includes('Forbidden')) return match;
        return match + `\n  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });\n`;
    });

    // 2. For routes getting userId from body
    content = content.replace(/const \{([^}]*)\}\s*=\s*req\.body;/g, (match, inner) => {
        if (inner.includes('userId')) {
            return match + `\n  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });\n`;
        }
        return match;
    });

    fs.writeFileSync(file, content);
}
console.log('Done');
