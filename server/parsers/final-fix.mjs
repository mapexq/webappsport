import fs from 'fs';

const content = fs.readFileSync('predictionsParser.js', 'utf8');

// Исправляем проблему: добавляем запятую и правильный отступ
const fixed = content.replace(
  /(\s+timestamp: pred\.timestamp \|\| 'Недавно')\s*\n\s*,publishedAt:/g,
  '$1,\n        publishedAt:'
);

if (fixed !== content) {
  fs.writeFileSync('predictionsParser.js', fixed, 'utf8');
  console.log('✅ Синтаксическая ошибка исправлена');
} else {
  console.log('⚠️ Паттерн не найден, пробуем альтернативный способ...');
  
  // Альтернативный способ - построчная замена
  const lines = content.split('\n');
  let changed = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] && lines[i].includes("timestamp: pred.timestamp || 'Недавно'")) {
      // Убираем пробелы в конце и добавляем запятую
      lines[i] = lines[i].trimRight() + ',';
      
      // Исправляем следующую строку
      if (i + 1 < lines.length && lines[i + 1].trim().startsWith(',publishedAt:')) {
        lines[i + 1] = '        publishedAt: (() => {';
        changed = true;
        console.log(`✅ Исправлены строки ${i + 1}-${i + 2}`);
      }
      break;
    }
  }
  
  if (changed) {
    fs.writeFileSync('predictionsParser.js', lines.join('\n'), 'utf8');
  } else {
    console.log('❌ Не удалось найти и исправить проблему');
  }
}


