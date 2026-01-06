/**
 * Скрипт для исправления расположения publishedAt в predictionsParser.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parserPath = path.join(__dirname, 'predictionsParser.js');
let content = fs.readFileSync(parserPath, 'utf8');

// Исправляем неправильное расположение publishedAt
content = content.replace(
  /(\s+timestamp: pred\.timestamp \|\| 'Недавно'\s*)\n\s+(\n\s+publishedAt: pred\.timestamp \? parseTimestampToDate\(pred\.timestamp\)\.toISOString\(\) : new Date\(\)\.toISOString\(\),?\};)/,
  '$1,\n        publishedAt: pred.timestamp ? parseTimestampToDate(pred.timestamp).toISOString() : new Date().toISOString()\n      };'
);

fs.writeFileSync(parserPath, content, 'utf8');
console.log('✅ Исправлено расположение publishedAt');



