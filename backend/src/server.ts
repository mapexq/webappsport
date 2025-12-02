import Fastify from 'fastify';
import cors from '@fastify/cors';
import { bookmakerRoutes } from './routes/bookmakers';
import { forecastRoutes } from './routes/forecasts';
import { newsRoutes } from './routes/news';
import { articleRoutes } from './routes/articles';

const fastify = Fastify({
  logger: true,
});

// Register CORS
await fastify.register(cors, {
  origin: true,
});

// Register routes
await fastify.register(bookmakerRoutes, { prefix: '/api/bookmakers' });
await fastify.register(forecastRoutes, { prefix: '/api/forecasts' });
await fastify.register(newsRoutes, { prefix: '/api/news' });
await fastify.register(articleRoutes, { prefix: '/api/articles' });

// Health check
fastify.get('/health', async () => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('🚀 Server running on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

