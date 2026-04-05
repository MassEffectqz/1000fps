import { describe, it, expect } from 'vitest';
import {
  orderStatusSchema,
  paymentStatusSchema,
  updateOrderSchema,
  ordersQuerySchema,
} from '@/lib/validations/order';

describe('Order Validations', () => {
  describe('orderStatusSchema', () => {
    it('должен принимать все валидные статусы заказов', () => {
      const validStatuses = ['PENDING', 'CONFIRMED', 'PAID', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
      
      validStatuses.forEach((status) => {
        expect(() => orderStatusSchema.parse(status)).not.toThrow();
      });
    });

    it('должен отклонять невалидные статусы', () => {
      expect(() => orderStatusSchema.parse('INVALID_STATUS')).toThrow();
    });
  });

  describe('paymentStatusSchema', () => {
    it('должен принимать все валидные статусы оплаты', () => {
      const validStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
      
      validStatuses.forEach((status) => {
        expect(() => paymentStatusSchema.parse(status)).not.toThrow();
      });
    });

    it('должен отклонять невалидные статусы оплаты', () => {
      expect(() => paymentStatusSchema.parse('INVALID')).toThrow();
    });
  });

  describe('updateOrderSchema', () => {
    it('должен принимать валидные данные для обновления заказа', () => {
      const validData = {
        status: 'PAID',
        paymentStatus: 'PAID',
        deliveryAddress: 'Москва, ул. Пушкина, д. 10',
        notes: 'Срочный заказ',
        trackingNumber: 'TRACK123456',
      };

      const result = updateOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен принимать частичные данные', () => {
      const partialData = {
        status: 'SHIPPING',
      };

      const result = updateOrderSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять невалидный статус', () => {
      const invalidData = {
        status: 'INVALID_STATUS',
      };

      const result = updateOrderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('должен принимать discount и deliveryCost как числа', () => {
      const data = {
        discount: 100,
        deliveryCost: 500,
      };

      const result = updateOrderSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('должен отклонять отрицательный discount', () => {
      const data = {
        discount: -100,
      };

      const result = updateOrderSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('ordersQuerySchema', () => {
    it('должен принимать валидные query параметры', () => {
      const validData = {
        page: '1',
        limit: '20',
        status: 'PAID',
        paymentStatus: 'PAID',
        search: 'ORDER123',
      };

      const result = ordersQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен принимать параметры с дефолтными значениями', () => {
      const emptyData = {};

      const result = ordersQuerySchema.safeParse(emptyData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe('1');
        expect(result.data.limit).toBe('20');
      }
    });

    it('должен отклонять page меньше 1', () => {
      const data = { page: 0 };

      const result = ordersQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('должен отклонять limit больше 100', () => {
      const data = { limit: 101 };

      const result = ordersQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
