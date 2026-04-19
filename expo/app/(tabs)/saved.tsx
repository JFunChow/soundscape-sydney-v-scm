import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { BookmarkCheck, Heart } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SoundSpotCard } from '@/components/sound-spot-card';
import { Colors, Gradients } from '@/constants/colors';
import { soundSpots } from '@/data/sound-spots';
import { useFavorites } from '@/providers/favorites-provider';

export default function SavedScreen() {
  const { favoriteIds, isReady } = useFavorites();

  const favoriteSpots = useMemo(() => {
    console.log('[saved] computing favorites', { favoriteIds });
    return soundSpots.filter((spot) => favoriteIds.includes(spot.id));
  }, [favoriteIds]);

  return (
    <LinearGradient colors={Gradients.appBackground} style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} testID="saved-scroll-view">
          <Text style={styles.kicker}>Saved places</Text>
          <Text style={styles.title}>Your listening collection</Text>
          <Text style={styles.subtitle}>Build custom walking routes and playlists from your saved spots.</Text>

          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <BookmarkCheck color={Colors.ink} size={18} />
            </View>
            <View style={styles.bannerCopy}>
              <Text style={styles.bannerTitle}>{favoriteSpots.length} spots saved</Text>
              <Text style={styles.bannerText}>
                {favoriteSpots.length > 0
                  ? `You have ${favoriteSpots.length} sound locations saved.`
                  : 'Tap the heart on any sound spot to save it here.'}
              </Text>
            </View>
          </View>

          {!isReady ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Loading your collection…</Text>
            </View>
          ) : null}

          {isReady && favoriteSpots.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.heartBubble}>
                <Heart color={Colors.rose} size={24} fill={Colors.rose} />
              </View>
              <Text style={styles.emptyTitle}>Nothing saved yet</Text>
              <Text style={styles.emptyText}>Explore the sound map and tap the heart icon on any spot to add it to your collection.</Text>
              <Pressable onPress={() => router.push('/(tabs)/explore')} style={styles.emptyButton} testID="browse-spots-button">
                <Text style={styles.emptyButtonText}>Explore sounds</Text>
              </Pressable>
            </View>
          ) : null}

          {favoriteSpots.map((spot) => (
            <SoundSpotCard key={spot.id} spot={spot} />
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  kicker: {
    color: Colors.cyan,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  title: {
    color: Colors.white,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.cloud,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  banner: {
    flexDirection: 'row',
    gap: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 22,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold,
  },
  bannerCopy: {
    flex: 1,
    gap: 4,
  },
  bannerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  bannerText: {
    color: Colors.cloud,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 42,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 18,
  },
  heartBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,93,143,0.12)',
    marginBottom: 16,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.cloud,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 18,
  },
  emptyButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 999,
  },
  emptyButtonText: {
    color: Colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
});
