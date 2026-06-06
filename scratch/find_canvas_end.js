const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let start = 3885; // 0-indexed line 3886
let depth = 0;

for (let i = start; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  
  // Look for <div> and </div>
  const tags = line.match(/<\/?div\b[^>]*>/g) || [];
  tags.forEach(tag => {
    if (tag.startsWith('</')) {
      depth--;
      if (depth === 0) {
        console.log(`Line ${lineNum}: Closes canvas div - depth is ${depth}`);
      }
    } else if (!tag.endsWith('/>')) {
      if (depth === 0) {
        console.log(`Line ${lineNum}: Opens canvas div - ${tag}`);
      }
      depth++;
    }
  });
  if (depth === 0 && line.includes('</div>')) {
    console.log(`Canvas ends around line ${lineNum}`);
    break;
  }
}
