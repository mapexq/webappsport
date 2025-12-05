/**
 * Финальный скрипт для исправления парсинга времени
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parserPath = path.join(__dirname, 'predictionsParser.js');
let content = fs.readFileSync(parserPath, 'utf8');

let changesCount = 0;

// 1. Исправляем строку 44 - перемещаем timestamp после нахождения карточки
content = content.replace(
  /(\s+if \(text\.includes\(' — '\) && text\.includes\(': прогноз и ставка'\).*?\n\s+)(\/\/ Устанавливаем время по умолчанию\s*\n\s+const timestamp = 'Недавно';\s*\n\s+)(\/\/ Нашли заголовок, ищем родительскую карточку[\s\S]*?const avatar = this\.findAvatar\(\$card, \$\);\s*\n\s+)(\/\/ Проверяем, что это валидный прогноз)/,
  (match, p1, p2, p3, p4) => {
    changesCount++;
    return p1 + p3 + 'const timestamp = this.findTimestamp($card, $) || \'Недавно\';\n          ' + p4;
  }
);

// 2. Исправляем синтаксическую ошибку в publishedAt (лишняя запятая)
content = content.replace(
  /(\s+timestamp: pred\.timestamp \|\| 'Недавно')\s*\n\s*,\s*\n\s+(publishedAt: pred\.timestamp \? parseTimestampToDate\(pred\.timestamp\)\.toISOString\(\) : new Date\(\)\.toISOString\(\))/,
  (match, p1, p2) => {
    changesCount++;
    return p1 + ',\n        publishedAt: (() => {\n          try {\n            if (!pred.timestamp || pred.timestamp === \'Недавно\') {\n              return new Date().toISOString();\n            }\n            const date = parseTimestampToDate(pred.timestamp);\n            if (isNaN(date.getTime())) {\n              console.warn(`Не удалось распарсить время: "${pred.timestamp}"`);\n              return new Date().toISOString();\n            }\n            return date.toISOString();\n          } catch (error) {\n            console.error(`Ошибка при парсинге времени "${pred.timestamp}":`, error);\n            return new Date().toISOString();\n          }\n        })()';
  }
);

fs.writeFileSync(parserPath, content, 'utf8');
console.log(`✅ Исправлено ${changesCount} проблем с парсингом времени`);



