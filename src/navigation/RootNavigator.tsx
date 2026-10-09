import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import { CompareScreen } from '../screens/CompareScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HelpScreen } from '../screens/HelpScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PrivacyScreen, TermsScreen } from '../screens/LegalScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PremiumScreen } from '../screens/PremiumScreen';
import { PreferencesScreen } from '../screens/PreferencesScreen';
import { ProductScreen } from '../screens/ProductScreen';
import { ReportProductScreen } from '../screens/ReportProductScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { ScanHistoryScreen } from '../screens/ScanHistoryScreen';
import { SelectSavedScreen } from '../screens/SelectSavedScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { colors } from '../theme';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function RootNavigator() {
  const { passwordRecovery } = useAuth();

  useEffect(() => {
    if (passwordRecovery && navigationRef.isReady()) {
      navigationRef.navigate('ResetPassword');
    }
  }, [passwordRecovery]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="Scanner" component={ScannerScreen} />
        <Stack.Screen name="Product" component={ProductScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="ScanHistory" component={ScanHistoryScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
        <Stack.Screen name="Preferences" component={PreferencesScreen} />
        <Stack.Screen name="Premium" component={PremiumScreen} />
        <Stack.Screen name="Compare" component={CompareScreen} />
        <Stack.Screen name="SelectSaved" component={SelectSavedScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="ReportProduct" component={ReportProductScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
