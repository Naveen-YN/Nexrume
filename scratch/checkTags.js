const fs = require('fs');

const content = fs.readFileSync('src/app/page.tsx', 'utf8');
const lines = content.split('\n');

let tagStack = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Regex to match XML/HTML tags, ignoring typescript generics
  // e.g. <select, </select>, but not <string>, <any>, <HTMLInputElement>
  const tagRegex = /<\/?([a-zA-Z0-9:-]+)(?:\s+[^>]*?)?>/g;
  let match;
  
  while ((match = tagRegex.exec(line)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    
    // Ignore self-closing tags
    if (fullTag.endsWith('/>')) {
      continue;
    }
    
    // Ignore TypeScript types
    if (['string', 'any', 'HTMLInputElement', 'JobApplication', 'Record', 'number', 'boolean', 'unknown', 'any[]'].includes(tagName)) {
      continue;
    }
    
    // Ignore common self-closing HTML tags
    if (['input', 'img', 'br', 'hr', 'link', 'meta'].includes(tagName.toLowerCase())) {
      continue;
    }
    
    const isClosing = fullTag.startsWith('</');
    
    if (isClosing) {
      if (tagStack.length === 0) {
        console.log(`Extra closing tag </${tagName}> at line ${i + 1}`);
        process.exit(1);
      } else {
        const lastTag = tagStack.pop();
        if (lastTag.name !== tagName) {
          console.log(`Mismatched closing tag: expected </${lastTag.name}> (from line ${lastTag.line}), found </${tagName}> at line ${i + 1}`);
          console.log(`Stack at error:`, tagStack.slice(-5));
          process.exit(1);
        }
      }
    } else {
      tagStack.push({ name: tagName, line: i + 1 });
    }
  }
}

console.log(`Success! All tags are balanced.`);
console.log(`Remaining unclosed tags: ${tagStack.length}`);
