import fs from 'fs';

const content = fs.readFileSync('predictionsParser.js', 'utf8');

// Исправляем порядок - console.debug должен быть перед return
const fixed = content.replace(
  /(const date = parseTimestampToDate\(pred\.timestamp\);\s*if \(isNaN\(date\.getTime\(\)\)\) \{[\s\S]*?return new Date\(\)\.toISOString\(\);[\s\S]*?\}\s*return date\.toISOString\(\);)\s*\}\s*console\.debug/,
  `const date = parseTimestampToDate(pred.timestamp);
            if (isNaN(date.getTime())) {
              console.warn(\`⚠️ Не удалось распарсить время: "\${pred.timestamp}" для прогноза "\${pred.expertName || 'Unknown'}"\`);
              return new Date().toISOString();
            }
            console.debug(\`✓ Распарсено время "\${pred.timestamp}" -> \${date.toISOString()}\`);
            return date.toISOString();
          }`
);

if (fixed !== content) {
  fs.writeFileSync('predictionsParser.js', fixed, 'utf8');
  console.log('✅ Исправлен порядок console.debug');
} else {
  console.log('⚠️ Порядок уже правильный или паттерн не найден');
}


