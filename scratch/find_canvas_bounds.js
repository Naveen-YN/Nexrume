const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let start = -1;
let end = -1;

lines.forEach((line, idx) => {
  if (line.includes('id="resume-print-canvas"')) {
    start = idx + 1;
  }
  if (start !== -1 && idx > start && line.includes('})()}')) {
    end = idx + 1;
  }
});

console.log(`Start Line: ${start}, End Line: ${end}`);
for (let i = start - 2; i <= start + 5; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
for (let i = end - 5; i <= end + 2; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
