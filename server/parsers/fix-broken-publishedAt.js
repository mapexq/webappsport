import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parserPath = path.join(__dirname, 'predictionsParser.js');
let content = fs.readFileSync(parserPath, 'utf8');

// Исправляем поврежденную строку - ищем паттерн где publishedAt начинается неправильно
content = content.replace(
  /(\s+timestamp: pred\.timestamp \|\| 'Недавно')\s*\n\s*,publishedAt: \(\(\) => \{d\.timestamp/,
  '$1,\n        publishedAt: (() => {\n          try {\n            if (!pred.timestamp || pred.timestamp === \'Недавно\') {\n              return new Date().toISOString();\n            }\n            const date = parseTimestampToDate(pred.timestamp);\n            if (isNaN(date.getTime())) {\n              console.warn(`Не удалось распарсить время: "${pred.timestamp}"`);\n              return new Date().toISOString();\n            }\n            return date.toISOString();\n          } catch (error) {\n            console.error(`Ошибка при парсинге времени "${pred.timestamp}":`, error);\n            return new Date().toISOString();\n          }\n        })()'
);

fs.writeFileSync(parserPath, content, 'utf8');
console.log('✅ Исправлена поврежденная строка publishedAt');


