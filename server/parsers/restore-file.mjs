import fs from 'fs';

const filePath = 'predictionsParser.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Добавить импорт
content = content.replace(
  "import * as cheerio from 'cheerio';",
  "import * as cheerio from 'cheerio';\nimport { findTimestampInCard, parseTimestampToDate } from './timestampUtils.js';"
);

// 2. Обновить findTimestamp
content = content.replace(
  /findTimestamp\(\$card, \$\) \{\s+const \$time = \$card\.find\('time'\);\s+if \(\$time\.length > 0\) \{\s+return \$time\.text\(\)\.trim\(\);\s+\}\s+return 'Недавно';\s+\}/,
  `findTimestamp($card, $) {
    return findTimestampInCard($card, $);
  }`
);

// 3. Обновить timestamp в первом методе
content = content.replace(
  "const timestamp = $time.text().trim();",
  "const timestamp = this.findTimestamp($time.closest('div'), $) || 'Недавно';"
);

// 4. Обновить winRate
content = content.replace(
  "winRate: Math.floor(Math.random() * 20) + 60 // Генерируем винрейт от 60 до 80",
  "winRate: this.getWinRateForExpert(pred.expertName || 'Эксперт')"
);

// 5. Добавить publishedAt
content = content.replace(
  /timestamp: pred\.timestamp \|\| 'Недавно'\s+\}\s+\);/,
  `timestamp: pred.timestamp || 'Недавно',
        publishedAt: (() => {
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
        })()
      };
    });`
);

// 6. Добавить метод getWinRateForExpert перед закрывающей скобкой класса
content = content.replace(
  /return 'Футбол'; \/\/ По умолчанию\s+\}\s+\}/,
  `return 'Футбол'; // По умолчанию
  }

  /**
   * Получает винрейт эксперта по его имени
   * @param {string} expertName - Имя эксперта
   * @returns {number} - Винрейт от 60 до 80
   */
  getWinRateForExpert(expertName) {
    if (!expertName) return 65;
    
    // Простая хеш-функция для стабильного винрейта для одного эксперта
    let hash = 0;
    for (let i = 0; i < expertName.length; i++) {
      hash = ((hash << 5) - hash) + expertName.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Генерируем винрейт от 60 до 80 на основе хеша
    const winRate = 60 + (Math.abs(hash) % 21);
    return winRate;
  }
}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Файл восстановлен успешно!');

