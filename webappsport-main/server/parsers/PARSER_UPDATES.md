# Инструкции по обновлению парсера для поддержки publishedAt

## Изменения в predictionsParser.js

### 1. Добавить импорт утилит в начало файла (после строки 2):

```javascript
import { findTimestampInCard, parseTimestampToDate } from './timestampUtils.js';
```

### 2. Обновить метод findTimestamp (строка 332):

Заменить:
```javascript
findTimestamp($card, $) {
  return 'Недавно';
}
```

На:
```javascript
findTimestamp($card, $) {
  return findTimestampInCard($card, $);
}
```

### 3. Обновить все места, где устанавливается timestamp = 'Недавно':

Найти все вхождения (строки 43, 105, 173, 224) и заменить:
```javascript
const timestamp = 'Недавно';
```

На:
```javascript
const timestamp = this.findTimestamp($card, $) || 'Недавно';
```

### 4. Обновить метод formatPredictions (около строки 1194):

В методе formatPredictions, где возвращается объект прогноза, добавить поле publishedAt:

Заменить:
```javascript
return {
  id: Date.now() + index,
  eventName: eventName,
  discipline: discipline,
  tournament: tournament || 'Чемпионат',
  expert: {
    name: pred.expertName || 'Эксперт',
    avatar: pred.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    status: 'expert',
    winRate: this.getWinRateForExpert(pred.expertName || 'Эксперт')
  },
  prediction: pred.prediction || 'Прогноз',
  odds: pred.odds || 1.85,
  comment: pred.comment || pred.title || 'Комментарий к прогнозу',
  source: 'Sports Analytics Pro',
  timestamp: pred.timestamp || 'Недавно'
};
```

На:
```javascript
const publishedAt = pred.timestamp 
  ? parseTimestampToDate(pred.timestamp).toISOString() 
  : new Date().toISOString();

return {
  id: Date.now() + index,
  eventName: eventName,
  discipline: discipline,
  tournament: tournament || 'Чемпионат',
  expert: {
    name: pred.expertName || 'Эксперт',
    avatar: pred.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    status: 'expert',
    winRate: this.getWinRateForExpert(pred.expertName || 'Эксперт')
  },
  prediction: pred.prediction || 'Прогноз',
  odds: pred.odds || 1.85,
  comment: pred.comment || pred.title || 'Комментарий к прогнозу',
  source: 'Sports Analytics Pro',
  timestamp: pred.timestamp || 'Недавно',
  publishedAt: publishedAt
};
```

## Файлы, которые уже созданы:

1. `server/parsers/timestampUtils.js` - утилиты для работы с временными метками
2. `Sports Betting App Design/src/utils/timeUtils.ts` - функция formatTimeAgo для фронтенда
3. Обновлены компоненты фронтенда для использования publishedAt

## Проверка работы:

После применения изменений:
1. Перезапустить backend сервер
2. Проверить, что API возвращает поле `publishedAt` в формате ISO строки
3. Проверить, что фронтенд корректно отображает время через formatTimeAgo



