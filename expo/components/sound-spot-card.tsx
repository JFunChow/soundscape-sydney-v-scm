import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Heart, MapPinned, MoveRight, Volume2 } from 'lucide-react-native';
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
}

function SoundSpotCardComponent({ spot }: SoundSpotCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(spot.id);
  const avgLevel = getAverageSoundLevel(spot);
  const levelDisplay = getSoundLevelDisplay(spot);

  const getLevelColor = () => {
    if (avgLevel === 0) return Colors.mist;
    if (avgLevel < 50) return Colors.teal;
    if (avgLevel < 65) return Colors.gold;
    return Colors.coral;
  };

  const placeholderBg = spot.category === 'Biophony'
    ? 'rgba(33,212,181,0.15)'
    : spot.category === 'Geophony'
      ? 'rgba(99,230,255,0.15)'
      : 'rgba(255,138,101,0.15)';

  return (
    <Pressable
      onPress={() => router.push(`/spots/${spot.id}`)}
      style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
      testID={`sound-spot-card-${spot.id}`}
    >
      {spot.imageUrl ? (
        <Image source={{ uri: spot.imageUrl }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: placeholderBg }]}>
          <MapPinned color={categoryColors[spot.category]} size={32} />
          <Text style={[styles.placeholderText, { color: categoryColors[spot.category] }]}>{spot.name}</Text>
        </View>
      )}
      <Pressable
        onPress={() => toggleFavorite(spot.id)}
        style={styles.favoriteButton}
        testID={`favorite-button-${spot.id}`}
      >
        <Heart color={favorite ? Colors.rose : Colors.white} fill={favorite ? Colors.rose : 'transparent'} size={18} />
      </Pressable>

      <View style={[styles.categoryTag, { backgroundColor: categoryColors[spot.category] + '22' }]}>
        <View style={[styles.categoryDot, { backgroundColor: categoryColors[spot.category] }]} />
        <Text style={[styles.categoryTagText, { color: categoryColors[spot.category] }]}>{spot.category}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{spot.name}</Text>
            {spot.address ? <Text style={styles.subtitle} numberOfLines={2}>{spot.address}</Text> : null}
          </View>
          <MoveRight color={Colors.cloud} size={18} />
        </View>

        <View style={styles.metaRow}>
          {spot.address ? (
            <View style={styles.metaBadge}>
              <MapPinned color={Colors.cyan} size={13} />
              <Text style={styles.metaText} numberOfLines={1}>{spot.address.split(',')[0]}</Text>
            </View>
          ) : null}
          {avgLevel > 0 ? (
            <View style={styles.metaBadge}>
              <Volume2 color={getLevelColor()} size={13} />
              <Text style={[styles.metaText, { color: getLevelColor() }]}>{levelDisplay}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export const SoundSpotCard = memo(SoundSpotCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardPressed: {
    transform: [{ scale: 0.992 }],
  },
  image: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,17,28,0.55)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  titleWrap: {
    flex: 1,
    gap: 5,
  },
  title: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: Colors.cloud,
    fontSize: 13,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '60%',
  },
  metaText: {
    color: Colors.cyan,
    fontSize: 12,
    fontWeight: '700',
  },
});
