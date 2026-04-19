import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MapPinned, Search, SlidersHorizontal, Waves } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryPill } from '@/components/category-pill';
import { GlassCard } from '@/components/glass-card';
import { SoundSpotCard } from '@/components/sound-spot-card';
import { Colors, Gradients } from '@/constants/colors';
import {
  categoryColors,
  getAverageSoundLevel,
  getSoundLevelDisplay,
  soundCategories,
  SoundCategory,
  soundSpots,
} from '@/data/sound-spots';

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState<SoundCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredSpots = useMemo(() => {
    console.log('[explore] filtering spots', { selectedCategory, searchQuery });
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

  const featuredSpot = soundSpots[0];
  const featuredLevel = getAverageSoundLevel(featuredSpot);
  const featuredLevelDisplay = getSoundLevelDisplay(featuredSpot);

  return (
    <LinearGradient colors={Gradients.appBackground} style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} testID="explore-scroll-view">
          <View style={styles.topRow}>
            <View style={styles.topCopy}>
              <Text style={styles.kicker}>Soundscape Sydney</Text>
              <Text style={styles.title}>Explore Sydney through sound</Text>
            </View>
          </View>

          <View style={styles.searchBar}>
            <Search color={Colors.mist} size={18} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search places, sounds..."
              placeholderTextColor={Colors.mist}
              style={styles.searchInput}
              testID="search-input"
            />
          </View>

          <GlassCard style={styles.heroCard}>
            <LinearGradient colors={Gradients.heroGlow} style={styles.heroGlow}>
              <View style={styles.heroHeader}>
                <View style={styles.heroHeaderLeft}>
                  <Text style={styles.heroEyebrow}>Featured soundscape</Text>
                  <Text style={styles.heroTitle}>{featuredSpot.name}</Text>
                  <Text style={styles.heroSub}>{featuredSpot.address}</Text>
                </View>
                {featuredLevel > 0 ? (
                  <View style={styles.liveBadge}>
                    <Waves color={Colors.teal} size={14} />
                    <Text style={styles.liveText}>{featuredLevelDisplay}</Text>
                  </View>
                ) : null}
              </View>

              <Pressable
                onPress={() => router.push(`/spots/${featuredSpot.id}`)}
                style={styles.heroAction}
                testID="featured-spot-button"
              >
                <Text style={styles.heroActionText}>Listen now</Text>
              </Pressable>
            </LinearGradient>
          </GlassCard>

          <View style={styles.statsRow}>
            {soundCategories.map((cat) => {
              const count = soundSpots.filter((s) => s.category === cat).length;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.statCard,
                    selectedCategory === cat ? { borderColor: categoryColors[cat] } : null,
                  ]}
                >
                  <View style={[styles.statDot, { backgroundColor: categoryColors[cat] }]} />
                  <Text style={styles.statValue}>{count}</Text>
                  <Text style={styles.statLabel}>{cat}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'All' ? 'All soundscapes' : selectedCategory}
            </Text>
            <Pressable style={styles.filterAction} onPress={() => setSelectedCategory('All')} testID="clear-filter">
              <SlidersHorizontal color={Colors.cloud} size={16} />
              <Text style={styles.filterText}>{filteredSpots.length} spots</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            <CategoryPill label="All" isActive={selectedCategory === 'All'} onPress={() => setSelectedCategory('All')} />
            {soundCategories.map((category) => (
              <CategoryPill
                key={category}
                label={category}
                isActive={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
              />
            ))}
          </ScrollView>

          <View style={styles.listWrap}>
            {filteredSpots.length === 0 ? (
              <View style={styles.emptyState}>
                <MapPinned color={Colors.mist} size={28} />
                <Text style={styles.emptyTitle}>No spots found</Text>
                <Text style={styles.emptyText}>Try a different category or search term.</Text>
              </View>
            ) : (
              filteredSpots.map((spot) => (
                <SoundSpotCard key={spot.id} spot={spot} />
              ))
            )}
          </View>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  topCopy: {
    flex: 1,
    gap: 6,
  },
  kicker: {
    color: Colors.cyan,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.1,
  },
  title: {
    color: Colors.white,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 15,
  },
  heroCard: {
    marginBottom: 20,
  },
  heroGlow: {
    padding: 20,
    gap: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroHeaderLeft: {
    flex: 1,
    gap: 6,
  },
  heroEyebrow: {
    color: Colors.cloud,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  heroSub: {
    color: Colors.cloud,
    fontSize: 13,
    lineHeight: 19,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  liveText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  heroAction: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.cyan,
  },
  heroActionText: {
    color: Colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  statValue: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: Colors.cloud,
    fontSize: 10,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  filterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    color: Colors.cloud,
    fontSize: 13,
    fontWeight: '700',
  },
  categoryRow: {
    paddingBottom: 18,
  },
  listWrap: {
    paddingBottom: 12,
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
    fontWeight: '800',
  },
  emptyText: {
    color: Colors.cloud,
    fontSize: 14,
  },
});
