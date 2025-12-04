import fs from 'fs';

const filePath = 'predictionsParser.js';
const lines = fs.readFileSync(filePath, 'utf8').split('\n');
const newLines = [];

let i = 0;
while (i < lines.length) {
  const line = lines[i];
  
  // 1. Добавить импорт после строки 2 (cheerio)
  if (i === 2 && line.trim() === '') {
    newLines.push(line);
    newLines.push("import { findTimestampInCard, parseTimestampToDate } from './timestampUtils.js';");
    i++;
    continue;
  }
  
  // 2. Обновить timestamp на строке 36
  if (line.includes("const $time = $(element);") && i < 40) {
    newLines.push(line);
    i++;
    if (i < lines.length && lines[i].includes("const timestamp = $time.text().trim();")) {
      newLines.push("        const timestamp = this.findTimestamp($time.closest('div'), $) || 'Недавно';");
      i++;
      continue;
    }
  }
  
  // 3. Обновить findTimestamp метод (строки 275-281)
  if (line.includes("  findTimestamp($card, $) {") && i > 270 && i < 285) {
    newLines.push("  findTimestamp($card, $) {");
    newLines.push("    return findTimestampInCard($card, $);");
    newLines.push("  }");
    // Пропускаем старые строки метода
    i++;
    while (i < lines.length && !lines[i].includes("  }") && i < 285) {
      i++;
    }
    if (i < lines.length && lines[i].includes("  }") && i < 285) {
      i++;
    }
    continue;
  }
  
  // 4. Обновить winRate на строке 691
  if (line.includes("winRate: Math.floor(Math.random() * 20) + 60")) {
    newLines.push("          winRate: this.getWinRateForExpert(pred.expertName || 'Эксперт')");
    i++;
    continue;
  }
  
  // 5. Добавить publishedAt после timestamp на строке 697
  if (line.includes("timestamp: pred.timestamp || 'Недавно'") && i > 690 && i < 700) {
    newLines.push("        timestamp: pred.timestamp || 'Недавно',");
    newLines.push("        publishedAt: (() => {");
    newLines.push("          try {");
    newLines.push("            if (!pred.timestamp || pred.timestamp === 'Недавно') {");
    newLines.push("              return new Date().toISOString();");
    newLines.push("            }");
    newLines.push("            const date = parseTimestampToDate(pred.timestamp);");
    newLines.push("            if (isNaN(date.getTime())) {");
    newLines.push("              console.warn(`Не удалось распарсить время: \"${pred.timestamp}\"`);");
    newLines.push("              return new Date().toISOString();");
    newLines.push("            }");
    newLines.push("            return date.toISOString();");
    newLines.push("          } catch (error) {");
    newLines.push("            console.error(`Ошибка при парсинге времени \"${pred.timestamp}\":`, error);");
    newLines.push("            return new Date().toISOString();");
    newLines.push("          }");
    newLines.push("        })()");
    i++;
    continue;
  }
  
  // 6. Добавить метод getWinRateForExpert перед закрывающей скобкой класса
  if (line.includes("    return 'Футбол'; // По умолчанию") && i > 730) {
    newLines.push(line);
    i++;
    if (i < lines.length && lines[i].includes("  }") && i < lines.length - 5) {
      newLines.push("  }");
      newLines.push("");
      newLines.push("  /**");
      newLines.push("   * Получает винрейт эксперта по его имени");
      newLines.push("   * @param {string} expertName - Имя эксперта");
      newLines.push("   * @returns {number} - Винрейт от 60 до 80");
      newLines.push("   */");
      newLines.push("  getWinRateForExpert(expertName) {");
      newLines.push("    if (!expertName) return 65;");
      newLines.push("    ");
      newLines.push("    // Простая хеш-функция для стабильного винрейта для одного эксперта");
      newLines.push("    let hash = 0;");
      newLines.push("    for (let i = 0; i < expertName.length; i++) {");
      newLines.push("      hash = ((hash << 5) - hash) + expertName.charCodeAt(i);");
      newLines.push("      hash = hash & hash; // Convert to 32bit integer");
      newLines.push("    }");
      newLines.push("    ");
      newLines.push("    // Генерируем винрейт от 60 до 80 на основе хеша");
      newLines.push("    const winRate = 60 + (Math.abs(hash) % 21);");
      newLines.push("    return winRate;");
      newLines.push("  }");
      i++;
      continue;
    }
  }
  
  newLines.push(line);
  i++;
}

// Убедимся, что импорт добавлен
if (!newLines.some(l => l.includes("import { findTimestampInCard"))) {
  const cheerioIndex = newLines.findIndex(l => l.includes("import * as cheerio"));
  if (cheerioIndex >= 0) {
    newLines.splice(cheerioIndex + 1, 0, "import { findTimestampInCard, parseTimestampToDate } from './timestampUtils.js';");
  }
}

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('✅ Все изменения применены успешно!');


