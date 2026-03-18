import { Platform, TurboModuleRegistry } from 'react-native';

// Check directly for the native module that expo-notifications requires.
// TurboModuleRegistry.get() returns null (never throws) if the module is absent,
// which is the case in Expo Go SDK 53+ and any build missing the native code.
// This must happen synchronously BEFORE any import() call so Metro never
// attempts to load the module and never logs the native-module error.
const SUPPORTED = !!TurboModuleRegistry.get('ExpoPushTokenManager');

async function N() {
  if (!SUPPORTED) return null;
  return import('expo-notifications');
}

export async function setupNotifications() {
  const Notifications = await N();
  if (!Notifications) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'appFIT',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = await N();
  if (!Notifications) return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleMealReminder(hour: number, minute: number, language: string) {
  const Notifications = await N();
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync('meal-reminder').catch(() => {});
  const isEs = language === 'es';
  await Notifications.scheduleNotificationAsync({
    identifier: 'meal-reminder',
    content: {
      title: isEs ? '¿Ya registraste tu comida? 🍽️' : 'Did you log your meal? 🍽️',
      body: isEs
        ? 'No olvides registrar tus macros de hoy 💪'
        : "Don't forget to log today's macros 💪",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelMealReminder() {
  const Notifications = await N();
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync('meal-reminder').catch(() => {});
}

export async function scheduleFastingCompleteNotification(
  startTime: number,
  goalHours: number,
  language: string,
) {
  const Notifications = await N();
  if (!Notifications) return;
  const targetDate = new Date(startTime + goalHours * 3_600_000);
  if (targetDate <= new Date()) return;

  await Notifications.cancelScheduledNotificationAsync('fasting-complete').catch(() => {});
  const isEs = language === 'es';
  await Notifications.scheduleNotificationAsync({
    identifier: 'fasting-complete',
    content: {
      title: isEs ? '¡Ayuno completado! 🎉' : 'Fast complete! 🎉',
      body: isEs
        ? `Alcanzaste tu meta de ${goalHours}h. ¡Excelente disciplina!`
        : `You hit your ${goalHours}h goal. Great discipline!`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: targetDate,
    },
  });
}

export async function cancelFastingCompleteNotification() {
  const Notifications = await N();
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync('fasting-complete').catch(() => {});
}
