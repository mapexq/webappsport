import { FastifyInstance } from 'fastify';

export async function articleRoutes(fastify: FastifyInstance) {
  // GET /api/articles
  fastify.get('/', async () => {
    return {
      data: [
        {
          id: '1',
          title: 'Статья 1',
          slug: 'article-1',
          excerpt: 'Краткое описание статьи',
          content: 'Полное содержание статьи',
          category: 'Аналитика',
          tags: ['прогнозы', 'анализ'],
          isPublished: true,
          publishedAt: new Date().toISOString(),
          views: 0,
          readingTime: 5,
        },
      ],
      message: 'Articles retrieved successfully',
    };
  });

  // GET /api/articles/:id
  fastify.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    return {
      data: {
        id,
        title: 'Статья 1',
        slug: 'article-1',
        excerpt: 'Краткое описание статьи',
        content: 'Полное содержание статьи',
        category: 'Аналитика',
        tags: ['прогнозы', 'анализ'],
        isPublished: true,
        publishedAt: new Date().toISOString(),
        views: 0,
        readingTime: 5,
      },
      message: 'Article retrieved successfully',
    };
  });
}

