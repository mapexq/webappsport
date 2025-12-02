import { prisma } from '../lib/prisma.js';
import type { Bookmaker } from '@prisma/client';

export class BookmakerRepository {
  async findAll(): Promise<Bookmaker[]> {
    return prisma.bookmaker.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Bookmaker | null> {
    return prisma.bookmaker.findUnique({
      where: { id },
    });
  }

  async create(data: {
    name: string;
    rating: number;
    bonusAmount?: string;
    tags: string;
    features: string;
  }): Promise<Bookmaker> {
    return prisma.bookmaker.create({
      data,
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      rating: number;
      bonusAmount: string;
      tags: string;
      features: string;
    }>
  ): Promise<Bookmaker> {
    return prisma.bookmaker.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.bookmaker.delete({
      where: { id },
    });
  }
}

export const bookmakerRepository = new BookmakerRepository();

