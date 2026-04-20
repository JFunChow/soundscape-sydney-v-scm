import { Tabs } from 'expo-router';
import { Activity, Bookmark, Compass, Map, Plus } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.white,
        tabBarInactiveTintColor: 'rgba(220,231,242,0.5)',
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused ? styles.iconWrapActive : null]}>
              <Compass color={color} size={20} />
              {focused ? <Text style={[styles.iconLabel, { color }]}>Explore</Text> : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused ? styles.iconWrapActive : null]}>
              <Map color={color} size={20} />
              {focused ? <Text style={[styles.iconLabel, { color }]}>Map</Text> : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="meter"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused ? styles.iconWrapActive : null]}>
              <Activity color={color} size={20} />
              {focused ? <Text style={[styles.iconLabel, { color }]}>Meter</Text> : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused ? styles.iconWrapActive : null]}>
              <Plus color={color} size={20} />
              {focused ? <Text style={[styles.iconLabel, { color }]}>Add</Text> : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused ? styles.iconWrapActive : null]}>
              <Bookmark color={color} size={20} />
              {focused ? <Text style={[styles.iconLabel, { color }]}>Saved</Text> : null}
            </View>
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
    height: 62,
    paddingTop: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(5,8,18,0.92)',
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconWrap: {
    minWidth: 40,
    height: 40,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 5,
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
  },
});
