/**
 * Исправление синтаксической ошибки в publishedAt
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parserPath = path.join(__dirname, 'predictionsParser.js');
let lines = fs.readFileSync(parserPath, 'utf8').split('\n');

// Исправляем строку с publishedAt
for (let i = 0; i < lines.length; i++) {
  if (lines[i] && lines[i].includes("timestamp: pred.timestamp || 'Недавно'")) {
    // Следующая строка должна быть с publishedAt
    if (i + 1 < lines.length && lines[i + 1].trim().startsWith(',publishedAt:')) {
      lines[i] = lines[i] + ',';
      lines[i + 1] = '        publishedAt: (() => {';
      console.log('✓ Исправлена синтаксическая ошибка в publishedAt');
      break;
    }
  }
}

fs.writeFileSync(parserPath, lines.join('\n'), 'utf8');
console.log('✅ Синтаксическая ошибка исправлена');


