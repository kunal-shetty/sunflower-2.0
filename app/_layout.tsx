import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as NativeSplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import SplashScreen from '@/components/splash-screen';
import { Colors } from '@/constants/theme';
import { TodoProvider } from '@/context/todo-context';

// Prevent the native splash from auto-hiding
NativeSplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.accent,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.accent,
  },
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const USERNAME_KEY = '@user_name';
const DAILY_NOTIFICATION_ID = 'daily-6am-reminder';

// Schedule a daily notification at 6:00 AM
async function scheduleDailyNotification() {
  // Request permissions first
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') return;
  }

  // Cancel any existing daily notification to avoid duplicates
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.identifier === DAILY_NOTIFICATION_ID) {
      await Notifications.cancelScheduledNotificationAsync(DAILY_NOTIFICATION_ID);
      break;
    }
  }

  // Schedule new daily notification at 6:00 AM
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_NOTIFICATION_ID,
    content: {
      title: 'Good Morning! ☀️',
      body: 'Start your day strong — check your tasks and stay on track!',
      sound: 'default',
      ...(Platform.OS === 'android' && { channelId: 'task-reminders' }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 6,
      minute: 0,
    },
  });
}

export default function RootLayout() {
  const colors = Colors.light;
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [hasUsername, setHasUsername] = useState(true); // assume true to avoid flash
  const [showSplash, setShowSplash] = useState(true);

  // Set up Android notification channel + schedule daily notification
  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('task-reminders', {
        name: 'Task Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E8820C',
        sound: 'default',
      });
    }

    // Schedule the daily 6 AM notification (native only)
    if (Platform.OS !== 'web') {
      scheduleDailyNotification();
    }
  }, []);

  // Check if username exists
  useEffect(() => {
    (async () => {
      try {
        const name = await AsyncStorage.getItem(USERNAME_KEY);
        setHasUsername(!!name);
      } catch {
        setHasUsername(false);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  // Hide native splash once data is loaded
  useEffect(() => {
    if (isReady) {
      NativeSplashScreen.hideAsync();
    }
  }, [isReady]);

  // Redirect to onboarding if no username
  useEffect(() => {
    if (isReady && !hasUsername) {
      router.replace('/onboarding');
    }
  }, [isReady, hasUsername]);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <TodoProvider>
      <ThemeProvider value={CustomLightTheme}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.accent,
            headerTitleStyle: { color: colors.text, fontWeight: '700' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="add"
            options={{
              presentation: 'modal',
              title: '',
              animation: 'slide_from_bottom',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              title: 'Details',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
        <StatusBar style="dark" />
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      </ThemeProvider>
    </TodoProvider>
  );
}
