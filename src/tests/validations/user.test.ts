import { describe, it, expect } from 'vitest';
import {
  userRoleSchema,
  userLevelSchema,
  updateUserSchema,
  usersQuerySchema,
} from '@/lib/validations/user';

describe('User Validations', () => {
  describe('userRoleSchema', () => {
    it('должен принимать все валидные роли', () => {
      const validRoles = ['CUSTOMER', 'ADMIN', 'MANAGER'];
      
      validRoles.forEach((role) => {
        expect(() => userRoleSchema.parse(role)).not.toThrow();
      });
    });

    it('должен отклонять невалидные роли', () => {
      expect(() => userRoleSchema.parse('INVALID_ROLE')).toThrow();
    });
  });

  describe('userLevelSchema', () => {
    it('должен принимать все валидные уровни', () => {
      const validLevels = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
      
      validLevels.forEach((level) => {
        expect(() => userLevelSchema.parse(level)).not.toThrow();
      });
    });

    it('должен отклонять невалидные уровни', () => {
      expect(() => userLevelSchema.parse('INVALID_LEVEL')).toThrow();
    });
  });

  describe('updateUserSchema', () => {
    it('должен принимать валидные данные для обновления пользователя', () => {
      const validData = {
        name: 'Иван Иванов',
        phone: '+7 (999) 123-45-67',
        role: 'MANAGER',
        level: 'GOLD',
        emailVerified: true,
      };

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен принимать частичные данные', () => {
      const partialData = {
        name: 'Новое Имя',
      };

      const result = updateUserSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('должен принимать null для name и phone', () => {
      const data = {
        name: null,
        phone: null,
      };

      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('должен принимать avatar как URL', () => {
      const data = {
        avatar: 'https://example.com/avatar.jpg',
      };

      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('usersQuerySchema', () => {
    it('должен принимать валидные query параметры', () => {
      const validData = {
        page: 2,
        limit: 50,
        role: 'ADMIN',
        level: 'GOLD',
        search: 'test@example.com',
      };

      const result = usersQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен использовать значения по умолчанию', () => {
      const result = usersQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('должен принимать null для role и level', () => {
      const data = {
        role: null,
        level: null,
      };

      const result = usersQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('должен отклонять page меньше 1', () => {
      const data = { page: 0 };

      const result = usersQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('должен отклонять limit больше 100', () => {
      const data = { limit: 150 };

      const result = usersQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
