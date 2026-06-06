const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// We want to find tags in the content. Let's do a char-by-char scan to properly skip:
// - comments: //, /* */, and {/* */}
// - string literals: "", '', ``
// - JSX expressions: we need to trace tags inside/outside JSX

const lines = content.split('\n');
function getLineNum(index) {
  let chars = 0;
  for (let i = 0; i < lines.length; i++) {
    if (chars + lines[i].length + 1 > index) {
      return i + 1;
    }
    chars += lines[i].length + 1;
  }
  return lines.length;
}

let i = 0;
let stack = [];
const voidTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'col'];

while (i < content.length) {
  // 1. Skip single-line comment
  if (content[i] === '/' && content[i+1] === '/') {
    while (i < content.length && content[i] !== '\n') i++;
    continue;
  }
  
  // 2. Skip multi-line comment or JSX comment
  if (content[i] === '/' && content[i+1] === '*') {
    i += 2;
    while (i < content.length && !(content[i] === '*' && content[i+1] === '/')) i++;
    i += 2;
    continue;
  }
  
  // 3. Skip JSX comment: {/* ... */}
  if (content[i] === '{' && content[i+1] === '/' && content[i+2] === '*') {
    i += 3;
    while (i < content.length && !(content[i] === '*' && content[i+1] === '/' && content[i+2] === '}')) i++;
    i += 3;
    continue;
  }

  // 4. Skip string/template literal
  if (content[i] === '"' || content[i] === "'" || content[i] === '`') {
    const quote = content[i];
    i++;
    while (i < content.length && content[i] !== quote) {
      if (content[i] === '\\') i += 2;
      else i++;
    }
    i++;
    continue;
  }

  // 5. Look for tag
  if (content[i] === '<') {
    // Check if it is a comment, or generic, or comparison (e.g. < 85, <= 1)
    // If it's followed by a space, digit, or equals, it's a comparison
    const nextChar = content[i+1];
    if (nextChar === ' ' || nextChar === '=' || (nextChar >= '0' && nextChar <= '9') || nextChar === '\n') {
      i++;
      continue;
    }
    
    // Check if it's a closing tag
    const isClosing = nextChar === '/';
    const tagStartIndex = i;
    
    // Find the end of the tag '>'
    i++;
    while (i < content.length && content[i] !== '>') {
      // Handle strings inside tag attributes
      if (content[i] === '"' || content[i] === "'") {
        const q = content[i];
        i++;
        while (i < content.length && content[i] !== q) i++;
      }
      i++;
    }
    
    const tagContent = content.substring(tagStartIndex, i + 1);
    const match = tagContent.match(/^<\/?([a-zA-Z0-9.:_-]+)/);
    if (!match) {
      i++;
      continue;
    }
    
    const tagName = match[1];
    const isSelfClosing = tagContent.endsWith('/>') || voidTags.includes(tagName.toLowerCase());

    // Ignore React components with dot-notation like React.Fragment or custom TS types like keyof / number / string
    const isCapitalized = tagName[0] === tagName[0].toUpperCase();
    const isTsType = ['string', 'number', 'any', 'boolean', 'HTMLInputElement'].includes(tagName);
    
    if (isSelfClosing || isTsType || tagName === 'React.Fragment') {
      i++;
      continue;
    }

    const lineNum = getLineNum(tagStartIndex);
    
    if (isClosing) {
      if (stack.length === 0) {
        console.log(`Extra close tag </${tagName}> at line ${lineNum}`);
      } else {
        const top = stack.pop();
        if (top.name !== tagName) {
          console.log(`Mismatch at line ${lineNum}: closed </${tagName}> but top was <${top.name}> from line ${top.lineNum}`);
          stack.push(top); // push back to preserve hierarchy
        }
      }
    } else {
      stack.push({ name: tagName, lineNum });
    }
  }
  
  i++;
}

console.log('Unclosed tags remaining in stack:', stack.length);
stack.forEach(t => {
  console.log(`  <${t.name}> at line ${t.lineNum}`);
});
