import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { ReadyBuildsClient } from './ready-builds-client';

export const metadata: Metadata = {
  title: 'Готовые сборки ПК — 1000fps',
  description: 'Готовые компьютеры для игр, работы и творчества. Собраны и протестированы нашими специалистами.',
};

interface ReadyBuild {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  description: string | null;
  specs: Array<{ name: string; value: string }>;
  badge: string | null;
  inStock: boolean;
  stockCount: number;
}

export default async function ReadyBuildsPage() {
  try {
    // Загружаем товары с флагом isFeatured или из категории "Готовые сборки"
    const builds = await prisma.product.findMany({
      where: {
        isActive: true,
        isDraft: false,
        isFeatured: true, // Используем isFeatured для готовых сборок
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        oldPrice: true,
        description: true,
        stock: true,
        images: {
          where: { isMain: true },
          select: { url: true },
          take: 1,
        },
        isFeatured: true,
        isNew: true,
        isHit: true,
      },
      orderBy: { price: 'asc' },
    });

    const formattedBuilds: ReadyBuild[] = builds.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      price: Number(b.price),
      oldPrice: b.oldPrice ? Number(b.oldPrice) : null,
      image: b.images[0]?.url || null,
      description: b.description,
      specs: [], // TODO: добавить спецификации когда будет отношение
      badge: b.isNew ? 'new' : b.isHit ? 'hit' : null,
      inStock: (b.stock || 0) > 0,
      stockCount: b.stock || 0,
    }));

    return <ReadyBuildsClient builds={formattedBuilds} />;
  } catch (error) {
    console.error('Error loading ready builds:', error);
    return <ReadyBuildsClient builds={[]} />;
  }
}
