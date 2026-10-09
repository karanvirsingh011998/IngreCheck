import type { ConfigContext, ExpoConfig } from 'expo/config';

const cameraPermission =
  'IngreCheck uses the camera to read product barcodes on your device. Barcode images are not uploaded.';

export default ({ config }: ConfigContext): ExpoConfig => {
  const googleScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;
  const plugins: NonNullable<ExpoConfig['plugins']> = [
    [
      'expo-camera',
      {
        cameraPermission,
        microphonePermission: false,
        recordAudioAndroid: false,
        barcodeScannerEnabled: true,
      },
    ],
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#174C3C',
        image: './assets/splash-icon.png',
        imageWidth: 200,
      },
    ],
    'expo-web-browser',
    'expo-apple-authentication',
  ];

  if (googleScheme?.startsWith('com.googleusercontent.apps.')) {
    plugins.push([
      '@react-native-google-signin/google-signin',
      { iosUrlScheme: googleScheme },
    ]);
  }

  return {
    ...config,
    name: 'IngreCheck',
    slug: 'ingrecheck',
    scheme: 'ingrecheck',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.ingrecheck.app',
      infoPlist: {
        NSCameraUsageDescription: cameraPermission,
      },
    },
    android: {
      package: 'com.ingrecheck.app',
      permissions: ['CAMERA'],
      blockedPermissions: ['android.permission.RECORD_AUDIO'],
      adaptiveIcon: {
        backgroundColor: '#174C3C',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins,
    extra: {
      ...config.extra,
      eas: {
        projectId: 'c4022b4b-f291-4095-938d-0351b4d29e28',
      },
    },
  };
};
