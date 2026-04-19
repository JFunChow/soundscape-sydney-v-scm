import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Heart, MapPin, Share2, Volume2 } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AudioPlayer } from '@/components/audio-player';
import { SoundLevelBadge } from '@/components/sound-level-badge';
import { VideoEmbed } from '@/components/video-embed';
import { Colors, Gradients } from '@/constants/colors';
import {
  categoryColors,
  getAverageSoundLevel,
  getSoundLevelDisplay,
  getSoundLevelLabel,
  parseSoundLevel,
  soundSpots,
} from '@/data/sound-spots';
import { useFavorites } from '@/providers/favorites-provider';

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFavorite, toggleFavorite } = useFavorites();

  const spot = useMemo(() => {
    console.log('[spot-detail] loading spot', { id });
    return soundSpots.find((entry) => entry.id === id) ?? soundSpots[0];
  }, [id]);

  const favorite = isFavorite(spot.id);
  const avgLevel = getAverageSoundLevel(spot);
  const levelDisplay = getSoundLevelDisplay(spot);
  const levelLabel = getSoundLevelLabel(spot);
  const minLevel = parseSoundLevel(spot.soundLevelMin);
  const maxLevel = parseSoundLevel(spot.soundLevelMax);

  const placeholderBg = spot.category === 'Biophony'
    ? 'rgba(33,212,181,0.15)'
    : spot.category === 'Geophony'
      ? 'rgba(99,230,255,0.15)'
      : 'rgba(255,138,101,0.15)';

  const openDirections = () => {
    const url = Platform.select({
      ios: `maps://app?daddr=${spot.coordinates.latitude},${spot.coordinates.longitude}`,
      android: `google.navigation:q=${spot.coordinates.latitude},${spot.coordinates.longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${spot.coordinates.latitude},${spot.coordinates.longitude}`,
    });
    if (url) void Linking.openURL(url);
  };

  const effectiveAudioUrl = spot.crowdsourcingAudioUrl || spot.audioUrl;

  return (
    <LinearGradient colors={Gradients.appBackground} style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} testID="spot-detail-screen">
        <View style={styles.imageWrap}>
          {spot.imageUrl ? (
            <Image source={{ uri: spot.imageUrl }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={[styles.image, { backgroundColor: placeholderBg, alignItems: 'center', justifyContent: 'center' }]}>
              <MapPin color={categoryColors[spot.category]} size={48} />
              <Text style={{ color: categoryColors[spot.category], fontSize: 18, fontWeight: '700' as const, marginTop: 8 }}>{spot.name}</Text>
            </View>
          )}
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(11,23,36,0.9)']} style={styles.imageOverlay} />
          <SafeAreaView edges={['top']} style={styles.imageHeader}>
            <Pressable onPress={() => router.back()} style={styles.backButton} testID="back-button">
              <ArrowLeft color={Colors.white} size={20} />
            </Pressable>
            <View style={styles.imageActions}>
              <Pressable onPress={() => toggleFavorite(spot.id)} style={styles.actionCircle} testID="detail-favorite-button">
                <Heart color={favorite ? Colors.rose : Colors.white} fill={favorite ? Colors.rose : 'transparent'} size={18} />
              </Pressable>
              <Pressable style={styles.actionCircle} testID="share-button">
                <Share2 color={Colors.white} size={18} />
              </Pressable>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.panel}>
          <View style={styles.categoryRow}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColors[spot.category] + '22' }]}>
              <View style={[styles.categoryDot, { backgroundColor: categoryColors[spot.category] }]} />
              <Text style={[styles.categoryText, { color: categoryColors[spot.category] }]}>{spot.category}</Text>
            </View>
            {spot.dateTime ? <Text style={styles.dateText}>{spot.dateTime}</Text> : null}
          </View>

          <Text style={styles.title}>{spot.name}</Text>
          {spot.historicalTitle ? (
            <Text style={styles.historicalTitle}>Indigenous name: {spot.historicalTitle}</Text>
          ) : null}

          <View style={styles.metaRow}>
            {spot.address ? (
              <Pressable onPress={openDirections} style={styles.metaItem}>
                <MapPin color={Colors.cyan} size={15} />
                <Text style={styles.metaText} numberOfLines={1}>{spot.address.split(',')[0]}</Text>
              </Pressable>
            ) : null}
            {avgLevel > 0 ? (
              <View style={styles.metaItem}>
                <Volume2 color={Colors.teal} size={15} />
                <Text style={styles.metaText}>{levelDisplay}</Text>
              </View>
            ) : null}
          </View>

          {spot.address ? (
            <View style={styles.addressCard}>
              <MapPin color={Colors.cyan} size={16} />
              <Text style={styles.addressText}>{spot.address}</Text>
            </View>
          ) : null}

          {effectiveAudioUrl ? (
            <AudioPlayer audioUrl={effectiveAudioUrl} title={spot.name} duration="" />
          ) : null}

          {avgLevel > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sound Level</Text>
              <SoundLevelBadge levelMin={minLevel} levelMax={maxLevel} label={levelLabel} />
            </View>
          ) : null}

          {spot.history ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>History</Text>
              <Text style={styles.description}>{spot.history}</Text>
            </View>
          ) : null}

          {spot.history2 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>History (continued)</Text>
              <Text style={styles.description}>{spot.history2}</Text>
            </View>
          ) : null}

          {spot.historicalRecords.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Historical Images</Text>
              {spot.historicalRecords.map((record, index) => (
                <View key={`hist-${index}`} style={styles.historicalCard}>
                  <Image source={{ uri: record.imageUrl }} style={styles.historicalImage} contentFit="cover" />
                  <Text style={styles.historicalPeriod}>{record.period}</Text>
                  {record.description !== record.period ? (
                    <Text style={styles.historicalDesc}>{record.description}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {spot.videoUrl ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Video</Text>
              <VideoEmbed videoUrl={spot.videoUrl} />
            </View>
          ) : null}

          {spot.address ? (
            <Pressable onPress={openDirections} style={styles.directionsButton} testID="directions-button">
              <MapPin color={Colors.ink} size={18} />
              <Text style={styles.directionsText}>Get Directions</Text>
            </Pressable>
          ) : null}

          <View style={styles.coordinatesCard}>
            <Text style={styles.coordinatesTitle}>Coordinates</Text>
            <Text style={styles.coordinatesText}>
              {spot.coordinates.latitude.toFixed(4)}, {spot.coordinates.longitude.toFixed(4)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  imageWrap: {
    height: 360,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  imageHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,17,28,0.6)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,17,28,0.6)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  panel: {
    marginTop: -30,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    backgroundColor: Colors.night,
    gap: 18,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dateText: {
    color: Colors.mist,
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  historicalTitle: {
    color: Colors.gold,
    fontSize: 15,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    maxWidth: '80%',
  },
  metaText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(99,230,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(99,230,255,0.15)',
  },
  addressText: {
    flex: 1,
    color: Colors.cloud,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
  },
  description: {
    color: Colors.cloud,
    fontSize: 15,
    lineHeight: 24,
  },
  historicalCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  historicalImage: {
    width: '100%',
    height: 200,
  },
  historicalPeriod: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  historicalDesc: {
    color: Colors.cloud,
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    borderRadius: 999,
    backgroundColor: Colors.cyan,
  },
  directionsText: {
    color: Colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  coordinatesCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  coordinatesTitle: {
    color: Colors.mist,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  coordinatesText: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '800',
  },
});
