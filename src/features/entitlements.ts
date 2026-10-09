export type PremiumMode = 'disabled' | 'demo' | 'production';

export const FREE_HISTORY_LIMIT = 50;

export function readPremiumMode(value: string | undefined): PremiumMode {
  if (value === 'demo' || value === 'production' || value === 'disabled') {
    return value;
  }
  return 'disabled';
}

export const premiumMode = readPremiumMode(process.env.EXPO_PUBLIC_PREMIUM_MODE);

export function showsPremiumScreen(mode: PremiumMode): boolean {
  return mode !== 'disabled';
}

/** Demo mode is a local testing switch. Production never treats it as a paid subscription. */
export function canUseExtendedHistory(mode: PremiumMode): boolean {
  return mode === 'demo';
}

export function visibleHistoryCap(mode: PremiumMode): number | null {
  return canUseExtendedHistory(mode) ? null : FREE_HISTORY_LIMIT;
}
