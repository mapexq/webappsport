/**
 * Исправление строки 44 - перемещение timestamp после нахождения карточки
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parserPath = path.join(__dirname, 'predictionsParser.js');
let content = fs.readFileSync(parserPath, 'utf8');

// Удаляем строку с timestamp = 'Недавно' перед поиском карточки
content = content.replace(
  /(\s+if \(text\.includes\(' — '\) && text\.includes\(': прогноз и ставка'\).*?\n\s+)(\/\/ Устанавливаем время по умолчанию\s*\n\s+const timestamp = 'Недавно';\s*\n\s+)(\/\/ Нашли заголовок)/,
  '$1$3'
);

// Добавляем timestamp после findAvatar
content = content.replace(
  /(const avatar = this\.findAvatar\(\$card, \$\);\s*\n\s+)(\/\/ Проверяем, что это валидный прогноз)/,
  '$1const timestamp = this.findTimestamp($card, $) || \'Недавно\';\n          $2'
);

// Исправляем синтаксическую ошибку в publishedAt
content = content.replace(
  /(\s+timestamp: pred\.timestamp \|\| 'Недавно')\s*\n\s*,\s*\n\s+(publishedAt:)/,
  '$1,\n        $2'
);

// Улучшаем обработку publishedAt с try-catch
content = content.replace(
  /(\s+publishedAt: pred\.timestamp \? parseTimestampToDate\(pred\.timestamp\)\.toISOString\(\) : new Date\(\)\.toISOString\(\))/,
  `publishedAt: (() => {
          try {
            if (!pred.timestamp || pred.timestamp === 'Недавно') {
              return new Date().toISOString();
            }
            const date = parseTimestampToDate(pred.timestamp);
            if (isNaN(date.getTime())) {
              console.warn(\`Не удалось распарсить время: "\${pred.timestamp}"\`);
              return new Date().toISOString();
            }
            return date.toISOString();
          } catch (error) {
            console.error(\`Ошибка при парсинге времени "\${pred.timestamp}":\`, error);
            return new Date().toISOString();
          }
        })()`
);

fs.writeFileSync(parserPath, content, 'utf8');
console.log('✅ Исправлена строка 44 и обработка publishedAt');



