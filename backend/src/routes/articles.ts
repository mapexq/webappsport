import { FastifyInstance } from 'fastify';
import { articleRepository } from '../repositories/article.repository.js';

export async function articleRoutes(fastify: FastifyInstance) {
  // GET /api/articles
  fastify.get('/', async () => {
    try {
      const articles = await articleRepository.findAll();
      return {
        data: articles,
        message: 'Articles retrieved successfully',
      };
    } catch (error) {
      fastify.log.error(error);
      return {
        data: [],
        message: 'Error retrieving articles',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // GET /api/articles/:id
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const article = await articleRepository.findById(id);
      
      if (!article) {
        return reply.code(404).send({
          message: 'Article not found',
        });
      }

      return {
        data: article,
        message: 'Article retrieved successfully',
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        message: 'Error retrieving article',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}

