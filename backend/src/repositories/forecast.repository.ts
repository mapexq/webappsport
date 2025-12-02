import { prisma } from '../lib/prisma.js';
import type { Forecast } from '@prisma/client';

export class ForecastRepository {
  async findAll(): Promise<Forecast[]> {
    return prisma.forecast.findMany({
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Forecast | null> {
    return prisma.forecast.findUnique({
      where: { id },
    });
  }

  async create(data: {
    eventName: string;
    sport: string;
    tournament?: string;
    match?: string;
    expertName: string;
    expertAvatarUrl?: string;
    expertLevel?: string;
    expertStatus?: string;
    odds?: number;
    pick: string;
    prediction?: string;
    winrate?: number;
    comment?: string;
    fullText?: string;
    sourceName?: string;
    sourceUrl?: string;
    publishedAt?: Date;
  }): Promise<Forecast> {
    return prisma.forecast.create({
      data,
    });
  }

  async update(
    id: string,
    data: Partial<{
      eventName: string;
      sport: string;
      tournament: string;
      expertName: string;
      expertAvatarUrl: string;
      expertLevel: string;
      odds: number;
      pick: string;
      comment: string;
      sourceName: string;
      sourceUrl: string;
      publishedAt: Date;
    }>
  ): Promise<Forecast> {
    return prisma.forecast.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.forecast.delete({
      where: { id },
    });
  }

  async deleteAll(): Promise<void> {
    await prisma.forecast.deleteMany({});
  }

  async createMany(data: Array<{
    eventName: string;
    sport: string;
    tournament?: string;
    match?: string;
    expertName: string;
    expertAvatarUrl?: string;
    expertLevel?: string;
    expertStatus?: string;
    odds?: number;
    pick: string;
    prediction?: string;
    winrate?: number;
    comment?: string;
    fullText?: string;
    sourceName?: string;
    sourceUrl?: string;
    publishedAt?: Date;
  }>): Promise<number> {
    const result = await prisma.forecast.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  async findTop(count: number = 10): Promise<Forecast[]> {
    return prisma.forecast.findMany({
      take: count,
      orderBy: { publishedAt: 'desc' },
    });
  }
}

export const forecastRepository = new ForecastRepository();

