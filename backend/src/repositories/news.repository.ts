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
    fullContent?: string;
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
      fullContent: string;
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

  async deleteAll(): Promise<void> {
    await prisma.news.deleteMany({});
  }

  async createMany(data: Array<{
    id?: string;
    title: string;
    sport?: string;
    category?: string;
    imageUrl?: string;
    teaser?: string;
    fullContent?: string;
    sourceName?: string;
    sourceUrl?: string;
    publishedAt?: Date;
  }>): Promise<number> {
    const result = await prisma.news.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  async getLastUpdate(): Promise<Date | null> {
    const lastNews = await prisma.news.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    });
    return lastNews?.updatedAt || null;
  }
}

export const newsRepository = new NewsRepository();

