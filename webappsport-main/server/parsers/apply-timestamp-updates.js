/**
 * Скрипт для автоматического применения изменений в predictionsParser.js
 * Запуск: node server/parsers/apply-timestamp-updates.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parserPath = path.join(__dirname, 'predictionsParser.js');
let content = fs.readFileSync(parserPath, 'utf8');

// 1. Добавить импорт утилит
if (!content.includes('timestampUtils')) {
  content = content.replace(
    "import * as cheerio from 'cheerio';",
    "import * as cheerio from 'cheerio';\nimport { findTimestampInCard, parseTimestampToDate } from './timestampUtils.js';"
  );
  console.log('✓ Добавлен импорт timestampUtils');
}

// 2. Обновить метод findTimestamp
if (content.includes("findTimestamp($card, $) {\n    return 'Недавно';\n  }")) {
  content = content.replace(
    "findTimestamp($card, $) {\n    return 'Недавно';\n  }",
    "findTimestamp($card, $) {\n    return findTimestampInCard($card, $);\n  }"
  );
  console.log('✓ Обновлен метод findTimestamp');
}

// 3. Обновить все места, где timestamp = 'Недавно' (в контексте карточки)
// Заменяем только те, где есть доступ к $card
const timestampPattern = /const timestamp = 'Недавно';/g;
let matchCount = 0;
content = content.replace(/const timestamp = 'Недавно';/g, (match, offset) => {
  // Проверяем, что это в контексте, где есть $card
  const before = content.substring(Math.max(0, offset - 200), offset);
  if (before.includes('$card') || before.includes('findTimestamp')) {
    matchCount++;
    return "const timestamp = this.findTimestamp($card, $) || 'Недавно';";
  }
  return match;
});
if (matchCount > 0) {
  console.log(`✓ Обновлено ${matchCount} мест с timestamp = 'Недавно'`);
}

// 4. Обновить formatPredictions для добавления publishedAt
if (content.includes("timestamp: pred.timestamp || 'Недавно'") && 
    !content.includes('publishedAt:')) {
  content = content.replace(
    /(\s+timestamp: pred\.timestamp \|\| 'Недавно'\s*)/,
    `$1\n        publishedAt: pred.timestamp ? parseTimestampToDate(pred.timestamp).toISOString() : new Date().toISOString(),`
  );
  console.log('✓ Добавлено поле publishedAt в formatPredictions');
}

// Сохранить изменения
fs.writeFileSync(parserPath, content, 'utf8');
console.log('\n✅ Все изменения применены успешно!');
console.log('Теперь перезапустите backend сервер.');

