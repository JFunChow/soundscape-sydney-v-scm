import React, { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '@/constants/colors';
import { SoundCategory } from '@/data/sound-spots';

interface CategoryPillProps {
  label: SoundCategory | 'All';
  isActive: boolean;
  onPress: () => void;
}

function CategoryPillComponent({ label, isActive, onPress }: CategoryPillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        isActive ? styles.pillActive : styles.pillInactive,
        pressed ? styles.pillPressed : null,
      ]}
      testID={`category-pill-${label}`}
    >
      <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>{label}</Text>
    </Pressable>
  );
}

export const CategoryPill = memo(CategoryPillComponent);

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    marginRight: 10,
  },
  pillActive: {
    backgroundColor: Colors.white,
  },
  pillInactive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillPressed: {
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  labelActive: {
    color: Colors.ink,
  },
  labelInactive: {
    color: Colors.cloud,
  },
});
