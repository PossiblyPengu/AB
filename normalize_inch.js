const fs = require('fs');
const path = 'dictionaries.js';
let text = fs.readFileSync(path, 'utf8');
const replacements = [
  { pattern: /(\d[\d./]*)\s+IN\b(?!\s*\d)(?!\.)/g, replace: '$1 in.' },
  { pattern: /(\d[\d./]*)IN\b(?!\s*\d)(?!\.)/g, replace: '$1 in.' },
  { pattern: /(\d[\d./]*)\s+in\b(?!\s*\d)(?!\.)/g, replace: '$1 in.' },
  { pattern: /(\d[\d./]*)in\b(?!\s*\d)(?!\.)/g, replace: '$1 in.' }
];
replacements.forEach(({pattern, replace}) => {
  text = text.replace(pattern, replace);
});
fs.writeFileSync(path, text, 'utf8');
