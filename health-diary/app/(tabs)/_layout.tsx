import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import type { ColorValue } from 'react-native';
import { colors } from '../../src/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const icon =
  (name: IconName) =>
  ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} color={(color as string) ?? colors.sub} size={size} />
  );

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.sub,
        tabBarStyle: { borderTopColor: colors.line, backgroundColor: colors.card },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: '홈', tabBarIcon: icon('home') }}
      />
      <Tabs.Screen
        name="weight"
        options={{ title: '체중', tabBarIcon: icon('body') }}
      />
      <Tabs.Screen
        name="workout"
        options={{ title: '운동', tabBarIcon: icon('barbell') }}
      />
      <Tabs.Screen
        name="meal"
        options={{ title: '식사', tabBarIcon: icon('restaurant') }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: '설정', tabBarIcon: icon('settings-sharp') }}
      />
    </Tabs>
  );
}
