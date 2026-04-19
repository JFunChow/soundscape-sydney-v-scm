import { Redirect } from 'expo-router';
import React from 'react';

export default function IndexScreen() {
  console.log('[app] redirecting root route to explore');
  return <Redirect href="/(tabs)/explore" />;
}
