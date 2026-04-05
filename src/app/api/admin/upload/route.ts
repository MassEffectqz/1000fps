import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { randomBytes } from 'crypto';

// Конфигурация
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads');

/**
 * POST /api/admin/upload
 * Загрузка изображения на сервер
 *
 * Request: FormData с file и productId
 * Response: { success: true, url: string, fileName: string }
 * (защищено middleware — только ADMIN/MANAGER)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;

    // Валидация
    if (!file) {
      return NextResponse.json(
        { error: 'Файл не передан' },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'productId обязателен' },
        { status: 400 }
      );
    }

    // Проверка размера
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Размер файла не должен превышать ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Проверка типа файла
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Разрешены только изображения (JPEG, PNG, WebP, GIF)' },
        { status: 400 }
      );
    }

    // Создаём путь к папке товара
    const productDir = join(UPLOAD_DIR, 'products', productId);
    await mkdir(productDir, { recursive: true });

    // Генерируем уникальное имя файла с сохранением расширения
    const extension = file.name.split('.').pop() || 'jpg';
    const randomId = randomBytes(4).toString('hex');
    const fileName = `${Date.now()}-${randomId}.${extension}`;
    const filePath = join(productDir, fileName);

    // Читаем файл
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Оптимизация изображения с помощью sharp
    let optimizedBuffer: Buffer;
    try {
      optimizedBuffer = await sharp(buffer)
        .resize({
          width: 1920,
          height: 1920,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFormat(extension as 'jpg' | 'png' | 'webp', {
          quality: 85,
          compressionLevel: 6,
        })
        .toBuffer();
    } catch (sharpError) {
      // Если sharp не справился, используем оригинал
      console.warn('Sharp optimization failed, using original:', sharpError);
      optimizedBuffer = buffer;
    }

    // Записываем файл на диск
    await writeFile(filePath, optimizedBuffer);

    // Возвращаем URL для доступа к изображению
    const imageUrl = `/uploads/products/${productId}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      fileName: fileName,
      size: optimizedBuffer.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке изображения' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/upload
 * Удаление изображения
 *
 * Query params: url (URL изображения), productId (опционально), all (удалить все)
 * (защищено middleware — только ADMIN/MANAGER)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const productId = searchParams.get('productId');
    const deleteAll = searchParams.get('all') === 'true';

    // Удаление всех изображений товара
    if (deleteAll && productId) {
      const productDir = join(UPLOAD_DIR, 'products', productId);
      
      try {
        await rm(productDir, { recursive: true, force: true });
        return NextResponse.json({ success: true, message: 'Все изображения удалены' });
      } catch (error) {
        console.error('Failed to delete product directory:', error);
        return NextResponse.json({ success: true, message: 'Директория не найдена' });
      }
    }

    // Удаление одного изображения
    if (imageUrl) {
      // Проверяем что URL начинается с /uploads/products/
      if (!imageUrl.startsWith('/uploads/products/')) {
        // Это не наше изображение, просто возвращаем успех
        return NextResponse.json({ success: true, message: 'Not a managed image' });
      }

      // Извлекаем путь из URL
      const urlPath = imageUrl.replace('/uploads/products/', '');
      const [prodId, fileName] = urlPath.split('/');

      if (!prodId || !fileName) {
        return NextResponse.json(
          { error: 'Некорректный URL изображения' },
          { status: 400 }
        );
      }

      const filePath = join(UPLOAD_DIR, 'products', prodId, fileName);

      try {
        await rm(filePath);
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Failed to delete file:', error);
        return NextResponse.json({ success: true, message: 'Файл не найден' });
      }
    }

    return NextResponse.json(
      { error: 'Необходимо указать url или productId с all=true' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении изображения' },
      { status: 500 }
    );
  }
}
