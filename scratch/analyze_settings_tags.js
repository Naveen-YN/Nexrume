const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const startLine = 4329;
const endLine = 4606;

let tagStack = [];
const voidTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'col'];

for (let i = startLine - 1; i < endLine; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  
  // Find tags
  const tagRegex = /<\/?([a-zA-Z0-9:-]+)(?:\s+[^>]*?)?(\/?)>/g;
  let match;
  while ((match = tagRegex.exec(line)) !== null) {
    const tagName = match[1];
    const isClosing = match[0].startsWith('</');
    const isSelfClosing = match[0].endsWith('/>') || match[2] === '/';
    
    if (voidTags.includes(tagName.toLowerCase()) || isSelfClosing) continue;
    
    if (isClosing) {
      if (tagStack.length === 0) {
        console.log(`Extra close tag </${tagName}> at line ${lineNum}`);
      } else {
        const top = tagStack.pop();
        if (top.name !== tagName) {
          console.log(`Mismatch at line ${lineNum}: closed </${tagName}> but top was <${top.name}> from line ${top.lineNum}`);
        }
      }
    } else {
      tagStack.push({ name: tagName, lineNum });
    }
  }
}

console.log('Unclosed tags at end:', tagStack);
