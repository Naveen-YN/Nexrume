const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

function getBracesDiff(text) {
  let clean = '';
  let i = 0;
  while (i < text.length) {
    if (text[i] === '/' && text[i+1] === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    if (text[i] === '/' && text[i+1] === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i+1] === '/')) i++;
      i += 2;
      continue;
    }
    if (text[i] === '`') {
      i++;
      while (i < text.length && text[i] !== '`') {
        if (text[i] === '\\') i += 2;
        else i++;
      }
      i++;
      continue;
    }
    if (text[i] === '"') {
      i++;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === '\\') i += 2;
        else i++;
      }
      i++;
      continue;
    }
    if (text[i] === "'") {
      i++;
      while (i < text.length && text[i] !== "'") {
        if (text[i] === '\\') i += 2;
        else i++;
      }
      i++;
      continue;
    }
    const c = text[i];
    if (c === '{' || c === '}' || c === '(' || c === ')') {
      clean += c;
    }
    i++;
  }
  return clean;
}

function checkRange(name, startLine, endLine) {
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

// Find line numbers of tabs
let dashboardLine = 0;
let trackerLine = 0;
let resumesLine = 0;
let settingsLine = 0;
let mainCloseLine = 0;

lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  if (line.includes("activeTab === 'dashboard'")) dashboardLine = lineNum;
  else if (line.includes("activeTab === 'tracker'")) trackerLine = lineNum;
  else if (line.includes("activeTab === 'resumes'")) resumesLine = lineNum;
  else if (line.includes("activeTab === 'settings'")) settingsLine = lineNum;
  else if (line.includes("</main>")) mainCloseLine = lineNum;
});

checkRange('Dashboard', dashboardLine, trackerLine - 1);
checkRange('Tracker', trackerLine, resumesLine - 1);
checkRange('Resumes', resumesLine, settingsLine - 1);
checkRange('Settings', settingsLine, mainCloseLine - 1);
