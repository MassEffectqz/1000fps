import { describe, it, expect } from 'vitest';
import {
  warehouseSchema,
  createWarehouseSchema,
  updateWarehouseSchema,
  warehouseQuerySchema,
} from '@/lib/validations/warehouse';

describe('Warehouse Validations', () => {
  describe('warehouseSchema', () => {
    it('должен принимать валидные данные склада', () => {
      const validData = {
        id: 'warehouse_123',
        name: 'Основной склад',
        city: 'Москва',
        address: 'ул. Складская, д. 1',
        phone: '+7 (495) 123-45-67',
        isActive: true,
      };

      const result = warehouseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен требовать name, city, address', () => {
      const invalidData = {
        name: '',
        city: '',
        address: '',
      };

      const result = warehouseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createWarehouseSchema', () => {
    it('должен принимать валидные данные для создания склада', () => {
      const validData = {
        name: 'Новый склад',
        city: 'Санкт-Петербург',
        address: 'пр. Невский, д. 10',
        phone: '+7 (812) 987-65-43',
        isActive: true,
      };

      const result = createWarehouseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен принимать без phone', () => {
      const data = {
        name: 'Склад',
        city: 'Казань',
        address: 'ул. Пушкина',
      };

      const result = createWarehouseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('должен отклонять пустое название', () => {
      const data = {
        name: '',
        city: 'Москва',
        address: 'ул. Test',
      };

      const result = createWarehouseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('updateWarehouseSchema', () => {
    it('должен принимать частичные данные для обновления', () => {
      const partialData = {
        name: 'Обновлённое название',
      };

      const result = updateWarehouseSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('должен принимать isActive', () => {
      const data = {
        isActive: false,
      };

      const result = updateWarehouseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('должен принимать null для phone', () => {
      const data = {
        phone: null,
      };

      const result = updateWarehouseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('warehouseQuerySchema', () => {
    it('должен принимать валидные query параметры', () => {
      const validData = {
        page: '1',
        limit: '20',
        city: 'Москва',
        isActive: 'true',
        search: 'склад',
      };

      const result = warehouseQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен использовать значения по умолчанию', () => {
      const result = warehouseQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('должен принимать только city', () => {
      const data = {
        city: 'Санкт-Петербург',
      };

      const result = warehouseQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('должен принимать только isActive', () => {
      const data = {
        isActive: 'false',
      };

      const result = warehouseQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('должен отклонять page меньше 1', () => {
      const data = { page: '0' };

      const result = warehouseQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('должен отклонять limit больше 100', () => {
      const data = { limit: '200' };

      const result = warehouseQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
