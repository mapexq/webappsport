import fs from 'fs';

let content = fs.readFileSync('predictionsParser.js', 'utf8');

// Ищем точный паттерн - timestamp на одной строке, publishedAt на следующей
// Пробуем разные варианты
const patterns = [
  // Вариант 1: с переносом строки
  /(\s+timestamp: pred\.timestamp \|\| 'Недавно')\s*\n\s*,publishedAt:/,
  // Вариант 2: без переноса (все на одной строке после замены)
  /(\s+timestamp: pred\.timestamp \|\| 'Недавно')\s*,publishedAt:/,
  // Вариант 3: с любыми пробелами
  /timestamp: pred\.timestamp \|\| 'Недавно'[\s]*,publishedAt:/,
];

let fixed = false;
for (const pattern of patterns) {
  if (pattern.test(content)) {
    content = content.replace(
      pattern,
      "$1,\n        publishedAt:"
    );
    fixed = true;
    console.log('✅ Исправлено паттерном:', pattern.toString().substring(0, 50));
    break;
  }
}

if (!fixed) {
  // Альтернативный способ - построчная замена
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] && lines[i].includes("timestamp: pred.timestamp || 'Недавно'")) {
      // Убираем пробелы в конце и добавляем запятую
      const trimmed = lines[i].trimEnd();
      if (!trimmed.endsWith(',')) {
        lines[i] = trimmed + ',';
      }
      
      // Ищем следующую строку с publishedAt
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        if (lines[j] && lines[j].trim().startsWith(',publishedAt:')) {
          lines[j] = '        publishedAt: (() => {';
          fixed = true;
          console.log(`✅ Исправлены строки ${i + 1} и ${j + 1}`);
          break;
        }
      }
      break;
    }
  }
  
  if (fixed) {
    content = lines.join('\n');
  }
}

if (fixed) {
  fs.writeFileSync('predictionsParser.js', content, 'utf8');
  console.log('✅ Файл сохранен');
} else {
  console.log('❌ Не удалось исправить. Показываю проблемную область:');
  const idx = content.indexOf("timestamp: pred.timestamp");
  if (idx > 0) {
    const snippet = content.substring(Math.max(0, idx - 5), idx + 150);
    console.log(snippet.split('\n').map((l, i) => `${i}: ${l}`).join('\n'));
  }
}

