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
import { loadUserData } from '@/utils/userSync';
import { setupNotifications } from '@/utils/notifications';
import { initPurchases, checkEntitlement, logoutPurchases } from '@/utils/purchases';

// Only import expo-notifications if the native push token module is available.
// TurboModuleRegistry.get() returns null without throwing, preventing Metro's
// module-load error log in Expo Go / builds without native notification support.
import { TurboModuleRegistry } from 'react-native';
if (TurboModuleRegistry.get('ExpoPushTokenManager')) {
  import('expo-notifications').then((N) => {
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }).catch(() => {});
}

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

const AUTH_SCREENS = ['welcome', 'login', 'register', 'forgot-password'];

export default function RootLayout() {
  const { isLoggedIn, hasCompletedOnboarding, login, logout, completeOnboarding, resetMealsIfNewDay, hydrateUserData, setPremium } = useAppStore();
  const router = useRouter();
  const segments = useSegments();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setupNotifications();
  }, []);

  // Hide splash and reset meals only after Zustand has hydrated from AsyncStorage.
  // Calling resetMealsIfNewDay() before hydration is a no-op because AsyncStorage
  // restores the persisted state (including lastMealDate) after this effect runs.
  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => {
      resetMealsIfNewDay();
    });
    // If hydration already finished (fast device / already hydrated), call immediately.
    if (useAppStore.persist.hasHydrated()) {
      resetMealsIfNewDay();
    }
    SplashScreen.hideAsync();
    return unsub;
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
    const hydrateUser = async (supabaseUser: any) => {
      login({
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.full_name ?? supabaseUser.email?.split('@')[0] ?? 'User',
        email: supabaseUser.email!,
      });
      completeOnboarding();
      // Init RevenueCat with the user's ID and sync entitlement to store
      initPurchases(supabaseUser.id);
      checkEntitlement().then((active) => { if (active) setPremium(true); }).catch(() => {});
      // Load user data from Supabase and merge into store
      loadUserData(supabaseUser.id).then(({ profile, weeklyPlan, bodyLog }) => {
        hydrateUserData({
          profile: profile ?? undefined,
          weeklyPlan: weeklyPlan ?? undefined,
          bodyLog: bodyLog.length > 0 ? bodyLog : undefined,
          unitSystem: profile?.unitSystem ?? undefined,
          language: profile?.language ?? undefined,
        });
      }).catch(() => {});
    };

    // Restore existing session on app launch
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        // Invalid/expired refresh token — clear synchronously before hydrating
        logout();
        supabase.auth.signOut().catch(() => {});
      } else if (session?.user) {
        hydrateUser(session.user);
      }
      setHydrated(true);
    });

    // Listen for future auth changes (sign in / sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && event === 'SIGNED_IN') {
        hydrateUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        logoutPurchases().catch(() => {});
        logout();
      } else if (event as string === 'TOKEN_REFRESH_FAILED') {
        logout();
        supabase.auth.signOut().catch(() => {});
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
        <Stack.Screen name="fasting" />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
