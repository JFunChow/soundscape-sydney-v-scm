import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

interface SoundLevelBadgeProps {
  levelMin: number;
  levelMax: number;
  label: string;
}

function SoundLevelBadgeComponent({ levelMin, levelMax, label }: SoundLevelBadgeProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const avg = levelMin > 0 && levelMax > 0 ? (levelMin + levelMax) / 2 : levelMax || levelMin;

  const getColor = () => {
    if (avg < 50) return Colors.teal;
    if (avg < 65) return Colors.gold;
    return Colors.coral;
  };

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: Math.min(avg, 100),
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [avg, widthAnim]);

  const barColor = getColor();
  const display = levelMin > 0 && levelMax > 0
    ? `${levelMin}–${levelMax} dBA`
    : levelMax > 0
      ? `${levelMax} dBA`
      : `${levelMin} dBA`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: barColor }]}>{display}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

export const SoundLevelBadge = memo(SoundLevelBadgeComponent);

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: Colors.cloud,
    fontSize: 13,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    fontWeight: '800',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
