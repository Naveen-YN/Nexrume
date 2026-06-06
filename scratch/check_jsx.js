const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// A cleaner parser that strips out all comments, strings (including multi-line template literals), and regex literals
function getBracesDiff(text) {
  let clean = '';
  let i = 0;
  while (i < text.length) {
    // 1. Skip single-line comment
    if (text[i] === '/' && text[i+1] === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    // 2. Skip multi-line comment
    if (text[i] === '/' && text[i+1] === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i+1] === '/')) i++;
      i += 2;
      continue;
    }
    // 3. Skip template literal
    if (text[i] === '`') {
      i++;
      while (i < text.length && text[i] !== '`') {
        if (text[i] === '\\') i += 2;
        else i++;
      }
      i++;
      continue;
    }
    // 4. Skip double-quoted string
    if (text[i] === '"') {
      i++;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === '\\') i += 2;
        else i++;
      }
      i++;
      continue;
    }
    // 5. Skip single-quoted string
    if (text[i] === "'") {
      i++;
      while (i < text.length && text[i] !== "'") {
        if (text[i] === '\\') i += 2;
        else i++;
      }
      i++;
      continue;
    }
    // 6. Keep brace/parenthesis characters
    const c = text[i];
    if (c === '{' || c === '}' || c === '(' || c === ')') {
      clean += c;
    }
    i++;
  }
  return clean;
}

function checkTabBrackets(name, startLine, endLine) {
  const lines = content.split('\n');
  const slice = lines.slice(startLine - 1, endLine).join('\n');
  const clean = getBracesDiff(slice);
  
  let stack = [];
  for (let idx = 0; idx < clean.length; idx++) {
    const char = clean[idx];
    if (char === '{' || char === '(') {
      stack.push({ char, idx });
    } else {
      const matchChar = char === '}' ? '{' : '(';
      if (stack.length > 0 && stack[stack.length - 1].char === matchChar) {
        stack.pop();
      } else {
        stack.push({ char, idx });
      }
    }
  }
  console.log(`=== ${name} (Lines ${startLine} - ${endLine}) ===`);
  console.log('Unmatched elements in stack:', stack);
}

checkTabBrackets('Dashboard', 1142, 1419);
checkTabBrackets('Tracker', 1420, 2650);
checkTabBrackets('Resumes', 2651, 4328);
checkTabBrackets('Settings', 4329, 4605);
