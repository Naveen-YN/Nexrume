const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('col-span-') || line.includes('grid-cols-')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
