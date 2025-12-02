import { prisma } from '../lib/prisma.js';
import type { News } from '@prisma/client';

export class NewsRepository {
  async findAll(): Promise<News[]> {
    return prisma.news.findMany({
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<News | null> {
    return prisma.news.findUnique({
      where: { id },
    });
  }

  async create(data: {
    title: string;
    sport?: string;
    category?: string;
    imageUrl?: string;
    teaser?: string;
    sourceName?: string;
    sourceUrl?: string;
    publishedAt?: Date;
  }): Promise<News> {
    return prisma.news.create({
      data,
    });
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      sport: string;
      category: string;
      imageUrl: string;
      teaser: string;
      sourceName: string;
      sourceUrl: string;
      publishedAt: Date;
    }>
  ): Promise<News> {
    return prisma.news.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.news.delete({
      where: { id },
    });
  }
}

export const newsRepository = new NewsRepository();

