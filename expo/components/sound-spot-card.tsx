import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Heart, MoveUpRight, Volume2 } from 'lucide-react-native';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import {
  categoryColors,
  getAverageSoundLevel,
  getSoundLevelDisplay,
  SoundSpot,
} from '@/data/sound-spots';
import { useFavorites } from '@/providers/favorites-provider';

interface SoundSpotCardProps {
  spot: SoundSpot;
  index?: number;
}

function SoundSpotCardComponent({ spot, index = 0 }: SoundSpotCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(spot.id);
  const avgLevel = getAverageSoundLevel(spot);
  const levelDisplay = getSoundLevelDisplay(spot);
  const color = categoryColors[spot.category];

  const placeholderBg = `${color}22`;

  // asymmetric: every other card offset slightly
  const asymOffset = index % 2 === 0 ? { marginLeft: 0 } : { marginLeft: 18 };

  return (
    <Pressable
      onPress={() => router.push(`/spots/${spot.id}`)}
      style={({ pressed }) => [styles.card, asymOffset, pressed ? styles.cardPressed : null]}
      testID={`sound-spot-card-${spot.id}`}
    >
      <View style={styles.imageWrap}>
        {spot.imageUrl ? (
          <Image source={{ uri: spot.imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, { backgroundColor: placeholderBg, alignItems: 'center', justifyContent: 'center' }]}>
            <Volume2 color={color} size={32} />
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(5,8,18,0.2)', 'rgba(5,8,18,0.95)']}
          style={StyleSheet.absoluteFill}
        />

        {/* category tag - top left */}
        <View style={[styles.catTag, { borderColor: color }]}>
          <View style={[styles.catDot, { backgroundColor: color, shadowColor: color }]} />
          <Text style={[styles.catText, { color }]}>{spot.category.toUpperCase()}</Text>
        </View>

        {/* favorite - top right */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(spot.id);
          }}
          hitSlop={10}
          style={styles.fav}
          testID={`favorite-button-${spot.id}`}
        >
          <Heart color={favorite ? Colors.neon : Colors.white} fill={favorite ? Colors.neon : 'transparent'} size={15} />
        </Pressable>

        {/* index number big bottom right */}
        <Text style={styles.bigNum}>{String(index + 1).padStart(2, '0')}</Text>

        {/* title and arrow */}
        <View style={styles.titleBlock}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={2}>{spot.name}</Text>
            {spot.address ? (
              <Text style={styles.sub} numberOfLines={1}>{spot.address.split(',')[0]}</Text>
            ) : null}
          </View>
          <View style={[styles.arrow, { borderColor: color }]}>
            <MoveUpRight color={color} size={14} />
          </View>
        </View>
      </View>

      {avgLevel > 0 ? (
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>SOUND LEVEL</Text>
          <Text style={[styles.levelValue, { color }]}>{levelDisplay}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export const SoundSpotCard = memo(SoundSpotCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 18,
    overflow: 'hidden',
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  imageWrap: {
    width: '100%',
    height: 240,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  catTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(5,8,18,0.5)',
  },
  catDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  catText: {
    fontSize: 9,
    fontWeight: '900' as const,
    letterSpacing: 1.5,
  },
  fav: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,8,18,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  bigNum: {
    position: 'absolute',
    bottom: 12,
    right: 18,
    color: 'rgba(255,255,255,0.12)',
    fontSize: 64,
    fontWeight: '900' as const,
    lineHeight: 64,
    letterSpacing: -2,
  },
  titleBlock: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  title: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '900' as const,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  sub: {
    color: Colors.mist,
    fontSize: 11,
    fontWeight: '600' as const,
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(5,8,18,0.5)',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  levelLabel: {
    color: Colors.mist,
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
  levelValue: {
    fontSize: 13,
    fontWeight: '800' as const,
  },
});
