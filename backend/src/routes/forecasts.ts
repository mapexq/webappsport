import { FastifyInstance } from 'fastify';
import { forecastRepository } from '../repositories/forecast.repository.js';

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
}

