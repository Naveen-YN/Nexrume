const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// Simplistic parser for HTML/JSX tags
const tagRegex = /<\/?([a-zA-Z0-9:-]+)(?:\s+[^>]*?)?(\/?)>/g;

let match;
let stack = [];

// Let's split content into lines so we can track line numbers
const lines = content.split('\n');

function getLineAndCol(index) {
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    if (count + lines[i].length + 1 > index) {
      return { line: i + 1, col: index - count + 1 };
    }
    count += lines[i].length + 1;
  }
  return { line: -1, col: -1 };
}

// Ignore comments and script style contents
const cleanContent = content
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '') // Remove JSX comments
  .replace(/<!--[\s\S]*?-->/g, '')      // Remove HTML comments
  .replace(/`[\s\S]*?`/g, '""');         // Remove backticks content to avoid parsing CSS rules as tags

while ((match = tagRegex.exec(cleanContent)) !== null) {
  const fullTag = match[0];
  const tagName = match[1];
  const isClosing = fullTag.startsWith('</');
  const isSelfClosing = fullTag.endsWith('/>') || match[2] === '/';
  
  // Ignore self-closing or common void tags in standard React
  const voidTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'col'];
  if (voidTags.includes(tagName.toLowerCase()) || isSelfClosing) {
    continue;
  }
  
  const { line } = getLineAndCol(match.index);

  if (isClosing) {
    if (stack.length === 0) {
      console.log(`Unexpected closing tag </${tagName}> at line ${line}`);
    } else {
      const top = stack.pop();
      if (top.name !== tagName) {
        console.log(`Mismatch: open <${top.name}> at line ${top.line} closed by </${tagName}> at line ${line}`);
      }
    }
  } else {
    stack.push({ name: tagName, line });
  }
}

console.log('Unclosed tags remaining in stack:', stack.length);
stack.forEach(t => {
  console.log(`  <${t.name}> at line ${t.line}`);
});
