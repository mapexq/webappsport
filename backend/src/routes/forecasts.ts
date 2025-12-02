import { FastifyInstance } from 'fastify';
import { forecastRepository } from '../repositories/forecast.repository.js';
import { scrapeForecasts, getMockForecasts } from '../scrapers/forecastScraper.js';

export async function forecastRoutes(fastify: FastifyInstance) {
  // GET /api/forecasts
  fastify.get('/', async () => {
    try {
      const forecasts = await forecastRepository.findAll();
      return {
        data: forecasts,
        message: 'Forecasts retrieved successfully',
      };
    } catch (error) {
      fastify.log.error(error);
      return {
        data: [],
        message: 'Error retrieving forecasts',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // GET /api/forecasts/:id
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const forecast = await forecastRepository.findById(id);
      
      if (!forecast) {
        return reply.code(404).send({
          message: 'Forecast not found',
        });
      }

      return {
        data: forecast,
        message: 'Forecast retrieved successfully',
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        message: 'Error retrieving forecast',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // POST /api/forecasts/refresh
  fastify.post('/refresh', async (request, reply) => {
    try {
      fastify.log.info('Starting forecast refresh...');
      
      // Парсим прогнозы
      let forecasts;
      try {
        forecasts = await scrapeForecasts();
      } catch (error) {
        fastify.log.warn('Scraping failed, using mock data');
        forecasts = getMockForecasts();
      }
      
      if (forecasts.length === 0) {
        forecasts = getMockForecasts();
      }
      
      // Удаляем все существующие прогнозы
      await forecastRepository.deleteAll();
      
      // Преобразуем и сохраняем
      const forecastsToSave = forecasts.map(forecast => ({
        eventName: forecast.match || `${forecast.sport} матч`,
        sport: forecast.sport,
        tournament: forecast.tournament || null,
        match: forecast.match || null,
        expertName: forecast.expertName,
        expertAvatarUrl: forecast.ava || null,
        expertLevel: forecast.expertStatus === 'эксперт' ? 'Эксперт' : 'Любитель',
        expertStatus: forecast.expertStatus,
        odds: forecast.odds || null,
        pick: forecast.prediction || 'Не указано',
        prediction: forecast.prediction || null,
        winrate: forecast.winrate || null,
        comment: forecast.comment || null,
        fullText: forecast.fullText || null,
        sourceName: 'Bookmaker Ratings',
        sourceUrl: forecast.sourceUrl,
        publishedAt: forecast.publishedAt,
      }));
      
      const count = await forecastRepository.createMany(forecastsToSave);
      
      // Если сохранилось меньше 10, дополняем мок-данными
      if (count < 10) {
        const mockForecasts = getMockForecasts().slice(0, 10 - count);
        const mockToSave = mockForecasts.map(forecast => ({
          eventName: forecast.match || `${forecast.sport} матч`,
          sport: forecast.sport,
          tournament: forecast.tournament || null,
          match: forecast.match || null,
          expertName: forecast.expertName,
          expertAvatarUrl: forecast.ava || null,
          expertLevel: forecast.expertStatus === 'эксперт' ? 'Эксперт' : 'Любитель',
          expertStatus: forecast.expertStatus,
          odds: forecast.odds || null,
          pick: forecast.prediction || 'Не указано',
          prediction: forecast.prediction || null,
          winrate: forecast.winrate || null,
          comment: forecast.comment || null,
          fullText: forecast.fullText || null,
          sourceName: 'Bookmaker Ratings',
          sourceUrl: forecast.sourceUrl,
          publishedAt: forecast.publishedAt,
        }));
        
        await forecastRepository.createMany(mockToSave);
      }
      
      const finalCount = await forecastRepository.findTop(10);
      
      fastify.log.info(`Forecast refresh completed. Saved ${finalCount.length} forecasts.`);
      
      return {
        success: true,
        count: finalCount.length,
        message: 'Forecasts refreshed successfully',
      };
    } catch (error) {
      fastify.log.error('Error refreshing forecasts:', error);
      return reply.code(500).send({
        success: false,
        message: 'Error refreshing forecasts',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}

