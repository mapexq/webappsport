import fs from 'fs';

const filePath = 'predictionsParser.js';
const lines = fs.readFileSync(filePath, 'utf8').split('\n');
const newLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Пропускаем дубликат строки 37 (const $time)
  if (i === 36 && line.includes('const $time = $(element);')) {
    // Пропускаем эту строку (дубликат)
    continue;
  }
  
  // Заменяем строку с timestamp на строке 37 (после удаления дубликата это будет строка 36)
  if (i === 37 && line.includes("const timestamp = $time.text().trim();")) {
    newLines.push("        const timestamp = this.findTimestamp($time.closest('div'), $) || 'Недавно';");
    continue;
  }
  
  newLines.push(line);
}

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('✅ Дубликат удален и timestamp исправлен!');



