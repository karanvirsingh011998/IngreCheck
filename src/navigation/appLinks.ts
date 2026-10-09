import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types/navigation';

export type AppDestination =
  | 'Home'
  | 'SignUp'
  | 'SignIn'
  | 'Scanner'
  | 'Compare'
  | 'Favorites'
  | 'ScanHistory'
  | 'Preferences'
  | 'Profile'
  | 'Search';

export type AppLink = {
  label: string;
  destination: AppDestination;
};

export const signedOutMenuLinks: AppLink[] = [
  { label: 'Sign up', destination: 'SignUp' },
  { label: 'Log in', destination: 'SignIn' },
  { label: 'Scan', destination: 'Scanner' },
  { label: 'Search', destination: 'Search' },
  { label: 'Compare', destination: 'Compare' },
];

export const signedInMenuLinks: AppLink[] = [
  { label: 'Dashboard', destination: 'Home' },
  { label: 'Scan', destination: 'Scanner' },
  { label: 'Search', destination: 'Search' },
  { label: 'Compare', destination: 'Compare' },
  { label: 'Favorites', destination: 'Favorites' },
  { label: 'Scan history', destination: 'ScanHistory' },
  { label: 'Ingredient preferences', destination: 'Preferences' },
  { label: 'Profile', destination: 'Profile' },
];

export const signedOutFooterLinks: AppLink[] = [
  { label: 'Sign up', destination: 'SignUp' },
  { label: 'Log in', destination: 'SignIn' },
  { label: 'Scan', destination: 'Scanner' },
];

export const signedInFooterLinks: AppLink[] = [
  { label: 'Scan', destination: 'Scanner' },
  { label: 'Compare', destination: 'Compare' },
  { label: 'Favorites', destination: 'Favorites' },
  { label: 'History', destination: 'ScanHistory' },
  { label: 'Profile', destination: 'Profile' },
];

export const dashboardLinks: AppLink[] = [
  { label: 'Scan', destination: 'Scanner' },
  { label: 'Search', destination: 'Search' },
  { label: 'Compare', destination: 'Compare' },
  { label: 'Favorites', destination: 'Favorites' },
  { label: 'Scan history', destination: 'ScanHistory' },
  { label: 'Ingredient preferences', destination: 'Preferences' },
  { label: 'Profile', destination: 'Profile' },
];

const DASHBOARD_DETAILS: Record<AppDestination, string> = {
  Home: 'Your saved tools.',
  SignUp: 'Create an optional account.',
  SignIn: 'Open your optional account.',
  Scanner: 'Read a packaged food barcode.',
  Search: 'Find a product by name or brand.',
  Compare: 'Place two products side by side.',
  Favorites: 'Products you saved.',
  ScanHistory: 'Products you opened while signed in.',
  Preferences: 'Ingredients you want to avoid or monitor.',
  Profile: 'Your account and saved counts.',
};

export function dashboardDetail(destination: AppDestination): string {
  return DASHBOARD_DETAILS[destination];
}

export function openAppDestination(
  navigation: NativeStackNavigationProp<RootStackParamList>,
  destination: AppDestination,
): void {
  switch (destination) {
    case 'Home':
      navigation.navigate('Home');
      return;
    case 'SignUp':
      navigation.navigate('SignUp');
      return;
    case 'SignIn':
      navigation.navigate('SignIn');
      return;
    case 'Scanner':
      navigation.navigate('Scanner', { requestId: Date.now() });
      return;
    case 'Search':
      navigation.navigate('Search');
      return;
    case 'Compare':
      navigation.navigate('Compare');
      return;
    case 'Favorites':
      navigation.navigate('Favorites');
      return;
    case 'ScanHistory':
      navigation.navigate('ScanHistory');
      return;
    case 'Preferences':
      navigation.navigate('Preferences');
      return;
    case 'Profile':
      navigation.navigate('Profile');
      return;
  }
}
