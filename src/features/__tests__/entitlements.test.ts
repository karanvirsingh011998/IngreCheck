import {
  canUseExtendedHistory,
  readPremiumMode,
  showsPremiumScreen,
  visibleHistoryCap,
  FREE_HISTORY_LIMIT,
} from '../../features/entitlements';

describe('premium modes', () => {
  it('treats a missing or unknown value as disabled', () => {
    expect(readPremiumMode(undefined)).toBe('disabled');
    expect(readPremiumMode('yes')).toBe('disabled');
  });

  it('hides premium tools when disabled', () => {
    expect(showsPremiumScreen('disabled')).toBe(false);
    expect(canUseExtendedHistory('disabled')).toBe(false);
  });

  it('unlocks extended history only in demo mode', () => {
    expect(canUseExtendedHistory('demo')).toBe(true);
    expect(visibleHistoryCap('demo')).toBeNull();
  });

  it('keeps the free history limit in production', () => {
    expect(showsPremiumScreen('production')).toBe(true);
    expect(canUseExtendedHistory('production')).toBe(false);
    expect(visibleHistoryCap('production')).toBe(FREE_HISTORY_LIMIT);
  });
});
