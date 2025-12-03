import fs from 'fs';

let content = fs.readFileSync('predictionsParser.js', 'utf8');

// Ищем и исправляем конкретный паттерн
const pattern = /(\s+timestamp: pred\.timestamp \|\| 'Недавно')\s*\n\s*,publishedAt: \(\(\) => \{/;

if (pattern.test(content)) {
  content = content.replace(
    pattern,
    "$1,\n        publishedAt: (() => {"
  );
  fs.writeFileSync('predictionsParser.js', content, 'utf8');
  console.log('✅ Исправлено по содержимому');
} else {
  console.log('Паттерн не найден. Ищем альтернативный...');
  // Альтернативный поиск
  const altPattern = /timestamp: pred\.timestamp \|\| 'Недавно'[\s\S]{1,50},publishedAt:/;
  if (altPattern.test(content)) {
    content = content.replace(
      /(timestamp: pred\.timestamp \|\| 'Недавно')\s*\n\s*,publishedAt:/,
      "$1,\n        publishedAt:"
    );
    fs.writeFileSync('predictionsParser.js', content, 'utf8');
    console.log('✅ Исправлено альтернативным способом');
  } else {
    console.log('Паттерн не найден. Содержимое вокруг timestamp:');
    const idx = content.indexOf("timestamp: pred.timestamp");
    if (idx > 0) {
      console.log(content.substring(idx - 20, idx + 100));
    }
  }
}

