import React, { useEffect } from 'react';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import { LibraryProvider } from '../context/LibraryContext';
import { Palette } from '../constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Palette.bg,
    card: Palette.surface,
    text: Palette.text,
    border: Palette.border,
    primary: Palette.primary,
  },
};

export default function RootLayout() {
  useEffect(() => {
    // Dynamically unlock orientation to allow full-screen landscape and portrait rotation
    ScreenOrientation.unlockAsync().catch((err) => {
      console.warn('ScreenOrientation unlock error:', err);
    });
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <LibraryProvider>
        <ThemeProvider value={CustomLightTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Palette.bg, flex: 1 },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Library Options',
                headerStyle: { backgroundColor: Palette.surface },
                headerTintColor: Palette.text,
              }}
            />
          </Stack>
          <StatusBar style="dark" />
        </ThemeProvider>
      </LibraryProvider>
    </SafeAreaProvider>
  );
}
