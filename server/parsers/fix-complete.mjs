import fs from 'fs';

const filePath = 'predictionsParser.js';
let content = fs.readFileSync(filePath, 'utf8');

// Заменяем проблемную конструкцию
const oldPattern = /(\s+timestamp: pred\.timestamp \|\| 'Недавно')\s*\n\s*,publishedAt: \(\(\) => \{/;
const newText = "$1,\n        publishedAt: (() => {";

if (oldPattern.test(content)) {
  content = content.replace(oldPattern, newText);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Исправлено');
  
  // Проверяем результат
  const check = content.match(/(\s+timestamp: pred\.timestamp \|\| 'Недавно')\s*\n\s*(publishedAt:)/);
  if (check) {
    console.log('Проверка: исправление применено');
    console.log('Найдено:', check[0].substring(0, 80));
  } else {
    console.log('Проверка: паттерн не найден после исправления');
  }
} else {
  console.log('Паттерн не найден. Ищем альтернативный...');
  // Пробуем найти любую строку с timestamp и publishedAt рядом
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("timestamp: pred.timestamp") && 
        i + 1 < lines.length && 
        lines[i + 1].trim().startsWith(',publishedAt:')) {
      console.log(`Найдено на строке ${i + 1}:`);
      console.log('  ' + JSON.stringify(lines[i]));
      console.log('  ' + JSON.stringify(lines[i + 1]));
      
      // Исправляем
      lines[i] = lines[i].trim() + ',';
      lines[i + 1] = '        publishedAt: (() => {';
      
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      console.log('✅ Исправлено построчно');
      break;
    }
  }
}


