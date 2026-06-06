const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const start = 3884; // 0-indexed line 3885 (where the canvas div opens)
let depth = 0;

for (let i = start; i < 4328; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  
  const tags = line.match(/<\/?div\b[^>]*>/g) || [];
  tags.forEach(tag => {
    if (tag.startsWith('</')) {
      depth--;
      if (depth === 0) {
        console.log(`Line ${lineNum}: Closes outer canvas div - depth ${depth}`);
      }
    } else if (!tag.endsWith('/>')) {
      if (depth === 0) {
        console.log(`Line ${lineNum}: Opens outer canvas div - ${tag}`);
      }
      depth++;
    }
  });
}
