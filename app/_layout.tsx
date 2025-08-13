import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { Audio } from 'expo-av';
import { MixProvider } from '../contexts/MixContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Keep the splash visible until we decide to hide
SplashScreen.preventAutoHideAsync();

export const ErrorBoundary = (props) => {
  useFonts(FontAwesome.font);
  return <Text>{props.error?.toString() ?? 'Error'}</Text>;
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
                                   ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: true,
    });
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <MixProvider>
    <ThemeWrapper>
    <Stack>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
    </ThemeWrapper>
    </MixProvider>
    </GestureHandlerRootView>
  );
}

function ThemeWrapper({ children }) {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    {children}
    </ThemeProvider>
  );
}
