const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        searchDir(fullPath);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('resumes:') || content.includes('initialResumes') || content.includes('version: \'v')) {
          console.log(`Found in file ${fullPath}`);
        }
      }
    }
  }
}

searchDir(path.join(__dirname, '..', 'src'));
