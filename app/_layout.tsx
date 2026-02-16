import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

function LoadWebFont() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.textContent = `
      [role="tab"]:hover,
      [role="tab"]:hover * ,
      a[href]:hover [data-testid],
      [role="tablist"] > *:hover,
      [role="tablist"] > *:hover * {
        color: #4ade80 !important;
        transition: color 0.2s ease;
      }
      [role="tab"]:hover svg,
      [role="tablist"] > *:hover svg {
        fill: #4ade80 !important;
        transition: fill 0.2s ease;
      }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LoadWebFont />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
