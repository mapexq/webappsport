import { FastifyInstance } from 'fastify';

export async function bookmakerRoutes(fastify: FastifyInstance) {
  // GET /api/bookmakers
  fastify.get('/', async () => {
    return {
      data: [
        {
          id: '1',
          name: '1xBet',
          slug: '1xbet',
          logoUrl: '',
          websiteUrl: 'https://1xbet.com',
          isActive: true,
        },
      ],
      message: 'Bookmakers retrieved successfully',
    };
  });

  // GET /api/bookmakers/:id
  fastify.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    return {
      data: {
        id,
        name: '1xBet',
        slug: '1xbet',
        logoUrl: '',
        websiteUrl: 'https://1xbet.com',
        isActive: true,
      },
      message: 'Bookmaker retrieved successfully',
    };
  });
}

