import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { colors } from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/utils/supabase';

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

const AUTH_SCREENS = ['welcome', 'login', 'register', 'forgot-password'];

export default function RootLayout() {
  const { isLoggedIn, hasCompletedOnboarding, login, logout, resetMealsIfNewDay } = useAppStore();
  const router = useRouter();
  const segments = useSegments();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync();
    resetMealsIfNewDay();
  }, []);

  // Reset todayMeals whenever the app comes back to foreground on a new day
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') resetMealsIfNewDay();
    });
    return () => sub.remove();
  }, []);

  // Handle OAuth deep link redirect (Android fallback)
  useEffect(() => {
    const handleUrl = async (url: string) => {
      if (url.includes('code=') || url.includes('access_token=')) {
        await supabase.auth.exchangeCodeForSession(url).catch(() => {
          // Code may have already been exchanged by login.tsx (expected on Android)
        });
      }
    };
    Linking.getInitialURL().then((url) => { if (url) handleUrl(url); });
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);

  // Sync Supabase session → Zustand store
  useEffect(() => {
    // Restore existing session on app launch
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        login({
          name: u.user_metadata?.full_name ?? u.email?.split('@')[0] ?? 'User',
          email: u.email!,
        });
      }
      // Mark hydration done — guard may now run
      setHydrated(true);
      // No explicit signOut on error — Supabase emits SIGNED_OUT automatically
      // for invalid tokens, and calling signOut() here clears the PKCE code
      // verifier needed for in-flight OAuth exchanges (causes Android OAuth loop).
    });

    // Listen for future auth changes (sign in / sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const u = session.user;
        login({
          name: u.user_metadata?.full_name ?? u.email?.split('@')[0] ?? 'User',
          email: u.email!,
        });
      } else if (event === 'SIGNED_OUT') {
        // Only logout on explicit sign-out, not on INITIAL_SESSION with no session
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!segments.length) return;
    const current = segments[0] as string;
    const inAuth = AUTH_SCREENS.includes(current);
    const inOnboarding = current === 'onboarding';

    if (!isLoggedIn && !inAuth) {
      router.replace('/welcome' as any);
    } else if (isLoggedIn && !hasCompletedOnboarding && !inOnboarding && !inAuth) {
      router.replace('/onboarding' as any);
    } else if (isLoggedIn && hasCompletedOnboarding && (inAuth || inOnboarding)) {
      router.replace('/(tabs)' as any);
    }
  }, [hydrated, isLoggedIn, hasCompletedOnboarding, segments]);

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.bg} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
