import fs from 'fs';

const lines = fs.readFileSync('predictionsParser.js', 'utf8').split('\n');

// Исправляем строки 1194-1195 (индексы 1193-1194)
if (lines[1193] && lines[1193].includes("timestamp: pred.timestamp || 'Недавно'")) {
  lines[1193] = "        timestamp: pred.timestamp || 'Недавно',";
  if (lines[1194] && lines[1194].trim().startsWith(',publishedAt:')) {
    lines[1194] = "        publishedAt: (() => {";
  }
  fs.writeFileSync('predictionsParser.js', lines.join('\n'), 'utf8');
  console.log('✅ Исправлены строки 1194-1195');
} else {
  console.log('Строка не найдена, текущее содержимое:');
  console.log('Строка 1194:', JSON.stringify(lines[1193]));
  console.log('Строка 1195:', JSON.stringify(lines[1194]));
}



