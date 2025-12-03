/**
 * Точные исправления
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parserPath = path.join(__dirname, 'predictionsParser.js');
let lines = fs.readFileSync(parserPath, 'utf8').split('\n');

// Удаляем строку 44 (индекс 43) - const timestamp = 'Недавно';
if (lines[43] && lines[43].includes("const timestamp = 'Недавно';")) {
  // Удаляем строку и предыдущий комментарий если есть
  if (lines[42] && lines[42].includes('Устанавливаем время по умолчанию')) {
    lines.splice(42, 2); // Удаляем комментарий и строку
  } else {
    lines.splice(43, 1); // Удаляем только строку
  }
  console.log('✓ Удалена строка 44 с const timestamp = \'Недавно\'');
}

// Исправляем строку с publishedAt (ищем строку с timestamp)
for (let i = 0; i < lines.length; i++) {
  if (lines[i] && lines[i].includes("timestamp: pred.timestamp || 'Недавно'")) {
    // Следующая строка должна быть с publishedAt
    if (i + 1 < lines.length && lines[i + 1].includes(',publishedAt:')) {
      lines[i + 1] = lines[i + 1].replace(',publishedAt:', ',\n        publishedAt:');
      console.log('✓ Исправлена строка с publishedAt');
    }
    break;
  }
}

fs.writeFileSync(parserPath, lines.join('\n'), 'utf8');
console.log('✅ Все исправления применены');

