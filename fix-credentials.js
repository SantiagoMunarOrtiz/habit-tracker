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
            if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk('./frontend/src');

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace fetch(url, { ... }) with fetch(url, { credentials: 'include', ... })
    // If it has method:, headers:, etc., we can inject credentials: 'include'
    
    // For every `fetch(..., {` we replace it with `fetch(..., { credentials: 'include',`
    content = content.replace(/fetch\(([^,]+),\s*\{/g, "fetch($1, { credentials: 'include',");
    
    // Remove the /* Auth */ comments
    content = content.replace(/\/\* Auth \*\//g, "");

    // Also some fetches in Analytics might just be `fetch(url, { headers })`
    // We already added credentials: 'include' inside the `{`

    // Remove empty headers blocks left behind
    content = content.replace(/headers:\s*\{\s*\},?/g, "");

    fs.writeFileSync(file, content);
}
console.log('Done');
