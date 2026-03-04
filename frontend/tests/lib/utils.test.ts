import { cn, formatDate, formatCurrency } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });
});

describe('formatCurrency', () => {
  it('formats USD currency correctly', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1,234.56');
  });
});
