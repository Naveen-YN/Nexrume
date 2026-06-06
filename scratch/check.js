const fs = require('fs');

const content = fs.readFileSync('src/app/page.tsx', 'utf8');
const lines = content.split('\n');

let openBraces = [];
let openParens = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Ignore simple checks inside comments or strings for now, just count chars
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '{') {
      openBraces.push({ line: i + 1, col: j + 1 });
    } else if (char === '}') {
      if (openBraces.length === 0) {
        console.log(`Extra closing brace at line ${i + 1}, col ${j + 1}`);
      } else {
        openBraces.pop();
      }
    } else if (char === '(') {
      openParens.push({ line: i + 1, col: j + 1 });
    } else if (char === ')') {
      if (openParens.length === 0) {
        console.log(`Extra closing paren at line ${i + 1}, col ${j + 1}`);
      } else {
        openParens.pop();
      }
    }
  }
}

console.log(`Remaining unclosed braces: ${openBraces.length}`);
if (openBraces.length > 0) {
  console.log('Last unclosed braces:', openBraces.slice(-5));
}
console.log(`Remaining unclosed parens: ${openParens.length}`);
if (openParens.length > 0) {
  console.log('Last unclosed parens:', openParens.slice(-5));
}
