import fs from 'fs';
const content = fs.readFileSync('parsers/predictionsParser.js', 'utf8');
const fixed = content.replace(
  /(\s+timestamp: pred\.timestamp \|\| 'Недавно')\s*\n\s*,publishedAt:/,
  '$1,\n        publishedAt:'
);
fs.writeFileSync('parsers/predictionsParser.js', fixed, 'utf8');
console.log('✅ Исправлено');


