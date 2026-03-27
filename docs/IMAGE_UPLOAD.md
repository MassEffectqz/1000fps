# 📸 Загрузка изображений товаров

## Реализованный функционал

### Frontend (Admin Panel)

**Файлы:**
- `apps/admin/src/app/products/page.tsx` — страница управления товарами
- `apps/admin/src/lib/api.ts` — API клиент

**Возможности:**
1. ✅ Выбор нескольких изображений через клик по upload-zone
2. ✅ Drag & Drop (требуется дополнительная реализация)
3. ✅ Preview загружаемых изображений
4. ✅ Удаление изображений из preview
5. ✅ Отправка на сервер при сохранении товара

**Использование:**
```typescript
// Выбор изображений
const handleImageSelect = (files: FileList | null) => {
  if (!files) return;
  const newFiles = Array.from(files);
  setSelectedImages((prev) => [...prev, ...newFiles]);
  
  // Создаем preview
  newFiles.forEach((file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviews((prev) => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
  });
};

// Загрузка на сервер
const uploadResult = await productsApi.uploadImages(selectedImages);
// uploadResult.urls = ['/uploads/products/1234567890-abc.jpg', ...]
```

---

### Backend (NestJS API)

**Файлы:**
- `packages/api/src/modules/products/products.controller.ts` — контроллер
- `packages/api/src/main.ts` — настройка статических файлов

**Endpoint:**
```
POST /api/v1/products/upload-images
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
  images: File[] (до 10 файлов)
```

**Ответ:**
```json
{
  "urls": [
    "/uploads/products/1711234567890-123456789.jpg",
    "/uploads/products/1711234567890-987654321.png"
  ]
}
```

**Настройки загрузки:**
- Максимум файлов: 10
- Поддерживаемые форматы: jpg, jpeg, png, gif, webp
- Папка загрузок: `./uploads/products`
- URL для доступа: `http://localhost:3001/uploads/products/<filename>`

---

## Настройка

### 1. Установка зависимостей (если не установлены)

```bash
cd packages/api
pnpm add @nestjs/platform-express multer
pnpm add -D @types/multer
```

### 2. Создание папки для загрузок

```bash
mkdir -p packages/api/uploads/products
```

### 3. Настройка CORS (если нужно)

В `packages/api/.env`:
```env
CORS_ORIGIN="http://localhost:3000,http://localhost:3002"
```

---

## Интеграция с существующими DTO

### Обновление CreateProductDto

```typescript
// packages/api/src/modules/products/dto/create-product.dto.ts

export class CreateProductDto {
  // ... существующие поля
  
  @ApiPropertyOptional({ type: [String] })
  images?: string[];
}
```

### Обновление UpdateProductDto

```typescript
// packages/api/src/modules/products/dto/update-product.dto.ts

export class UpdateProductDto {
  // ... существующие поля
  
  @ApiPropertyOptional({ type: [String] })
  images?: string[];
}
```

---

## Пример использования в форме

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const formData = new FormData(e.target as HTMLFormElement);
  const data: Record<string, unknown> = {
    name: formData.get('name'),
    sku: formData.get('sku'),
    // ... другие поля
  };

  try {
    // 1. Загружаем изображения
    let imageUrls: string[] = [];
    if (selectedImages.length > 0) {
      const uploadResult = await productsApi.uploadImages(selectedImages);
      imageUrls = uploadResult.urls || [];
    }

    // 2. Сохраняем товар с URL изображений
    if (editingProduct) {
      await productsApi.update(editingProduct.id as number, {
        ...data,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });
    } else {
      await productsApi.create({
        ...data,
        images: imageUrls,
      });
    }

    // 3. Очищаем и обновляем кэш
    setShowModal(false);
    setSelectedImages([]);
    setImagePreviews([]);
    queryClient.invalidateQueries({ queryKey: ['products'] });
  } catch (error) {
    console.error('Failed to save product:', error);
    alert('Ошибка при сохранении товара');
  }
};
```

---

## Безопасность

### Ограничения

1. **Максимальный размер файла**: настройте в `FilesInterceptor`:
   ```typescript
   limits: {
     fileSize: 5 * 1024 * 1024, // 5MB
   }
   ```

2. **Фильтрация MIME-типов**: уже реализована
   ```typescript
   fileFilter: (req, file, callback) => {
     if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
       return callback(new Error('Only image files are allowed!'), false);
     }
     callback(null, true);
   }
   ```

3. **Валидация имени файла**: уже реализована через `filename`
   ```typescript
   filename: (req, file, callback) => {
     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
     const ext = extname(file.originalname);
     callback(null, `${uniqueSuffix}${ext}`);
   }
   ```

---

## S3/Cloud Storage (Опционально)

Для production рекомендуется использовать S3-совместимое хранилище:

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';

const s3 = new S3Client({
  region: 'ru-central1',
  endpoint: 'https://storage.yandexcloud.net',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});

@Post('upload-images')
@UseInterceptors(
  FilesInterceptor('images', 10, {
    storage: multerS3({
      s3: s3,
      bucket: 'site-1000fps-products',
      key: (req, file, callback) => {
        const filename = `${Date.now()}-${file.originalname}`;
        callback(null, filename);
      },
    }),
  }),
)
async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
  const urls = files.map((file) => file.location); // S3 возвращает полный URL
  return { urls };
}
```

---

## Troubleshooting

### Ошибка: "Only image files are allowed!"

**Причина:** Попытка загрузить файл не поддерживаемого формата.

**Решение:** Проверьте, что файл имеет расширение .jpg, .jpeg, .png, .gif или .webp.

---

### Ошибка: "Request entity too large"

**Причина:** Размер файлов превышает лимит.

**Решение:** Увеличьте лимит в настройках:
```typescript
FilesInterceptor('images', 10, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
})
```

---

### Изображения не отображаются

**Причина 1:** Не настроено обслуживание статических файлов.

**Решение:** Убедитесь, что в `main.ts` есть:
```typescript
app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: '/uploads/',
});
```

**Причина 2:** Неправильный URL.

**Решение:** URL должен быть вида `/uploads/products/<filename>`, а не полный путь к файлу.

---

## Метрики

- **Время загрузки:** ~100-500ms на изображение (зависит от размера)
- **Максимальный размер:** 5MB на файл (настраивается)
- **Количество:** до 10 изображений за раз
