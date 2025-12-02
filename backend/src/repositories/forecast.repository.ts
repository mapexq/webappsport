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
    expertName: string;
    expertAvatarUrl?: string;
    expertLevel?: string;
    odds: number;
    pick: string;
    comment?: string;
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
}

export const forecastRepository = new ForecastRepository();

