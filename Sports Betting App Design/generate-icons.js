const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Размеры иконок для разных плотностей экрана
const iconSizes = {
  'mipmap-mdpi': { launcher: 48, foreground: 108, round: 48 },
  'mipmap-hdpi': { launcher: 72, foreground: 162, round: 72 },
  'mipmap-xhdpi': { launcher: 96, foreground: 216, round: 96 },
  'mipmap-xxhdpi': { launcher: 144, foreground: 324, round: 144 },
  'mipmap-xxxhdpi': { launcher: 192, foreground: 432, round: 192 }
};

const inputFile = path.join(__dirname, 'logo.png');
const androidResPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

async function generateIcons() {
  try {
    // Проверяем наличие исходного файла
    if (!fs.existsSync(inputFile)) {
      throw new Error(`Файл ${inputFile} не найден!`);
    }

    console.log('Начинаю генерацию иконок из', inputFile);
    console.log('Применяю отступы для предотвращения обрезки...');

    // Генерируем иконки для каждой плотности
    for (const [folder, sizes] of Object.entries(iconSizes)) {
      const folderPath = path.join(androidResPath, folder);
      
      // Создаем папку, если её нет
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      console.log(`Генерация иконок для ${folder}...`);

      // Для адаптивных иконок используем 66% размера (безопасная зона)
      // Это предотвратит обрезку элементов на разных устройствах
      const safeZoneRatio = 0.66;
      const safeSize = Math.floor(sizes.foreground * safeZoneRatio);

      // Генерируем ic_launcher.png
      await sharp(inputFile)
        .resize(sizes.launcher, sizes.launcher, {
          fit: 'contain',
          background: { r: 9, g: 9, b: 11, alpha: 1 } // #09090b
        })
        .toFile(path.join(folderPath, 'ic_launcher.png'));

      // Генерируем ic_launcher_round.png (та же иконка, но для круглых иконок)
      await sharp(inputFile)
        .resize(sizes.round, sizes.round, {
          fit: 'contain',
          background: { r: 9, g: 9, b: 11, alpha: 1 }
        })
        .toFile(path.join(folderPath, 'ic_launcher_round.png'));

      // Генерируем ic_launcher_foreground.png для адаптивных иконок
      // Уменьшаем размер до 66% для безопасной зоны (предотвращает обрезку)
      await sharp(inputFile)
        .resize(safeSize, safeSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Прозрачный фон для foreground
        })
        .extend({
          top: Math.floor((sizes.foreground - safeSize) / 2),
          bottom: Math.ceil((sizes.foreground - safeSize) / 2),
          left: Math.floor((sizes.foreground - safeSize) / 2),
          right: Math.ceil((sizes.foreground - safeSize) / 2),
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toFile(path.join(folderPath, 'ic_launcher_foreground.png'));

      console.log(`✓ Иконки для ${folder} созданы (размер уменьшен до ${Math.round(safeZoneRatio * 100)}% для безопасной зоны)`);
    }

    console.log('\n✅ Все иконки успешно сгенерированы с отступами!');
    console.log('Теперь выполню синхронизацию с Android...');

  } catch (error) {
    console.error('Ошибка при генерации иконок:', error);
    process.exit(1);
  }
}

generateIcons();

