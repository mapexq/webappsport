import { prisma } from '../lib/prisma.js';
import type { Article } from '@prisma/client';

export class ArticleRepository {
  async findAll(): Promise<Article[]> {
    return prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Article | null> {
    return prisma.article.findUnique({
      where: { id },
    });
  }

  async create(data: {
    title: string;
    level?: string;
    tags: string;
    readTimeMinutes?: number;
    contentShort?: string;
    contentUrl?: string;
  }): Promise<Article> {
    return prisma.article.create({
      data,
    });
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      level: string;
      tags: string;
      readTimeMinutes: number;
      contentShort: string;
      contentUrl: string;
    }>
  ): Promise<Article> {
    return prisma.article.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.article.delete({
      where: { id },
    });
  }
}

export const articleRepository = new ArticleRepository();

