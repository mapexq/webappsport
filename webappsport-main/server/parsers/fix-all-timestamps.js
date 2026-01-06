/**
 * Скрипт для исправления всех мест, где используется статическое 'Недавно'
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parserPath = path.join(__dirname, 'predictionsParser.js');
let content = fs.readFileSync(parserPath, 'utf8');

let changesCount = 0;

// Паттерн 1: const timestamp = 'Недавно'; перед поиском карточки
// Заменяем на вызов после нахождения карточки
content = content.replace(
  /(\s+if \(text\.includes\(' — '\) && text\.includes\(': прогноз и ставка'\).*?\n\s+)(const timestamp = 'Недавно';\s*\n\s+)(\/\/ Нашли заголовок, ищем родительскую карточку[\s\S]*?const avatar = this\.findAvatar\(\$card, \$\);)/,
  (match, p1, p2, p3) => {
    changesCount++;
    return p1 + p3 + '\n          const timestamp = this.findTimestamp($card, $) || \'Недавно\';';
  }
);

// Паттерн 2: const timestamp = 'Недавно'; в методе с time элементами
content = content.replace(
  /(\s+const \$time = \$\(element\);\s*\n\s+)(\/\/ Устанавливаем время по умолчанию\s*\n\s+const timestamp = 'Недавно';\s*\n\s+)(\/\/ Находим родительский контейнер карточки[\s\S]*?const avatar = this\.findAvatar\(\$card, \$\);)/,
  (match, p1, p2, p3) => {
    changesCount++;
    return p1 + p3 + '\n        const timestamp = this.findTimestamp($card, $) || \'Недавно\';';
  }
);

// Паттерн 3: const timestamp = 'Недавно'; в методе с ссылками
content = content.replace(
  /(\s+const \$link = \$\(element\);\s*\n\s+const \$card = \$link\.closest\('div'\)\.parent\(\)\.parent\(\);\s*\n\s+)(\/\/ Пропускаем экспрессы[\s\S]*?const timestamp = 'Недавно';\s*\n\s+)(const title = this\.findTitle\(\$card, \$\);)/,
  (match, p1, p2, p3) => {
    changesCount++;
    return p1 + p2 + p3;
  }
);

// Паттерн 4: const timestamp = 'Недавно'; после всех find методов
content = content.replace(
  /(const avatar = this\.findAvatar\(\$card, \$\);\s*\n\s+)(const timestamp = 'Недавно';)/g,
  (match, p1, p2) => {
    changesCount++;
    return p1 + 'const timestamp = this.findTimestamp($card, $) || \'Недавно\';';
  }
);

// Также исправляем в методе parseAlternative
content = content.replace(
  /(\s+const \$time = \$\(element\);\s*\n\s+const timestamp = 'Недавно';\s*\n\s+)(\/\/ Ищем родительский контейнер карточки[\s\S]*?const avatar = this\.findAvatar\(\$card, \$\);)/,
  (match, p1, p2) => {
    changesCount++;
    return p1.replace('const timestamp = \'Недавно\';', '') + p2 + '\n        const timestamp = this.findTimestamp($card, $) || \'Недавно\';';
  }
);

fs.writeFileSync(parserPath, content, 'utf8');
console.log(`✅ Исправлено ${changesCount} мест с timestamp = 'Недавно'`);



