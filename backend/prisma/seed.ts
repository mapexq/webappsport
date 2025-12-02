import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.article.deleteMany();
  await prisma.news.deleteMany();
  await prisma.forecast.deleteMany();
  await prisma.bookmaker.deleteMany();

  // Seed Bookmakers
  const bookmakers = await Promise.all([
    prisma.bookmaker.create({
      data: {
        name: '1xBet',
        rating: 4.8,
        bonusAmount: '25000₽',
        tags: JSON.stringify(['футбол', 'хоккей', 'теннис']),
        features: JSON.stringify(['live-ставки', 'кэшбэк', 'мобильное приложение']),
      },
    }),
    prisma.bookmaker.create({
      data: {
        name: 'Bet365',
        rating: 4.9,
        bonusAmount: '10000₽',
        tags: JSON.stringify(['футбол', 'баскетбол', 'бокс']),
        features: JSON.stringify(['live-трансляции', 'быстрые выплаты', 'широкий выбор']),
      },
    }),
    prisma.bookmaker.create({
      data: {
        name: 'Parimatch',
        rating: 4.7,
        bonusAmount: '15000₽',
        tags: JSON.stringify(['футбол', 'хоккей', 'киберспорт']),
        features: JSON.stringify(['экспрессы', 'бонусы', 'акции']),
      },
    }),
  ]);

  console.log(`✅ Created ${bookmakers.length} bookmakers`);

  // Seed Forecasts
  const forecasts = await Promise.all([
    prisma.forecast.create({
      data: {
        eventName: 'Манчестер Юнайтед vs Ливерпуль',
        sport: 'Футбол',
        tournament: 'Премьер-лига',
        expertName: 'Иван Петров',
        expertAvatarUrl: 'https://example.com/avatar1.jpg',
        expertLevel: 'Эксперт',
        odds: 2.5,
        pick: 'П1',
        comment: 'Манчестер Юнайтед в отличной форме, играет дома',
        sourceName: 'BetPro',
        sourceUrl: 'https://betpro.ru/forecast/1',
        publishedAt: new Date('2024-12-01T10:00:00Z'),
      },
    }),
    prisma.forecast.create({
      data: {
        eventName: 'Барселона vs Реал Мадрид',
        sport: 'Футбол',
        tournament: 'Ла Лига',
        expertName: 'Мария Сидорова',
        expertAvatarUrl: 'https://example.com/avatar2.jpg',
        expertLevel: 'Профессионал',
        odds: 3.2,
        pick: 'Тотал больше 2.5',
        comment: 'Обе команды играют атакующий футбол',
        sourceName: 'BetPro',
        sourceUrl: 'https://betpro.ru/forecast/2',
        publishedAt: new Date('2024-12-02T14:30:00Z'),
      },
    }),
    prisma.forecast.create({
      data: {
        eventName: 'ЦСКА vs Спартак',
        sport: 'Футбол',
        tournament: 'РПЛ',
        expertName: 'Алексей Козлов',
        expertAvatarUrl: 'https://example.com/avatar3.jpg',
        expertLevel: 'Мастер',
        odds: 1.9,
        pick: 'Обе забьют',
        comment: 'Классическое дерби, обе команды в хорошей форме',
        sourceName: 'BetPro',
        sourceUrl: 'https://betpro.ru/forecast/3',
        publishedAt: new Date('2024-12-03T18:00:00Z'),
      },
    }),
  ]);

  console.log(`✅ Created ${forecasts.length} forecasts`);

  // Seed News
  const news = await Promise.all([
    prisma.news.create({
      data: {
        title: 'Манчестер Сити выиграл чемпионат Англии',
        sport: 'Футбол',
        category: 'Новости',
        imageUrl: 'https://example.com/news1.jpg',
        teaser: 'Манчестер Сити в пятый раз подряд стал чемпионом Премьер-лиги',
        sourceName: 'BBC Sport',
        sourceUrl: 'https://bbc.com/sport/news1',
        publishedAt: new Date('2024-12-01T12:00:00Z'),
      },
    }),
    prisma.news.create({
      data: {
        title: 'Новый рекорд в НБА',
        sport: 'Баскетбол',
        category: 'Достижения',
        imageUrl: 'https://example.com/news2.jpg',
        teaser: 'Леброн Джеймс установил новый рекорд по очкам за карьеру',
        sourceName: 'ESPN',
        sourceUrl: 'https://espn.com/nba/news1',
        publishedAt: new Date('2024-12-02T15:00:00Z'),
      },
    }),
    prisma.news.create({
      data: {
        title: 'Трансферное окно: главные новости',
        sport: 'Футбол',
        category: 'Трансферы',
        imageUrl: 'https://example.com/news3.jpg',
        teaser: 'Обзор главных трансферов зимнего окна',
        sourceName: 'Sky Sports',
        sourceUrl: 'https://skysports.com/transfers',
        publishedAt: new Date('2024-12-03T09:00:00Z'),
      },
    }),
  ]);

  console.log(`✅ Created ${news.length} news items`);

  // Seed Articles
  const articles = await Promise.all([
    prisma.article.create({
      data: {
        title: 'Как правильно делать ставки на футбол',
        level: 'Начинающий',
        tags: JSON.stringify(['ставки', 'футбол', 'обучение']),
        readTimeMinutes: 10,
        contentShort: 'Руководство для новичков по ставкам на футбол',
        contentUrl: 'https://betpro.ru/articles/betting-guide',
      },
    }),
    prisma.article.create({
      data: {
        title: 'Анализ коэффициентов: что нужно знать',
        level: 'Продвинутый',
        tags: JSON.stringify(['анализ', 'коэффициенты', 'стратегия']),
        readTimeMinutes: 15,
        contentShort: 'Глубокий анализ работы коэффициентов в букмекерских конторах',
        contentUrl: 'https://betpro.ru/articles/odds-analysis',
      },
    }),
    prisma.article.create({
      data: {
        title: 'Топ-10 ошибок начинающих беттеров',
        level: 'Начинающий',
        tags: JSON.stringify(['ошибки', 'советы', 'обучение']),
        readTimeMinutes: 8,
        contentShort: 'Частые ошибки, которых следует избегать при ставках',
        contentUrl: 'https://betpro.ru/articles/common-mistakes',
      },
    }),
  ]);

  console.log(`✅ Created ${articles.length} articles`);

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

