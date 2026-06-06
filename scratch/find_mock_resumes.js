const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'db', 'mockData.ts');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let printLines = false;
let count = 0;

lines.forEach((line, idx) => {
  if (line.includes('export const initialResumes') || line.includes('initialResumes:')) {
    printLines = true;
  }
  if (printLines) {
    console.log(`Line ${idx + 1}: ${line}`);
    count++;
    if (count > 80) printLines = false;
  }
});
