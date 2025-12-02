import { FastifyInstance } from 'fastify';

export async function forecastRoutes(fastify: FastifyInstance) {
  // GET /api/forecasts
  fastify.get('/', async () => {
    return {
      data: [
        {
          id: '1',
          bookmakerId: '1',
          sport: 'Футбол',
          league: 'Премьер-лига',
          match: 'Манчестер Юнайтед vs Ливерпуль',
          predictionType: 'П1',
          predictionValue: '',
          odds: 2.5,
          status: 'PENDING',
          matchDate: new Date().toISOString(),
        },
      ],
      message: 'Forecasts retrieved successfully',
    };
  });

  // GET /api/forecasts/:id
  fastify.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    return {
      data: {
        id,
        bookmakerId: '1',
        sport: 'Футбол',
        league: 'Премьер-лига',
        match: 'Манчестер Юнайтед vs Ливерпуль',
        predictionType: 'П1',
        predictionValue: '',
        odds: 2.5,
        status: 'PENDING',
        matchDate: new Date().toISOString(),
      },
      message: 'Forecast retrieved successfully',
    };
  });
}

