import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { ZillaSlab_600SemiBold, ZillaSlab_700Bold } from '@expo-google-fonts/zilla-slab';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from '@expo-google-fonts/ibm-plex-sans';
import { RootNavigator } from './src/navigation';
import { OnboardingScreen } from './src/screens';
import { AppMark } from './src/components';
import { darkColors } from './src/theme/colors';
import { ThemeProvider, useTheme } from './src/theme';
import { useHabitStore } from './src/store';
import { configureNotificationHandler } from './src/utils/notifications';
import { useTodayRefresh } from './src/hooks/useTodayRefresh';

configureNotificationHandler();
void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Root() {
  const theme = useTheme();
  const hasHydrated = useHabitStore((state) => state.hasHydrated);
  const hasOnboarded = useHabitStore((state) => state.hasOnboarded);
  const [fontsLoaded] = useFonts({
    ZillaSlab_600SemiBold,
    ZillaSlab_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
  });
  useTodayRefresh();

  const isReady = hasHydrated && fontsLoaded;

  React.useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isReady]);

  const navigationTheme =
    theme.scheme === 'dark'
      ? {
          ...NavigationDarkTheme,
          colors: {
            ...NavigationDarkTheme.colors,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: theme.colors.border,
            primary: theme.colors.primary,
          },
        }
      : {
          ...NavigationDefaultTheme,
          colors: {
            ...NavigationDefaultTheme.colors,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: theme.colors.border,
            primary: theme.colors.primary,
          },
        };

  if (!isReady) {
    // Always the "ink" dark treatment regardless of `theme.scheme` -- fonts
    // aren't loaded yet, and a splash-adjacent screen shouldn't flicker
    // between palettes based on a preference that hasn't finished hydrating.
    return (
      <View style={[styles.loading, { backgroundColor: darkColors.background }]}>
        <AppMark size={96} checkColor={darkColors.text} />
        <Text style={[styles.loadingWordmark, { color: darkColors.text }]}>HabitTracker</Text>
        <View style={[styles.loadingTrack, { backgroundColor: darkColors.border }]}>
          <View style={[styles.loadingFill, { backgroundColor: darkColors.primary }]} />
        </View>
      </View>
    );
  }

  if (!hasOnboarded) {
    return (
      <>
        <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
        <OnboardingScreen />
      </>
    );
  }

  return (
    <>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Root />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingWordmark: {
    fontSize: 28,
    fontFamily: 'ZillaSlab_700Bold',
  },
  loadingTrack: {
    width: 120,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  loadingFill: {
    width: '60%',
    height: '100%',
    borderRadius: 2,
  },
});
