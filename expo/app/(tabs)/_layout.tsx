import { Tabs } from 'expo-router';
import { Activity, Bookmark, Compass, Map, Orbit, Plus } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

type TabIconProps = {
  color: string;
  focused: boolean;
  Icon: React.ComponentType<{ color: string; size: number }>;
  label: string;
};

function TabIcon({ color, focused, Icon, label }: TabIconProps) {
  return (
    <View style={[styles.iconWrap, focused ? styles.iconWrapActive : null]}>
      <Icon color={color} size={18} />
      {focused ? (
        <Text numberOfLines={1} style={[styles.iconLabel, { color }]}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarItemStyle: styles.tabItem,
        tabBarActiveTintColor: Colors.white,
        tabBarInactiveTintColor: 'rgba(220,231,242,0.55)',
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} Icon={Compass} label="Explore" />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} Icon={Map} label="Map" />
          ),
        }}
      />
      <Tabs.Screen
        name="immerse"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} Icon={Orbit} label="Walk" />
          ),
        }}
      />
      <Tabs.Screen
        name="meter"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} Icon={Activity} label="Meter" />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} Icon={Plus} label="Add" />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} Icon={Bookmark} label="Saved" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    height: 64,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(5,8,18,0.94)',
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabItem: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 6,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(47,255,224,0.12)',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(47,255,224,0.4)',
  },
  iconLabel: {
    fontSize: 11,
    fontWeight: '700',
    includeFontPadding: false,
  },
});
