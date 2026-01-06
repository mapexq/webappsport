/**
 * Финальное исправление publishedAt
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parserPath = path.join(__dirname, 'predictionsParser.js');
let content = fs.readFileSync(parserPath, 'utf8');

// Исправляем конкретную проблему
content = content.replace(
  /(\s+timestamp: pred\.timestamp \|\| 'Недавно')\s*\n\s*,publishedAt:/,
  '$1,\n        publishedAt:'
);

fs.writeFileSync(parserPath, content, 'utf8');
console.log('✅ Исправлено');



