const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const start = 3381;
const end = 3737;

for (let i = start; i < end; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
