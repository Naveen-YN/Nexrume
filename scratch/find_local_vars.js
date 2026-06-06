const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const searchTerms = ['localExp', 'localEdu', 'localProj', 'formatExperience', 'formatEducation', 'formatProjects'];

lines.forEach((line, idx) => {
  searchTerms.forEach(term => {
    if (line.includes(term)) {
      console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
  });
});
