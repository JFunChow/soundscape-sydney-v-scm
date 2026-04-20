import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MapPinned, Search, Waves } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SoundSpotCard } from '@/components/sound-spot-card';
import { Colors, Gradients } from '@/constants/colors';
import {
  categoryColors,
  getAverageSoundLevel,
  soundCategories,
  SoundCategory,
  soundSpots,
} from '@/data/sound-spots';

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState<SoundCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ])
    ).start();
  }, [glow]);

  const filteredSpots = useMemo(() => {
    let spots = soundSpots;
    if (selectedCategory !== 'All') {
      spots = spots.filter((s) => s.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      spots = spots.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }
    return spots;
  }, [selectedCategory, searchQuery]);

  const featured = soundSpots[0];
  const featuredLevel = getAverageSoundLevel(featured);
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] });

  return (
    <View style={styles.screen}>
      <LinearGradient colors={Gradients.deepNight} style={StyleSheet.absoluteFill} />

      {/* ambient neon orbs */}
      <Animated.View
        pointerEvents="none"
        style={[styles.orb, styles.orbPink, { opacity: glowOpacity }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.orb, styles.orbCyan, { opacity: glowOpacity }]}
      />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID="explore-scroll-view"
        >
          {/* MASTHEAD */}
          <View style={styles.masthead}>
            <View style={styles.brandRow}>
              <Text style={styles.brand}>SOUNDSCAPE</Text>
              <View style={styles.brandLine} />
              <Text style={styles.brandYear}>2026/V</Text>
            </View>
            <Text style={styles.coords}>33.8688° S · 151.2093° E</Text>

            <Text style={styles.pageTitle}>Sydney{'\n'}through{'\n'}<Text style={styles.pageTitleAccent}>sound.</Text></Text>

            <View style={styles.mastheadMeta}>
              <Text style={styles.metaItem}>{soundSpots.length} SPOTS</Text>
              <View style={styles.metaDivider} />
              <Text style={styles.metaItem}>3 LAYERS</Text>
              <View style={styles.metaDivider} />
              <Text style={styles.metaItem}>LIVE ARCHIVE</Text>
            </View>
          </View>

          {/* SEARCH */}
          <View style={styles.searchBar}>
            <Search color={Colors.mist} size={16} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search places, sounds..."
              placeholderTextColor={Colors.mist}
              style={styles.searchInput}
              testID="search-input"
            />
          </View>

          {/* FEATURED - asymmetric */}
          <Pressable
            onPress={() => router.push(`/spots/${featured.id}`)}
            style={styles.featWrap}
            testID="featured-spot-button"
          >
            <View style={styles.featInner}>
              <View style={styles.featHeader}>
                <Text style={styles.featEyebrow}>FEATURED TRANSMISSION</Text>
                {featuredLevel > 0 ? (
                  <View style={styles.featLive}>
                    <Waves color={Colors.cyan} size={11} />
                    <Text style={styles.featLiveText}>LIVE</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.featTitle}>{featured.name}</Text>
              <Text style={styles.featSub} numberOfLines={2}>{featured.address}</Text>

              <View style={styles.featBottom}>
                <Text style={styles.featCTA}>LISTEN NOW →</Text>
                <Text style={styles.featIndex}>001</Text>
              </View>

              {/* decorative diagonal line */}
              <View style={styles.featSlash} />
            </View>
          </Pressable>

          {/* LAYERS (category stats) */}
          <View style={styles.layersHeader}>
            <Text style={styles.layersTitle}>LAYERS</Text>
            <Text style={styles.layersDot}>·</Text>
            <Text style={styles.layersSub}>tap to filter</Text>
          </View>

          <View style={styles.layers}>
            <Pressable
              onPress={() => setSelectedCategory('All')}
              style={[styles.layerChip, selectedCategory === 'All' && styles.layerChipActive]}
            >
              <Text style={[styles.layerCount, selectedCategory === 'All' && { color: Colors.white }]}>{soundSpots.length}</Text>
              <Text style={[styles.layerName, selectedCategory === 'All' && { color: Colors.white }]}>ALL</Text>
            </Pressable>
            {soundCategories.map((cat) => {
              const active = selectedCategory === cat;
              const count = soundSpots.filter((s) => s.category === cat).length;
              const color = categoryColors[cat];
              return (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.layerChip,
                    active && { borderColor: color, backgroundColor: `${color}12` },
                  ]}
                >
                  <View style={[styles.layerDot, { backgroundColor: color, shadowColor: color }]} />
                  <Text style={[styles.layerCount, active && { color }]}>{count}</Text>
                  <Text style={[styles.layerName, active && { color }]}>{cat.toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* INDEX */}
          <View style={styles.indexHeader}>
            <Text style={styles.indexTitle}>
              {selectedCategory === 'All' ? 'INDEX' : selectedCategory.toUpperCase()}
            </Text>
            <View style={styles.indexLine} />
            <Text style={styles.indexCount}>{String(filteredSpots.length).padStart(2, '0')}</Text>
          </View>

          {filteredSpots.length === 0 ? (
            <View style={styles.emptyState}>
              <MapPinned color={Colors.mist} size={28} />
              <Text style={styles.emptyTitle}>No spots found</Text>
              <Text style={styles.emptyText}>Try a different layer or search term.</Text>
            </View>
          ) : (
            filteredSpots.map((spot, i) => (
              <SoundSpotCard key={spot.id} spot={spot} index={i} />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050812',
  },
  safeArea: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
  },
  orbPink: {
    top: -100,
    right: -120,
    backgroundColor: 'rgba(255,47,184,0.18)',
  },
  orbCyan: {
    top: 300,
    left: -140,
    backgroundColor: 'rgba(47,255,224,0.14)',
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 140,
  },
  masthead: {
    marginBottom: 22,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brand: {
    color: Colors.cyan,
    fontSize: 13,
    fontWeight: '900' as const,
    letterSpacing: 3,
  },
  brandLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(47,255,224,0.25)',
  },
  brandYear: {
    color: Colors.mist,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 2,
  },
  coords: {
    color: Colors.mist,
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 2,
    marginTop: 4,
    marginBottom: 28,
  },
  pageTitle: {
    color: Colors.white,
    fontSize: 54,
    lineHeight: 58,
    fontWeight: '900' as const,
    letterSpacing: -2,
  },
  pageTitleAccent: {
    color: Colors.neon,
    fontStyle: 'italic' as const,
  },
  mastheadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  metaItem: {
    color: Colors.cloud,
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1.5,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.mist,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 26,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
  },
  featWrap: {
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
  },
  featInner: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neon,
    padding: 22,
    backgroundColor: 'rgba(255,47,184,0.06)',
    overflow: 'hidden',
  },
  featHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  featEyebrow: {
    color: Colors.neon,
    fontSize: 10,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  featLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(47,255,224,0.4)',
  },
  featLiveText: {
    color: Colors.cyan,
    fontSize: 9,
    fontWeight: '900' as const,
    letterSpacing: 1.5,
  },
  featTitle: {
    color: Colors.white,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900' as const,
    letterSpacing: -1,
  },
  featSub: {
    color: Colors.cloud,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
    opacity: 0.75,
  },
  featBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  featCTA: {
    color: Colors.cyan,
    fontSize: 12,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  featIndex: {
    color: 'rgba(255,255,255,0.15)',
    fontSize: 48,
    fontWeight: '900' as const,
    lineHeight: 48,
    letterSpacing: -2,
  },
  featSlash: {
    position: 'absolute',
    width: 200,
    height: 1,
    backgroundColor: 'rgba(255,47,184,0.3)',
    top: 60,
    right: -40,
    transform: [{ rotate: '-35deg' }],
  },
  layersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  layersTitle: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  layersDot: {
    color: Colors.mist,
  },
  layersSub: {
    color: Colors.mist,
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1,
  },
  layers: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  layerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  layerChipActive: {
    borderColor: Colors.white,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  layerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  layerCount: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '900' as const,
  },
  layerName: {
    color: Colors.mist,
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1.5,
  },
  indexHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  indexTitle: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  indexLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  indexCount: {
    color: Colors.cyan,
    fontSize: 13,
    fontWeight: '900' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800' as const,
  },
  emptyText: {
    color: Colors.cloud,
    fontSize: 14,
  },
});
