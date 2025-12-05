import fs from 'fs';

const content = fs.readFileSync('predictionsParser.js', 'utf8');

// Удаляем дублированный код
const fixed = content.replace(
  /(console\.debug\(`✓ Распарсено время "\${pred\.timestamp}" -> \${date\.toISOString\(\)}`\);\s*return date\.toISOString\(\);)\s*\}\s*\(`✓ Распарсено время "\${pred\.timestamp}" -> \${date\.toISOString\(\)}`\);\s*return date\.toISOString\(\);/,
  '$1'
);

if (fixed !== content) {
  fs.writeFileSync('predictionsParser.js', fixed, 'utf8');
  console.log('✅ Удален дублированный код');
} else {
  // Альтернативный способ - построчная замена
  const lines = content.split('\n');
  let foundDuplicate = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] && lines[i].includes('console.debug') && lines[i].includes('Распарсено время')) {
      // Проверяем следующие строки на дубликат
      if (i + 3 < lines.length && 
          lines[i + 3] && 
          lines[i + 3].includes('Распарсено время')) {
        // Удаляем дубликат
        lines.splice(i + 3, 2); // Удаляем дублированные строки
        foundDuplicate = true;
        console.log(`✅ Удален дубликат на строке ${i + 4}`);
        break;
      }
    }
  }
  
  if (foundDuplicate) {
    fs.writeFileSync('predictionsParser.js', lines.join('\n'), 'utf8');
  } else {
    console.log('⚠️ Дубликат не найден или уже исправлен');
  }
}



