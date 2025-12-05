/**
 * Финальные исправления
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parserPath = path.join(__dirname, 'predictionsParser.js');
let content = fs.readFileSync(parserPath, 'utf8');

// 1. Удаляем строку 44 с const timestamp = 'Недавно' (она дублируется в строке 73)
content = content.replace(
  /(\s+if \(text\.includes\(' — '\) && text\.includes\(': прогноз и ставка'\).*?\n\s+)(\/\/ Устанавливаем время по умолчанию\s*\n\s+const timestamp = 'Недавно';\s*\n\s+)(\/\/ Нашли заголовок)/,
  '$1$3'
);

// 2. Исправляем синтаксическую ошибку в publishedAt (добавляем запятую и пробел)
content = content.replace(
  /(\s+timestamp: pred\.timestamp \|\| 'Недавно')\s*\n\s*,publishedAt:/,
  '$1,\n        publishedAt:'
);

fs.writeFileSync(parserPath, content, 'utf8');
console.log('✅ Исправлены финальные проблемы');



