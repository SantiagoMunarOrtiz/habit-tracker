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
    
    // Remove token assignment lines
    content = content.replace(/const token = localStorage\.getItem\('token'\);\n\s*/g, '');
    content = content.replace(/const token = localStorage\.getItem\('token'\) \|\| '';\n\s*/g, '');

    // Replace headers containing Authorization with credentials: 'include'
    // Case 1: Just Authorization
    content = content.replace(/headers:\s*{\s*'Authorization':\s*`Bearer \$\{?[^`}]*\}?`\s*}/g, "credentials: 'include'");
    
    // Case 2: Content-Type and Authorization
    content = content.replace(/'Authorization':\s*`Bearer \$\{?[^`}]*\}?`/g, "/* Auth */");
    
    // Sometimes it's on a new line and leaves a trailing comma or something, but let's be careful.
    // Instead of complex regex, let's just do a simpler replacement for the entire fetch call block if possible.
    
    // Better regex for the specific lines:
    content = content.replace(/,\s*'Authorization':\s*`Bearer [^`]*`/g, "");
    content = content.replace(/'Authorization':\s*`Bearer [^`]*`\s*,?/g, "");

    // Now, every fetch needs credentials: 'include'. 
    // We can just add it to all fetch options.
    // Actually, instead of regexing all fetches, let's just use regex to insert `credentials: 'include'` where headers are defined.
    // This is hard to get right with regex.
    fs.writeFileSync(file, content);
}
console.log('Done');
