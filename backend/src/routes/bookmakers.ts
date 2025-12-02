import { FastifyInstance } from 'fastify';
import { bookmakerRepository } from '../repositories/bookmaker.repository.js';

export async function bookmakerRoutes(fastify: FastifyInstance) {
  // GET /api/bookmakers
  fastify.get('/', async () => {
    try {
      const bookmakers = await bookmakerRepository.findAll();
      return {
        data: bookmakers,
        message: 'Bookmakers retrieved successfully',
      };
    } catch (error) {
      fastify.log.error(error);
      return {
        data: [],
        message: 'Error retrieving bookmakers',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // GET /api/bookmakers/:id
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const bookmaker = await bookmakerRepository.findById(id);
      
      if (!bookmaker) {
        return reply.code(404).send({
          message: 'Bookmaker not found',
        });
      }

      return {
        data: bookmaker,
        message: 'Bookmaker retrieved successfully',
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        message: 'Error retrieving bookmaker',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}

