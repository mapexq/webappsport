import { FastifyInstance } from 'fastify';
import { newsRepository } from '../repositories/news.repository.js';
import { scrapeRbcNews, getMockNews } from '../scrapers/rbcNewsScraper.js';

export async function newsRoutes(fastify: FastifyInstance) {
  // GET /api/news
  fastify.get('/', async () => {
    try {
      const news = await newsRepository.findAll();
      return {
        data: news,
        message: 'News retrieved successfully',
      };
    } catch (error) {
      fastify.log.error(error);
      return {
        data: [],
        message: 'Error retrieving news',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // GET /api/news/:id
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const newsItem = await newsRepository.findById(id);
      
      if (!newsItem) {
        return reply.code(404).send({
          message: 'News not found',
        });
      }

      return {
        data: newsItem,
        message: 'News retrieved successfully',
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        message: 'Error retrieving news',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // GET /api/news/last-update
  fastify.get('/last-update', async () => {
    try {
      const lastUpdate = await newsRepository.getLastUpdate();
      return {
        lastUpdate: lastUpdate?.toISOString() || null,
        message: 'Last update time retrieved successfully',
      };
    } catch (error) {
      fastify.log.error(error);
      return {
        lastUpdate: null,
        message: 'Error retrieving last update time',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // POST /api/news/refresh
  fastify.post('/refresh', async (request, reply) => {
    try {
      fastify.log.info('Starting news refresh...');
      
      // Используем мок-данные если указано в env или если парсинг не удался
      const useMock = process.env.USE_MOCK_NEWS === 'true';
      let parsedNews;
      
      if (useMock) {
        fastify.log.info('Using mock news data');
        parsedNews = getMockNews();
      } else {
        try {
          parsedNews = await scrapeRbcNews();
        } catch (scrapingError) {
          fastify.log.error(`Scraping failed: ${scrapingError instanceof Error ? scrapingError.message : 'Unknown error'}`);
          // В случае ошибки парсинга возвращаем существующие данные
          const existingNews = await newsRepository.findAll();
          return {
            success: false,
            count: existingNews.length,
            news: existingNews,
            message: 'Scraping failed, returning existing news',
            error: scrapingError instanceof Error ? scrapingError.message : 'Unknown error',
          };
        }
      }

      if (!parsedNews || parsedNews.length === 0) {
        // Если не удалось спарсить новости, возвращаем существующие
        const existingNews = await newsRepository.findAll();
        return {
          success: false,
          count: existingNews.length,
          news: existingNews,
          message: 'No news parsed, returning existing news',
        };
      }

      // Удаляем все существующие новости
      await newsRepository.deleteAll();
      fastify.log.info(`Deleted all existing news`);

      // Преобразуем ParsedNews в формат для БД
      const newsData = parsedNews.map(item => ({
        id: item.id,
        title: item.title,
        sport: item.sport,
        category: item.category,
        imageUrl: item.imageUrl,
        teaser: item.teaser,
        fullContent: item.fullContent,
        sourceName: item.sourceName,
        sourceUrl: item.sourceUrl,
        publishedAt: item.publishedAt,
      }));

      // Добавляем новые новости
      const createdCount = await newsRepository.createMany(newsData);
      fastify.log.info(`Created ${createdCount} news items`);

      // Получаем обновленный список
      const updatedNews = await newsRepository.findAll();

      return {
        success: true,
        count: createdCount,
        news: updatedNews,
        message: 'News refreshed successfully',
      };
    } catch (error) {
      fastify.log.error(error);
      
      // В случае ошибки возвращаем существующие данные
      try {
        const existingNews = await newsRepository.findAll();
        return reply.code(500).send({
          success: false,
          count: existingNews.length,
          news: existingNews,
          message: 'Error refreshing news, returning existing news',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      } catch (fallbackError) {
        return reply.code(500).send({
          success: false,
          count: 0,
          news: [],
          message: 'Error refreshing news',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  });
}

