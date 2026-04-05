import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn', () => {
    it('должен объединять классы', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('должен фильтровать falsy значения', () => {
      const result = cn('class1', false, null, undefined, 'class2');
      expect(result).toBe('class1 class2');
    });

    it('должен обрабатывать объекты с условиями', () => {
      const result = cn('base', {
        'active': true,
        'inactive': false,
      });
      expect(result).toContain('base');
      expect(result).toContain('active');
      expect(result).not.toContain('inactive');
    });

    it('должен обрабатывать массивы', () => {
      const result = cn(['class1', 'class2']);
      expect(result).toBe('class1 class2');
    });

    it('должен мержить классы с tailwind-merge', () => {
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toBe('text-blue-500');
    });

    it('должен обрабатывать пустые аргументы', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });
});
