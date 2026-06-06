const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Analyze between line 2651 and line 4329 (0-indexed: 2650 to 4328)
const blockStart = 2650;
const blockEnd = 4329;

let openBrackets = []; // holds { char and line index
let openParents = [];  // holds ( char and line index
let openTags = [];     // holds HTML tags

for (let i = blockStart; i < blockEnd; i++) {
  const line = lines[i];
  const lineNum = i + 1;

  // Very simple tokenization of tags and braces
  let inString = false;
  let quoteChar = '';
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    
    // ignore characters inside backticks or quotes simple implementation
    if ((char === '"' || char === "'" || char === '`') && line[j-1] !== '\\') {
      if (!inString) {
        inString = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inString = false;
      }
      continue;
    }
    
    if (inString) continue;

    if (char === '{') {
      openBrackets.push({ char, lineNum, pos: j });
    } else if (char === '}') {
      if (openBrackets.length === 0) {
        console.log(`Unmatched } at line ${lineNum}:${j}`);
      } else {
        openBrackets.pop();
      }
    } else if (char === '(') {
      openParents.push({ char, lineNum, pos: j });
    } else if (char === ')') {
      if (openParents.length === 0) {
        console.log(`Unmatched ) at line ${lineNum}:${j}`);
      } else {
        openParents.pop();
      }
    }
  }
}

console.log('Unclosed Brackets:', openBrackets);
console.log('Unclosed Parentheses:', openParents);
