import fs from 'fs';

const filePath = 'predictionsParser.js';
let content = fs.readFileSync(filePath, 'utf8');

// Ищем проблемное место - строка с timestamp и следующая с publishedAt
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  // Ищем строку с timestamp
  if (lines[i] && lines[i].trim().includes("timestamp: pred.timestamp || 'Недавно'")) {
    console.log(`Найдена строка ${i + 1}: ${lines[i].substring(0, 50)}...`);
    
    // Проверяем следующие строки
    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      if (lines[j]) {
        const trimmed = lines[j].trim();
        console.log(`  Строка ${j + 1}: ${trimmed.substring(0, 50)}...`);
        
        if (trimmed.startsWith(',publishedAt:') || trimmed.includes('publishedAt:')) {
          console.log(`  ✓ Найдена строка с publishedAt на строке ${j + 1}`);
          
          // Исправляем строку с timestamp - добавляем запятую
          lines[i] = lines[i].trimEnd() + ',';
          
          // Исправляем строку с publishedAt
          if (trimmed.startsWith(',publishedAt:')) {
            lines[j] = '        publishedAt: (() => {';
          } else if (trimmed.includes('publishedAt: (() => {')) {
            // Уже правильный формат, но может быть неправильный отступ
            lines[j] = '        publishedAt: (() => {';
          }
          
          fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
          console.log('✅ Исправлено!');
          break;
        }
      }
    }
    break;
  }
}

