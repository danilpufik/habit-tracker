import { parseDateKey, toDateKey } from '../date';

describe('parseDateKey', () => {
  it('round-trips with toDateKey', () => {
    expect(toDateKey(parseDateKey('2026-08-14'))).toBe('2026-08-14');
    expect(toDateKey(parseDateKey('2026-01-01'))).toBe('2026-01-01');
    expect(toDateKey(parseDateKey('2026-12-31'))).toBe('2026-12-31');
  });

  it('parses to local midnight, not shifted by UTC offset', () => {
    const date = parseDateKey('2026-03-15');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2); // 0-indexed
    expect(date.getDate()).toBe(15);
    expect(date.getHours()).toBe(0);
  });
});
