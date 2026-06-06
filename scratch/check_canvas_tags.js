const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const start = 3884; // 0-indexed line 3885
const end = 4242;   // 0-indexed line 4243

let stack = [];
const voidTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'col'];

for (let i = start; i < end; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  
  // Find tags
  const tagRegex = /<\/?([a-zA-Z0-9:-]+)(?:\s+[^>]*?)?(\/?)>/g;
  let match;
  while ((match = tagRegex.exec(line)) !== null) {
    const tagName = match[1];
    const isClosing = match[0].startsWith('</');
    const isSelfClosing = match[0].endsWith('/>') || match[2] === '/';
    
    // Ignore custom elements or react fragments or void tags
    if (voidTags.includes(tagName.toLowerCase()) || isSelfClosing || tagName === 'React.Fragment' || tagName.startsWith('s.')) {
      continue;
    }
    
    if (isClosing) {
      if (stack.length === 0) {
        console.log(`Extra close tag </${tagName}> at line ${lineNum}`);
      } else {
        const top = stack.pop();
        if (top.name !== tagName) {
          console.log(`Mismatch at line ${lineNum}: closed </${tagName}> but top was <${top.name}> from line ${top.lineNum}`);
          // Put back top to continue checking
          stack.push(top);
        }
      }
    } else {
      stack.push({ name: tagName, lineNum });
    }
  }
}

console.log('Unclosed tags in canvas:', stack);
