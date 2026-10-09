import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Product } from './product';

export type RootStackParamList = {
  Home: undefined;
  Onboarding: undefined;
  Privacy: undefined;
  Terms: undefined;
  Scanner: { openManual?: boolean; requestId?: number; compareSlot?: 'a' | 'b'; reuseProduct?: Product } | undefined;
  Product: { product: Product; fromCache?: boolean };
  Profile: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ResetPassword: undefined;
  ScanHistory: undefined;
  Favorites: undefined;
  Preferences: undefined;
  Premium: undefined;
  Compare: { incomingSlot?: 'a' | 'b'; incomingProduct?: Product; requestId?: number } | undefined;
  SelectSaved: { slot: 'a' | 'b' };
  Search: undefined;
  Help: undefined;
  ReportProduct: { productName: string; sourceUrl: string };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;
export type PrivacyScreenProps = NativeStackScreenProps<RootStackParamList, 'Privacy'>;
export type TermsScreenProps = NativeStackScreenProps<RootStackParamList, 'Terms'>;
export type ScannerScreenProps = NativeStackScreenProps<RootStackParamList, 'Scanner'>;
export type ProductScreenProps = NativeStackScreenProps<RootStackParamList, 'Product'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;
export type SignInScreenProps = NativeStackScreenProps<RootStackParamList, 'SignIn'>;
export type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;
export type ResetPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;
export type ScanHistoryScreenProps = NativeStackScreenProps<RootStackParamList, 'ScanHistory'>;
export type FavoritesScreenProps = NativeStackScreenProps<RootStackParamList, 'Favorites'>;
export type PreferencesScreenProps = NativeStackScreenProps<RootStackParamList, 'Preferences'>;
export type PremiumScreenProps = NativeStackScreenProps<RootStackParamList, 'Premium'>;
export type CompareScreenProps = NativeStackScreenProps<RootStackParamList, 'Compare'>;
export type SelectSavedScreenProps = NativeStackScreenProps<RootStackParamList, 'SelectSaved'>;
export type SearchScreenProps = NativeStackScreenProps<RootStackParamList, 'Search'>;
export type HelpScreenProps = NativeStackScreenProps<RootStackParamList, 'Help'>;
export type ReportProductScreenProps = NativeStackScreenProps<RootStackParamList, 'ReportProduct'>;
