import { Link, Stack } from 'expo-router';
import { Compass } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Lost frequency' }} />
      <View style={styles.container}>
        <View style={styles.iconBubble}>
          <Compass color={Colors.cyan} size={28} />
        </View>
        <Text style={styles.title}>This route doesn’t exist yet.</Text>
        <Text style={styles.text}>The sound trail you opened is missing, but the rest of the city map is still available. We can turn this into branded empty states later too.</Text>
        <Link href="/" style={styles.link} testID="go-home-link">
          <Text style={styles.linkText}>Back to discovery</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: Colors.night,
  },
  iconBubble: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99,230,255,0.12)',
    marginBottom: 22,
  },
  title: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  text: {
    color: Colors.cloud,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 18,
  },
  link: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.white,
  },
  linkText: {
    color: Colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
});
