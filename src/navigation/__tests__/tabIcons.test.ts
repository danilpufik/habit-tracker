import { getTabIconName } from '../tabIcons';

describe('getTabIconName', () => {
  it('returns the filled variant when focused', () => {
    expect(getTabIconName('Today', true)).toBe('checkmark-circle');
    expect(getTabIconName('Stats', true)).toBe('stats-chart');
    expect(getTabIconName('Settings', true)).toBe('settings');
  });

  it('returns the outline variant when not focused', () => {
    expect(getTabIconName('Today', false)).toBe('checkmark-circle-outline');
    expect(getTabIconName('Stats', false)).toBe('stats-chart-outline');
    expect(getTabIconName('Settings', false)).toBe('settings-outline');
  });
});
