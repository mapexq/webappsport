import fs from 'fs';

const content = fs.readFileSync('predictionsParser.js', 'utf8');

// Исправляем findTimestamp - должен вызывать findTimestampInCard
const fixed = content.replace(
  /findTimestamp\(\$card, \$\) \{\s*return 'Недавно';\s*\}/,
  `findTimestamp($card, $) {
    const timestamp = findTimestampInCard($card, $);
    if (!timestamp) {
      console.debug('⚠️ Временная метка не найдена в карточке');
    } else {
      console.debug(\`✓ Найдена временная метка: "\${timestamp}"\`);
    }
    return timestamp;
  }`
);

if (fixed !== content) {
  fs.writeFileSync('predictionsParser.js', fixed, 'utf8');
  console.log('✅ Исправлен метод findTimestamp');
} else {
  console.log('⚠️ Метод findTimestamp уже исправлен или не найден');
}

// Добавляем логирование в publishedAt
const fixed2 = fixed.replace(
  /(if \(!pred\.timestamp \|\| pred\.timestamp === 'Недавно'\) \{[^}]+return new Date\(\)\.toISOString\(\);)/,
  `if (!pred.timestamp || pred.timestamp === 'Недавно') {
              console.debug(\`⚠️ Нет временной метки для прогноза "\${pred.expertName || 'Unknown'}", используем текущее время\`);
              return new Date().toISOString();`
);

const fixed3 = fixed2.replace(
  /(console\.warn\(`Не удалось распарсить время: "\${pred\.timestamp}"`\);)/,
  `console.warn(\`⚠️ Не удалось распарсить время: "\${pred.timestamp}" для прогноза "\${pred.expertName || 'Unknown'}"\`);`
);

const fixed4 = fixed3.replace(
  /(return date\.toISOString\(\);)\s*\n\s*\}\s*catch/,
  `return date.toISOString();
            }
            console.debug(\`✓ Распарсено время "\${pred.timestamp}" -> \${date.toISOString()}\`);
            return date.toISOString();
          } catch`
);

if (fixed4 !== fixed) {
  fs.writeFileSync('predictionsParser.js', fixed4, 'utf8');
  console.log('✅ Добавлено логирование в publishedAt');
} else {
  console.log('⚠️ Логирование уже добавлено или не найдено');
}


