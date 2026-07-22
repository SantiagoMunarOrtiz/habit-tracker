const fs = require('fs');

let content = fs.readFileSync('frontend/src/App.tsx', 'utf8');

content = content.replace(/const handleLogin = \(token: string, userData: User\) => \{/g, "const handleLogin = (userData: User) => {");

fs.writeFileSync('frontend/src/App.tsx', content);

console.log('Done');
