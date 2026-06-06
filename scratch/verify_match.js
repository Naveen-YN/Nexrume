const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const targetStart = `bg-white text-zinc-900 shadow-2xl transition-all duration-300 select-text w-full max-w-[21cm] mx-auto min-h-[29.7cm] flex flex-col justify-between border border-zinc-200 text-left p-8 sm:p-12`;
const targetEnd = `                        })()}`;

let startLine = -1;
let endLine = -1;

lines.forEach((line, idx) => {
  if (line.includes(targetStart)) {
    startLine = idx + 1;
  }
  if (startLine !== -1 && idx > startLine && line.includes(targetEnd)) {
    endLine = idx + 1;
  }
});

console.log(`startLine: ${startLine}, endLine: ${endLine}`);
