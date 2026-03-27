import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const brands = await this.prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return { data: brands };
  }

  async findOne(slug: string) {
    return this.prisma.brand.findUnique({
      where: { slug },
      include: {
        products: {
          take: 20,
          where: { available: true },
        },
      },
    });
  }

  async create(createBrandDto: CreateBrandDto) {
    return this.prisma.brand.create({
      data: createBrandDto,
    });
  }
}
