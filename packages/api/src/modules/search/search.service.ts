import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, limit: number = 20) {
    if (!query || query.length < 2) {
      return { data: [], suggestions: [] };
    }

    // Поиск по названию и SKU
    const products = await this.prisma.product.findMany({
      where: {
        AND: [
          { available: true },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { sku: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        brand: true,
        category: true,
      },
      take: limit,
    });

    // Получить подсказки
    const suggestions = await this.getSuggestions(query);

    return {
      data: products,
      suggestions,
      pagination: {
        total: products.length,
        limit,
      },
    };
  }

  async getSuggestions(query: string) {
    if (!query || query.length < 2) {
      return [];
    }

    // Уникальные названия товаров
    const products = await this.prisma.product.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
        available: true,
      },
      select: { name: true },
      take: 5,
      distinct: ['name'],
    });

    return products.map((p) => p.name);
  }
}
