import { FastifyInstance } from 'fastify';

export async function newsRoutes(fastify: FastifyInstance) {
  // GET /api/news
  fastify.get('/', async () => {
    return {
      data: [
        {
          id: '1',
          title: 'Новость 1',
          slug: 'news-1',
          excerpt: 'Краткое описание новости',
          content: 'Полное содержание новости',
          category: 'Спорт',
          tags: ['футбол', 'новости'],
          isPublished: true,
          publishedAt: new Date().toISOString(),
          views: 0,
        },
      ],
      message: 'News retrieved successfully',
    };
  });

  // GET /api/news/:id
  fastify.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    return {
      data: {
        id,
        title: 'Новость 1',
        slug: 'news-1',
        excerpt: 'Краткое описание новости',
        content: 'Полное содержание новости',
        category: 'Спорт',
        tags: ['футбол', 'новости'],
        isPublished: true,
        publishedAt: new Date().toISOString(),
        views: 0,
      },
      message: 'News retrieved successfully',
    };
  });
}

