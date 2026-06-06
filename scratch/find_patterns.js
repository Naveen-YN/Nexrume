const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const patterns = [
  /activeTab\s*===/g,
  /activeTab\s*&&/g,
  /resumeSubTab/g,
  /showEditJobModal/g,
  /<\/main>/g
];

lines.forEach((line, index) => {
  patterns.forEach(pattern => {
    if (line.match(pattern)) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  });
});
