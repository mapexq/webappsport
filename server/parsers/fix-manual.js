import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parserPath = path.join(__dirname, 'predictionsParser.js');
let lines = fs.readFileSync(parserPath, 'utf8').split('\n');

// Находим и исправляем строку с timestamp
for (let i = 0; i < lines.length; i++) {
  if (lines[i] && lines[i].includes("timestamp: pred.timestamp || 'Недавно'")) {
    // Проверяем следующую строку
    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      if (nextLine.trim().startsWith(',publishedAt:')) {
        // Исправляем: добавляем запятую в конец текущей строки и правим следующую
        lines[i] = lines[i] + ',';
        lines[i + 1] = '        publishedAt: (() => {';
        console.log(`✓ Исправлены строки ${i + 1}-${i + 2}`);
        break;
      }
    }
  }
}

fs.writeFileSync(parserPath, lines.join('\n'), 'utf8');
console.log('✅ Исправлено');

