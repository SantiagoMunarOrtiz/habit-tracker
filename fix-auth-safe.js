const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('./backend/src/routes').map(f => path.join('./backend/src/routes', f));

for (const file of files) {
    if (!file.endsWith('.ts')) continue;
    if (file.includes('authRoutes')) continue;

    let content = fs.readFileSync(file, 'utf8');

    // 1. For routes like router.get('/user/:userId', ...
    content = content.replace(/router\.(get|post|put|patch|delete)\('\/user\/:userId([^']*)',\s*(?:authenticateToken as any,\s*)?async\s*\(req(.*?),\s*res(.*?)\)\s*=>\s*\{/g, (match) => {
        // add isolation
        if (match.includes('Forbidden')) return match;
        return match + `\n  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });\n`;
    });

    // 2. For routes getting userId from body
    // Instead of replacing const { userId } = req.body, we just inject overriding logic
    content = content.replace(/const \{([^}]*)\}\s*=\s*req\.body;/g, (match, inner) => {
        if (inner.includes('userId')) {
            return match + `\n  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });\n`;
        }
        return match;
    });

    // 3. For Prisma queries that use req.params.id to update/delete, we MUST ensure the record belongs to the user.
    // E.g. prisma.habit.update({ where: { id }
    // We can change where: { id } to where: { id, userId: (req as any).user?.userId }
    // BUT we need to be careful with the exact syntax.
    // Easiest is just to replace `where: { id }` or `where: { id: req.params.id }` with `where: { id, userId: (req as any).user?.userId }`
    content = content.replace(/where:\s*\{\s*id\s*\}/g, "where: { id, userId: (req as any).user?.userId }");
    content = content.replace(/where:\s*\{\s*id:\s*req\.params\.id\s*\}/g, "where: { id: req.params.id, userId: (req as any).user?.userId }");
    content = content.replace(/where:\s*\{\s*id:\s*id\s*\}/g, "where: { id: id, userId: (req as any).user?.userId }");

    fs.writeFileSync(file, content);
}
console.log('Done');
