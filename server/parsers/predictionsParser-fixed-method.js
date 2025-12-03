  findPrediction($card, $) {
    // НОВАЯ ЛОГИКА: Возвращаем весь текст прогноза полностью
    const text = $card.text();
    
    // Метод 1: Ищем полный текст после "Моя ставка:" или "Мой прогноз:"
    // Извлекаем весь текст до конца предложения
    const fullTextPatterns = [
      /(?:Моя\s+ставка|Мой\s+прогноз)[^:]*:\s*([^.]*(?:\.[^.]*)*)/i,
      /(?:Моя\s+ставка|Мой\s+прогноз)[^:]*:\s*([^\n]+)/i,
    ];
    
    for (const pattern of fullTextPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        let predictionText = match[1].trim();
        // Убираем лишние пробелы и переносы строк
        predictionText = predictionText.replace(/\s+/g, ' ').trim();
        if (predictionText.length > 3) {
          return predictionText;
        }
      }
    }
    
    // Метод 2: Ищем в специальных элементах с прогнозом
    // Ищем элементы, которые содержат прогноз рядом с коэффициентом
    const predictionElements = $card.find('*').filter((i, el) => {
      const elText = $(el).text().trim();
      const hasPrediction = /^(П\d+|ТБ|ТМ|Ф\d+|Обе\s+забьют|Мбаппе|1-й\s+гол)/i.test(elText);
      const hasOdds = /\d+\.\d{2}/.test($(el).parent().text());
      return hasPrediction && hasOdds && elText.length < 100;
    });
    
    if (predictionElements.length > 0) {
      // Берем первый найденный элемент и извлекаем полный текст
      const $predEl = $(predictionElements[0]);
      let predictionText = $predEl.text().trim();
      
      // Пытаемся найти расширенный текст рядом
      const $parent = $predEl.parent();
      const parentText = $parent.text();
      const expandedMatch = parentText.match(new RegExp(`(${predictionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^.]*)`, 'i'));
      if (expandedMatch && expandedMatch[1].length > predictionText.length) {
        predictionText = expandedMatch[1].trim();
      }
      
      return predictionText;
    }
    
    // Метод 3: Ищем стандартные паттерны прогнозов и берем их с контекстом
    const standardPatterns = [
      /(П\d+\s+и\s+Т[БМ]\s*\([^)]+\))/i,
      /(\d+[-йя]\s+гол[^.]*)/i,
      /(Ф\d+\s*\([^)]+\)[^.]*)/i,
      /(Т[БМ]\s*\([^)]+\))/i,
      /(П\d+)/i,
      /(Обе\s+забьют[^:]*:[^.]*)/i,
      /(Мбаппе\s+забьет[^.]*)/i,
    ];
    
    for (const pattern of standardPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
    
    return null;
  }

