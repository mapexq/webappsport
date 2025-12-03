import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWS_FILE = path.join(__dirname, '../data/news.json');
const DATA_DIR = path.join(__dirname, '../data');

/**
 * Управление хранением новостей в JSON файле
 */
export class NewsStorage {
  constructor() {
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  /**
   * Читает все новости из файла
   */
  readNews() {
    try {
      if (fs.existsSync(NEWS_FILE)) {
        const data = fs.readFileSync(NEWS_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Ошибка чтения новостей:', error);
    }
    return [];
  }

  /**
   * Сохраняет новости в файл
   */
  saveNews(news) {
    try {
      fs.writeFileSync(NEWS_FILE, JSON.stringify(news, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error('Ошибка сохранения новостей:', error);
      return false;
    }
  }

  /**
   * Удаляет все новости
   */
  deleteAllNews() {
    try {
      if (fs.existsSync(NEWS_FILE)) {
        fs.writeFileSync(NEWS_FILE, JSON.stringify([], null, 2), 'utf-8');
      }
      return true;
    } catch (error) {
      console.error('Ошибка удаления новостей:', error);
      return false;
    }
  }

  /**
   * Получает время последнего обновления
   */
  getLastUpdate() {
    try {
      if (fs.existsSync(NEWS_FILE)) {
        const stats = fs.statSync(NEWS_FILE);
        return stats.mtime.toISOString();
      }
    } catch (error) {
      console.error('Ошибка получения времени обновления:', error);
    }
    return null;
  }

  /**
   * Добавляет новости (заменяет все существующие)
   */
  addNews(newNewsArray) {
    const now = new Date().toISOString();
    const news = newNewsArray.map(item => ({
      ...item,
      updatedAt: now
    }));
    return this.saveNews(news);
  }
}

