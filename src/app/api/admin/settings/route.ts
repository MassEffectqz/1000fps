import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Схема валидации настроек
const settingsSchema = z.object({
  // Общие настройки
  storeName: z.string().optional(),
  storeEmail: z.string().email().optional().nullable(),
  storePhone: z.string().optional().nullable(),
  storeAddress: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  faviconUrl: z.string().url().optional().nullable(),
  
  // SEO
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
  
  // Соцсети
  socialVk: z.string().optional().nullable(),
  socialTelegram: z.string().optional().nullable(),
  socialYoutube: z.string().optional().nullable(),
  
  // Настройки заказов
  defaultOrderStatus: z.enum(['PENDING', 'CONFIRMED']).optional(),
  defaultPaymentStatus: z.enum(['PENDING', 'PAID']).optional(),
  autoConfirmOrders: z.boolean().optional(),
  allowGuestCheckout: z.boolean().optional(),
  
  // Доставка
  freeShippingThreshold: z.number().optional().nullable(),
  defaultDeliveryCost: z.number().optional().nullable(),
  
  // Налоги
  taxRate: z.number().min(0).max(100).optional().nullable(),
  taxIncluded: z.boolean().optional(),
  
  // Уведомления
  notifyNewOrderEmail: z.string().email().optional().nullable(),
  notifyLowStockThreshold: z.number().min(0).optional().nullable(),
  enableEmailNotifications: z.boolean().optional(),
  enableSmsNotifications: z.boolean().optional(),
  
  // SMTP (для email уведомлений)
  smtpHost: z.string().optional().nullable(),
  smtpPort: z.number().optional().nullable(),
  smtpUser: z.string().optional().nullable(),
  smtpPassword: z.string().optional().nullable(),
  smtpFrom: z.string().optional().nullable(),
});

// GET /api/admin/settings - получить настройки
// (защищено middleware — только ADMIN/MANAGER)
export async function GET() {
  try {
    // Временная заглушка - в реальности настройки хранятся в отдельной таблице
    // или в виде JSON документа
    const defaultSettings = {
      // Общие
      storeName: '1000FPS',
      storeEmail: 'info@1000fps.ru',
      storePhone: '+7 (999) 000-00-00',
      storeAddress: 'Россия, Москва',
      logoUrl: null,
      faviconUrl: null,
      
      // SEO
      seoTitle: '1000FPS — Интернет-магазин компьютерной техники',
      seoDescription: 'Видеокарты, процессоры, материнские платы и другие комплектующие',
      seoKeywords: 'видеокарты, процессоры, компьютерные комплектующие',
      
      // Соцсети
      socialVk: null,
      socialTelegram: null,
      socialYoutube: null,
      
      // Заказы
      defaultOrderStatus: 'PENDING' as const,
      defaultPaymentStatus: 'PENDING' as const,
      autoConfirmOrders: false,
      allowGuestCheckout: true,
      
      // Доставка
      freeShippingThreshold: 50000,
      defaultDeliveryCost: 500,
      
      // Налоги
      taxRate: 20,
      taxIncluded: true,
      
      // Уведомления
      notifyNewOrderEmail: 'orders@1000fps.ru',
      notifyLowStockThreshold: 5,
      enableEmailNotifications: true,
      enableSmsNotifications: false,
      
      // SMTP
      smtpHost: null,
      smtpPort: null,
      smtpUser: null,
      smtpPassword: null,
      smtpFrom: null,
    };

    return NextResponse.json(defaultSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - обновить настройки
// (защищено middleware — только ADMIN/MANAGER)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    // В реальности здесь было бы сохранение в БД
    // await prisma.settings.upsert({ ... })
    
    // Логируем изменение настроек
    await prisma.activityLog.create({
      data: {
        action: 'SETTINGS_UPDATE',
        entity: 'Settings',
        details: { updated: true } as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Настройки сохранены',
      settings: validatedData 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
