import { LinearGradient } from 'expo-linear-gradient';
import React, { ReactNode, memo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { Colors, Gradients } from '@/constants/colors';

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function GlassCardComponent({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.shadow, style]}>
      <LinearGradient colors={Gradients.cardBackground} style={styles.card}>
        {children}
      </LinearGradient>
    </View>
  );
}

export const GlassCard = memo(GlassCardComponent);

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 28,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.42,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 16,
    },
    elevation: 10,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
});
