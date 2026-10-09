const mockStore = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: async (key: string) => mockStore.get(key) ?? null,
  setItem: async (key: string, value: string) => {
    mockStore.set(key, value);
  },
}));

import { completeOnboarding, hasCompletedOnboarding, ONBOARDING_STORAGE_KEY } from '../onboarding';

describe('onboarding memory', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  it('shows the introduction until it is completed on this device', async () => {
    await expect(hasCompletedOnboarding()).resolves.toBe(false);
    await completeOnboarding();
    await expect(hasCompletedOnboarding()).resolves.toBe(true);
    expect(mockStore.get(ONBOARDING_STORAGE_KEY)).toBe('1');
  });
});
