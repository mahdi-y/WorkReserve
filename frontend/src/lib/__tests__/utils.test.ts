import { cn } from '../utils';

describe('Utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('btn', 'btn-primary');
      expect(result).toBe('btn btn-primary');
    });

    it('should handle conditional classes', () => {
      const result = cn('btn', true && 'btn-primary', false && 'btn-secondary');
      expect(result).toBe('btn btn-primary');
    });

    it('should handle arrays and objects', () => {
      const result = cn(['btn', 'btn-sm'], { 'btn-active': true, 'btn-disabled': false });
      expect(result).toBe('btn btn-sm btn-active');
    });

    it('should merge conflicting Tailwind classes', () => {
      const result = cn('px-2 py-1', 'p-3');
      expect(result).toBe('p-3');
    });

    it('should handle empty inputs', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle null and undefined values', () => {
      const result = cn('btn', null, undefined, 'btn-primary');
      expect(result).toBe('btn btn-primary');
    });
  });
});