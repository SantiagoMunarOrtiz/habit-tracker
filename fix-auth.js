const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk('./backend/src/routes');

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // For POST endpoints, override req.body.userId
    // Let's just find `const { ... userId ... } = req.body;` and after it, `if (req.user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });`
    
    // Actually, the simplest approach to enforce isolation is to inject a check at the top of EVERY route that uses `:userId` param.
    // If the path contains `/user/:userId`
    content = content.replace(/router\.(get|post|put|patch|delete)\('\/user\/:userId([^']*)',\s*(?:authenticateToken as any,\s*)?async\s*\(req:\s*(?:AuthRequest|any|Request),\s*res:\s*Response\)\s*=>\s*\{/g, (match) => {
        return match + `\n  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });\n`;
    });
    
    content = content.replace(/router\.(get|post|put|patch|delete)\('\/user\/:userId([^']*)',\s*async\s*\(req(.*?),\s*res(.*?)\)\s*=>\s*\{/g, (match, m1, m2, reqArgs, resArgs) => {
        // If we already patched it above, don't duplicate
        if (match.includes('authenticateToken')) return match;
        return match + `\n  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });\n`;
    });

    // What if the route is NOT `/user/:userId`? E.g., `router.post('/', ...)` creating a habit.
    // In these routes, they read `userId` from `req.body`.
    // Let's replace `const { ... } = req.body` containing userId, and then override userId.
    content = content.replace(/const\s+\{([^}]*userId[^}]*)\}\s*=\s*req\.body;/g, (match, vars) => {
        return `${match}\n  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });\n`;
    });

    // What about modifying an existing record by its own ID (e.g. DELETE /habits/:id)?
    // Wait, the routes do things like `prisma.habit.delete({ where: { id: req.params.id } })`.
    // Without checking `userId`, a user can delete another user's habit if they know the ID!
    // To fix this globally, we need to enforce `userId` in the `where` clause.
    content = content.replace(/(prisma\.[a-zA-Z]+\.(update|delete|updateMany|deleteMany|findUnique|findFirst)\({\s*where:\s*\{[^}]*id:\s*req\.params\.(?:[a-zA-Z]+Id|id)([^}]*)\})/g, (match) => {
        if (match.includes('userId')) return match; // Already has it
        return match.replace(/id:\s*req\.params\.(?:[a-zA-Z]+Id|id)/, '$&, userId: (req as any).user?.userId');
    });

    fs.writeFileSync(file, content);
}
console.log('Done');
