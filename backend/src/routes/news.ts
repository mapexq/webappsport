import { FastifyInstance } from 'fastify';
import { newsRepository } from '../repositories/news.repository.js';

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
}

