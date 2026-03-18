import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/Colors';
import { useT } from '@/constants/i18n';

export default function TabLayout() {
  const t = useT();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 2,
          height: 58 + insets.bottom,
          elevation: 30,
          shadowColor: '#000',
          shadowOpacity: 0.7,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.3,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="macros"
        options={{
          title: t.tabs.nutrition,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'nutrition' : 'nutrition-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="body"
        options={{
          title: t.tabs.body,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'barbell' : 'barbell-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: t.tabs.plan,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="steps"
        options={{
          title: t.tabs.steps,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'footsteps' : 'footsteps-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.profile.myInfo,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
