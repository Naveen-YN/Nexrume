const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const start = 4329; // 0-indexed line 4330
const end = 4605;   // 0-indexed line 4606

let depth = 0;
for (let i = start; i < end; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  
  // Look for <div> and </div>
  const tags = line.match(/<\/?div\b[^>]*>/g) || [];
  tags.forEach(tag => {
    if (tag.startsWith('</')) {
      depth--;
      console.log(`Line ${lineNum}: Closes div (depth ${depth})`);
    } else if (!tag.endsWith('/>')) {
      console.log(`Line ${lineNum}: Opens div (depth ${depth}) - ${tag}`);
      depth++;
    }
  });
}

console.log('Final depth:', depth);
