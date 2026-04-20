import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, ExternalLink, Feather, Globe, Heart, Lightbulb, MapPin, Share2, Sparkles, Users, Volume2 } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AudioPlayer } from '@/components/audio-player';
import { SoundLevelBadge } from '@/components/sound-level-badge';
import { VideoEmbed } from '@/components/video-embed';
import { Colors } from '@/constants/colors';
import {
  categoryColors,
  getAverageSoundLevel,
  getSoundLevelDisplay,
  getSoundLevelLabel,
  liveInfoById,
  parseSoundLevel,
  soundSpots,
} from '@/data/sound-spots';
import { enrichmentById } from '@/data/enrichment';
import { useFavorites } from '@/providers/favorites-provider';

const { width: SCREEN_W } = Dimensions.get('window');

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
  const live = liveInfoById[spot.id];
  const enrichment = enrichmentById[spot.id];
  const categoryColor = categoryColors[spot.category];
  const heroImageUrl = spot.imageUrl || enrichment?.backupImageUrl || '';

  // cinematic entrance
  const entrance = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(entrance, { toValue: 1, duration: 680, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, [entrance, glow]);

  // parallax
  const heroScale = scrollY.interpolate({
    inputRange: [-200, 0, 260],
    outputRange: [1.2, 1, 1.1],
    extrapolate: 'clamp',
  });
  const heroTranslate = scrollY.interpolate({
    inputRange: [0, 260],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });
  const headerFade = scrollY.interpolate({
    inputRange: [80, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const entranceTranslate = entrance.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const entranceOpacity = entrance;
  const titleEntrance = entrance.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.85] });

  const placeholderBg = `${categoryColor}22`;

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
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* floating blurred title bar when scrolled */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerFade }]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(5,8,18,0.95)', 'rgba(5,8,18,0.7)']}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['top']}>
          <Text style={styles.stickyTitle} numberOfLines={1}>{spot.name}</Text>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        testID="spot-detail-screen"
      >
        {/* HERO */}
        <View style={styles.heroWrap}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { transform: [{ scale: heroScale }, { translateY: heroTranslate }] },
            ]}
          >
            {heroImageUrl ? (
              <Image source={{ uri: heroImageUrl }} style={styles.heroImage} contentFit="cover" />
            ) : (
              <View style={[styles.heroImage, { backgroundColor: placeholderBg, alignItems: 'center', justifyContent: 'center' }]}>
                <MapPin color={categoryColor} size={56} />
              </View>
            )}
          </Animated.View>

          <LinearGradient
            colors={['rgba(5,8,18,0.1)', 'rgba(5,8,18,0.2)', 'rgba(5,8,18,0.98)']}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {/* neon halo */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.halo,
              {
                shadowColor: categoryColor,
                opacity: glowOpacity,
              },
            ]}
          />

          <SafeAreaView edges={['top']} style={styles.heroHeader}>
            <Pressable onPress={() => router.back()} style={styles.circleBtn} testID="back-button">
              <ArrowLeft color={Colors.white} size={18} />
            </Pressable>
            <View style={styles.heroActions}>
              <Pressable onPress={() => toggleFavorite(spot.id)} style={styles.circleBtn} testID="detail-favorite-button">
                <Heart color={favorite ? Colors.neon : Colors.white} fill={favorite ? Colors.neon : 'transparent'} size={16} />
              </Pressable>
              <Pressable style={styles.circleBtn} testID="share-button">
                <Share2 color={Colors.white} size={16} />
              </Pressable>
            </View>
          </SafeAreaView>

          {/* asymmetric title block */}
          <Animated.View
            style={[
              styles.heroTitleBlock,
              { opacity: entranceOpacity, transform: [{ translateY: titleEntrance }] },
            ]}
          >
            <View style={[styles.catTag, { borderColor: categoryColor }]}>
              <View style={[styles.catTagDot, { backgroundColor: categoryColor, shadowColor: categoryColor }]} />
              <Text style={[styles.catTagText, { color: categoryColor }]}>{spot.category.toUpperCase()}</Text>
            </View>

            <Text style={styles.heroNumber}>
              {String(soundSpots.findIndex((s) => s.id === spot.id) + 1).padStart(2, '0')} / {String(soundSpots.length).padStart(2, '0')}
            </Text>

            <Text style={styles.heroTitle}>{spot.name}</Text>
            {spot.historicalTitle ? (
              <Text style={styles.heroKicker}>— {spot.historicalTitle}</Text>
            ) : null}
          </Animated.View>
        </View>

        {/* CONTENT */}
        <Animated.View
          style={[
            styles.body,
            { opacity: entranceOpacity, transform: [{ translateY: entranceTranslate }] },
          ]}
        >
          {/* Hero meta strip (asymmetric) */}
          <View style={styles.metaStrip}>
            <View style={styles.metaStripLeft}>
              <Text style={styles.metaStripLabel}>COORDINATES</Text>
              <Text style={styles.metaStripValue}>
                {spot.coordinates.latitude.toFixed(4)}° · {spot.coordinates.longitude.toFixed(4)}°
              </Text>
            </View>
            {avgLevel > 0 ? (
              <View style={styles.metaStripRight}>
                <Text style={styles.metaStripLabel}>SOUND</Text>
                <Text style={[styles.metaStripValue, { color: categoryColor }]}>
                  {levelDisplay}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Address */}
          {spot.address ? (
            <Pressable onPress={openDirections} style={styles.addressCard}>
              <View style={[styles.addressIcon, { borderColor: categoryColor }]}>
                <MapPin color={categoryColor} size={14} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressLabel}>LOCATION</Text>
                <Text style={styles.addressText}>{spot.address}</Text>
              </View>
              <ExternalLink color={Colors.mist} size={14} />
            </Pressable>
          ) : null}

          {/* LIVE INFO */}
          {live && (live.hours?.length || live.tip || live.website) ? (
            <View style={styles.glassCard}>
              <View style={[styles.glassGlow, { shadowColor: categoryColor }]} />

              <View style={styles.liveHeader}>
                <View style={styles.livePulse}>
                  <View style={[styles.livePulseDot, { backgroundColor: categoryColor, shadowColor: categoryColor }]} />
                </View>
                <Text style={styles.liveHeaderText}>LIVE · NOW</Text>
              </View>

              {live.hours && live.hours.length > 0 ? (
                <View style={styles.liveSection}>
                  <View style={styles.liveSectionTitleRow}>
                    <Clock color={Colors.cyan} size={14} />
                    <Text style={styles.liveSectionTitle}>Opening Hours</Text>
                  </View>
                  <View style={styles.liveHoursList}>
                    {live.hours.map((h, i) => (
                      <View key={i} style={styles.liveHourRow}>
                        <View style={[styles.liveHourBar, { backgroundColor: categoryColor }]} />
                        <Text style={styles.liveHourText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {live.tip ? (
                <View style={styles.tipBox}>
                  <Lightbulb color={Colors.gold} size={13} />
                  <Text style={styles.tipText}>{live.tip}</Text>
                </View>
              ) : null}

              {live.website ? (
                <Pressable onPress={() => live.website && Linking.openURL(live.website)} style={styles.websiteRow}>
                  <Globe color={Colors.cyan} size={13} />
                  <Text style={styles.websiteText} numberOfLines={1}>{live.website.replace(/^https?:\/\//, '')}</Text>
                  <ExternalLink color={Colors.cyan} size={12} />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {/* AUDIO */}
          {effectiveAudioUrl ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionNum}>01</Text>
                <Text style={styles.sectionLabel}>FIELD RECORDING</Text>
                <View style={styles.sectionLine} />
              </View>
              <AudioPlayer audioUrl={effectiveAudioUrl} title={spot.name} duration="" />
            </View>
          ) : null}

          {/* SOUND LEVEL */}
          {avgLevel > 0 ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionNum}>02</Text>
                <Text style={styles.sectionLabel}>DECIBEL READING — {levelLabel.toUpperCase()}</Text>
                <View style={styles.sectionLine} />
              </View>
              <SoundLevelBadge levelMin={minLevel} levelMax={maxLevel} label={levelLabel} />
            </View>
          ) : null}

          {/* VIDEO */}
          {spot.videoUrl ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionNum}>03</Text>
                <Text style={styles.sectionLabel}>IMMERSIVE VIEW</Text>
                <View style={styles.sectionLine} />
              </View>
              <VideoEmbed videoUrl={spot.videoUrl} />
            </View>
          ) : null}

          {/* SOUND INTERPRETATION */}
          {enrichment?.soundInterpretation ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionNum}>04</Text>
                <Text style={styles.sectionLabel}>WHAT YOU HEAR</Text>
                <View style={styles.sectionLine} />
              </View>
              <View style={[styles.accentCard, { borderColor: `${categoryColor}55` }]}>
                <Volume2 color={categoryColor} size={14} />
                <Text style={[styles.accentText, { color: Colors.cloud }]}>{enrichment.soundInterpretation}</Text>
              </View>
            </View>
          ) : null}

          {/* ABORIGINAL CONTEXT */}
          {enrichment ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionNum}>05</Text>
                <Text style={styles.sectionLabel}>COUNTRY</Text>
                <View style={styles.sectionLine} />
              </View>
              <View style={styles.countryCard}>
                <View style={styles.countryHeader}>
                  <Users color={Colors.gold} size={14} />
                  <Text style={styles.countryCustodians}>{enrichment.custodians}</Text>
                </View>
                {enrichment.indigenousName ? (
                  <View style={styles.indigenousRow}>
                    <Text style={styles.indigenousLabel}>TRADITIONAL NAME</Text>
                    <Text style={styles.indigenousValue}>{enrichment.indigenousName}</Text>
                  </View>
                ) : null}
                <Text style={styles.bodyText}>{enrichment.culturalSignificance}</Text>
                <Text style={styles.acknowledgement}>
                  We acknowledge the Traditional Custodians of Country throughout Sydney and pay respect to Elders past, present and emerging.
                </Text>
              </View>
            </View>
          ) : null}

          {/* TIMELINE */}
          {enrichment && enrichment.historyTimeline.length > 0 ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionNum}>06</Text>
                <Text style={styles.sectionLabel}>TIMELINE</Text>
                <View style={styles.sectionLine} />
              </View>
              <View style={styles.timeline}>
                {enrichment.historyTimeline.map((t, i) => (
                  <View key={`tl-${i}`} style={styles.timelineRow}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineDot, { backgroundColor: categoryColor, shadowColor: categoryColor }]} />
                      {i < enrichment.historyTimeline.length - 1 ? (
                        <View style={styles.timelineLine} />
                      ) : null}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[styles.timelineYear, { color: categoryColor }]}>{t.year}</Text>
                      <Text style={styles.timelineEvent}>{t.event}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* FUN FACT */}
          {enrichment?.funFact ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionNum}>07</Text>
                <Text style={styles.sectionLabel}>INSIGHT</Text>
                <View style={styles.sectionLine} />
              </View>
              <View style={styles.funFactCard}>
                <Sparkles color={Colors.gold} size={16} />
                <Text style={styles.funFactText}>{enrichment.funFact}</Text>
              </View>
            </View>
          ) : null}

          {/* ORIGINAL HISTORY (expandable) */}
          {spot.history ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionNum}>08</Text>
                <Text style={styles.sectionLabel}>ARCHIVE NOTES</Text>
                <View style={styles.sectionLine} />
              </View>
              <Text style={styles.bodyText}>{spot.history}</Text>
            </View>
          ) : null}

          {spot.history2 ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.bodyText}>{spot.history2}</Text>
            </View>
          ) : null}

          {/* HISTORICAL RECORDS */}
          {spot.historicalRecords.length > 0 ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionNum}>09</Text>
                <Text style={styles.sectionLabel}>ARCHIVAL IMAGES</Text>
                <View style={styles.sectionLine} />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={SCREEN_W * 0.78 + 14}
                decelerationRate="fast"
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {spot.historicalRecords.map((record, index) => (
                  <View key={`hist-${index}`} style={[styles.archiveCard, { width: SCREEN_W * 0.78 }]}>
                    <Image source={{ uri: record.imageUrl }} style={styles.archiveImage} contentFit="cover" />
                    <LinearGradient
                      colors={['transparent', 'rgba(5,8,18,0.95)']}
                      style={styles.archiveOverlay}
                    />
                    <View style={styles.archiveText}>
                      <Text style={styles.archiveIndex}>A.{String(index + 1).padStart(2, '0')}</Text>
                      <Text style={styles.archivePeriod}>{record.period}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* CTA */}
          {spot.address ? (
            <Pressable onPress={openDirections} style={styles.ctaWrap} testID="directions-button">
              <LinearGradient
                colors={[Colors.cyan, '#00E0FF', Colors.violet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cta}
              >
                <MapPin color={Colors.ink} size={16} />
                <Text style={styles.ctaText}>NAVIGATE HERE</Text>
              </LinearGradient>
            </Pressable>
          ) : null}

          <View style={{ height: 60 }} />
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  accentCard: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  accentText: { flex: 1, fontSize: 14, lineHeight: 21 },
  countryCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,209,102,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,209,102,0.22)',
    gap: 12,
  },
  countryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countryCustodians: { color: Colors.gold, fontSize: 12, fontWeight: '800' as const, letterSpacing: 1, flex: 1 },
  indigenousRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(5,8,18,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,209,102,0.15)',
  },
  indigenousLabel: { color: Colors.mist, fontSize: 9, fontWeight: '900' as const, letterSpacing: 2, marginBottom: 4 },
  indigenousValue: { color: Colors.white, fontSize: 18, fontWeight: '900' as const, letterSpacing: -0.5, fontStyle: 'italic' as const },
  acknowledgement: { color: Colors.mist, fontSize: 11, lineHeight: 16, fontStyle: 'italic' as const, borderTopWidth: 1, borderTopColor: 'rgba(255,209,102,0.15)', paddingTop: 10 },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', gap: 14 },
  timelineLeft: { alignItems: 'center', width: 14 },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  timelineLine: { flex: 1, width: 1.5, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: 4, minHeight: 28 },
  timelineContent: { flex: 1, paddingBottom: 18 },
  timelineYear: { fontSize: 11, fontWeight: '900' as const, letterSpacing: 1.5, marginBottom: 4 },
  timelineEvent: { color: Colors.cloud, fontSize: 13.5, lineHeight: 19 },
  funFactCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,209,102,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,209,102,0.28)',
  },
  funFactText: { flex: 1, color: Colors.gold, fontSize: 14, lineHeight: 21, fontWeight: '500' as const },
  screen: {
    flex: 1,
    backgroundColor: '#050812',
  },
  content: {
    paddingBottom: 40,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingBottom: 12,
  },
  stickyTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800' as const,
    textAlign: 'center',
    paddingVertical: 10,
  },
  heroWrap: {
    height: 480,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  halo: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    width: 260,
    height: 260,
    marginLeft: -130,
    marginTop: -130,
    borderRadius: 130,
    shadowOpacity: 0.9,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 0 },
    backgroundColor: 'transparent',
  },
  heroHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,8,18,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  heroTitleBlock: {
    position: 'absolute',
    bottom: 28,
    left: 22,
    right: 22,
    gap: 10,
  },
  catTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(5,8,18,0.4)',
  },
  catTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  catTagText: {
    fontSize: 10,
    fontWeight: '900' as const,
    letterSpacing: 1.5,
  },
  heroNumber: {
    color: Colors.mist,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 3,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '900' as const,
    letterSpacing: -1,
  },
  heroKicker: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '600' as const,
    fontStyle: 'italic' as const,
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 20,
    gap: 22,
  },
  metaStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 14,
  },
  metaStripLeft: {
    gap: 4,
  },
  metaStripRight: {
    gap: 4,
    alignItems: 'flex-end',
  },
  metaStripLabel: {
    color: Colors.mist,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 2,
  },
  metaStripValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800' as const,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  addressIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  addressLabel: {
    color: Colors.mist,
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 1.8,
    marginBottom: 2,
  },
  addressText: {
    color: Colors.cloud,
    fontSize: 13,
    lineHeight: 18,
  },
  glassCard: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  glassGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
    shadowOpacity: 0.5,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    backgroundColor: 'transparent',
  },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  livePulse: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  liveHeaderText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  liveSection: {
    marginBottom: 14,
  },
  liveSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },
  liveSectionTitle: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  liveHoursList: {
    gap: 7,
  },
  liveHourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveHourBar: {
    width: 2,
    height: 14,
    borderRadius: 1,
  },
  liveHourText: {
    color: Colors.cloud,
    fontSize: 12.5,
    lineHeight: 17,
    flex: 1,
  },
  tipBox: {
    flexDirection: 'row',
    gap: 9,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,209,102,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,209,102,0.18)',
    marginBottom: 10,
  },
  tipText: {
    flex: 1,
    color: Colors.gold,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600' as const,
  },
  websiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  websiteText: {
    flex: 1,
    color: Colors.cyan,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  sectionBlock: {
    gap: 14,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionNum: {
    color: Colors.mist,
    fontSize: 11,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  sectionLabel: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bodyText: {
    color: Colors.cloud,
    fontSize: 14.5,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  archiveCard: {
    marginRight: 14,
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  archiveImage: {
    width: '100%',
    height: '100%',
  },
  archiveOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  archiveText: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    gap: 5,
  },
  archiveIndex: {
    color: Colors.cyan,
    fontSize: 10,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  archivePeriod: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700' as const,
    lineHeight: 18,
  },
  ctaWrap: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  ctaText: {
    color: Colors.ink,
    fontSize: 13,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
});
