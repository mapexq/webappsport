import fs from 'fs';

const content = fs.readFileSync('predictionsParser.js', 'utf8');

// Простая замена проблемной конструкции
const result = content.replace(
  /timestamp: pred\.timestamp \|\| 'Недавно'\s*\n\s*,publishedAt:/,
  "timestamp: pred.timestamp || 'Недавно',\n        publishedAt:"
);

if (result !== content) {
  fs.writeFileSync('predictionsParser.js', result, 'utf8');
  console.log('✅ Исправлено!');
  
  // Проверяем результат
  const check = result.match(/timestamp: pred\.timestamp \|\| 'Недавно'[\s\S]{0,50}publishedAt:/);
  if (check) {
    console.log('Проверка: исправление применено');
  }
} else {
  console.log('❌ Паттерн не найден');
  // Показываем что есть вокруг timestamp
  const idx = content.indexOf("timestamp: pred.timestamp");
  if (idx > 0) {
    console.log('Найдено вокруг timestamp:');
    console.log(content.substring(idx - 10, idx + 100).replace(/\n/g, '\\n'));
  }
}

