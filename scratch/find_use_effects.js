const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let currentBlock = [];
let inEffect = false;
let startLine = 0;

lines.forEach((line, idx) => {
  if (line.includes('useEffect(')) {
    inEffect = true;
    startLine = idx + 1;
    currentBlock = [line.trim()];
  } else if (inEffect) {
    currentBlock.push(line.trim());
    if (line.includes('}, [') || line.includes('});')) {
      inEffect = false;
      const blockStr = currentBlock.join('\n');
      if (blockStr.includes('localExp') || blockStr.includes('activeResume')) {
        console.log(`Effect starting at line ${startLine}:\n${blockStr}\n`);
      }
    }
  }
});
