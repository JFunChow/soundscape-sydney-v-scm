import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Crosshair, ExternalLink, MapPin, Navigation, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import {
  categoryColors,
  getAverageSoundLevel,
  getSoundLevelLabel,
  liveInfoById,
  SoundCategory,
  soundCategories,
  soundSpots,
} from '@/data/sound-spots';

let MapView: any = null;
let Marker: any = null;
let PROVIDER_DEFAULT: any = null;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  PROVIDER_DEFAULT = maps.PROVIDER_DEFAULT;
}

const SYDNEY_REGION = {
  latitude: -33.8688,
  longitude: 151.2093,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// Neon cyberpunk inspired Sydney map — horizontal text only, minimal.
const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#05060F' }] },
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#7C4BFF' }, { weight: 0.3 }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#FF2FB8' }, { weight: 0.6 }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#A060FF' }, { weight: 0.4 }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0A0815' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#1A0B28' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#030515' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0B0820' }] },
];

function NeonMarker({ color, size = 12 }: { color: string; size?: number }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 2.2] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <View style={styles.markerBox}>
      <Animated.View
        style={[
          styles.markerRing,
          {
            width: size * 3,
            height: size * 3,
            borderRadius: size * 1.5,
            borderColor: color,
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          },
        ]}
      />
      <View
        style={[
          styles.markerDot,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color, shadowColor: color },
        ]}
      />
    </View>
  );
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [selectedCategory, setSelectedCategory] = useState<SoundCategory | 'All'>('All');
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  const filteredSpots = useMemo(() => {
    if (selectedCategory === 'All') return soundSpots;
    return soundSpots.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  const centerOnSydney = useCallback(() => {
    mapRef.current?.animateToRegion(SYDNEY_REGION, 600);
  }, []);

  const selectedSpot = useMemo(() => soundSpots.find((s) => s.id === selectedSpotId), [selectedSpotId]);

  const openInGoogleMaps = useCallback((lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    void Linking.openURL(url);
  }, []);

  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: selectedSpot ? 1 : 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 160,
    }).start();
  }, [selectedSpot, cardAnim]);

  const cardTranslate = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [140, 0] });
  const cardOpacity = cardAnim;

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerBrand}>SOUNDSCAPE</Text>
          <View style={styles.brandUnderline} />
          <Text style={styles.headerCoord}>33.8688° S · 151.2093° E</Text>
        </View>
        <Pressable onPress={centerOnSydney} style={styles.centerBtn} testID="center-button">
          <Crosshair color={Colors.cyan} size={16} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {(['All', ...soundCategories] as const).map((cat) => {
          const active = selectedCategory === cat;
          const color = cat === 'All' ? Colors.white : categoryColors[cat];
          return (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.filterChip, active && { borderColor: color, backgroundColor: `${color}18` }]}
            >
              {cat !== 'All' ? (
                <View style={[styles.filterDot, { backgroundColor: color }]} />
              ) : null}
              <Text style={[styles.filterText, active && { color }]}>{cat}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.screen}>
        <LinearGradient
          colors={['#050812', '#0E0B28', '#1B0B2E']}
          style={StyleSheet.absoluteFill}
        />
        {renderHeader()}
        <ScrollView
          style={styles.webScroll}
          contentContainerStyle={[styles.webScrollContent, { paddingTop: insets.top + 180 }]}
        >
          <View style={styles.webMapHint}>
            <Text style={styles.webHintTitle}>Interactive map</Text>
            <Text style={styles.webHintText}>Open on iOS or Android to view the live neon map. Tap any spot below to explore.</Text>
          </View>
          {filteredSpots.map((spot) => (
            <Pressable
              key={spot.id}
              onPress={() => router.push(`/spots/${spot.id}`)}
              style={styles.webRow}
            >
              <View style={[styles.webRowDot, { backgroundColor: categoryColors[spot.category], shadowColor: categoryColors[spot.category] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.webRowTitle}>{spot.name}</Text>
                <Text style={styles.webRowSub}>{spot.category} · {getSoundLevelLabel(spot)}</Text>
              </View>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  openInGoogleMaps(spot.coordinates.latitude, spot.coordinates.longitude);
                }}
                style={styles.webRowLink}
              >
                <ExternalLink color={Colors.cyan} size={15} />
              </Pressable>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={SYDNEY_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        customMapStyle={mapStyle}
        onPress={() => setSelectedSpotId(null)}
        testID="sound-map"
      >
        {filteredSpots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={spot.coordinates}
            onPress={() => setSelectedSpotId(spot.id)}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <NeonMarker color={categoryColors[spot.category]} size={selectedSpotId === spot.id ? 16 : 10} />
          </Marker>
        ))}
      </MapView>

      {/* top vignette */}
      <LinearGradient
        colors={['rgba(5,8,18,0.92)', 'rgba(5,8,18,0.6)', 'rgba(5,8,18,0)']}
        style={[styles.topVignette, { height: insets.top + 180 }]}
        pointerEvents="none"
      />

      {renderHeader()}

      {/* bottom vignette */}
      <LinearGradient
        colors={['rgba(5,8,18,0)', 'rgba(5,8,18,0.85)']}
        style={[styles.bottomVignette, { height: 180 + insets.bottom }]}
        pointerEvents="none"
      />

      {selectedSpot ? (
        <Animated.View
          style={[
            styles.floatCard,
            {
              bottom: 110 + insets.bottom,
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslate }],
            },
          ]}
          testID="selected-spot-card"
        >
          <Pressable
            onPress={() => router.push(`/spots/${selectedSpot.id}`)}
            style={styles.floatCardInner}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
              style={styles.floatGlass}
            >
              <View style={[styles.floatGlow, { shadowColor: categoryColors[selectedSpot.category] }]} />
              <Pressable onPress={() => setSelectedSpotId(null)} style={styles.closeBtn} hitSlop={12}>
                <X color={Colors.cloud} size={14} />
              </Pressable>

              <View style={styles.floatRow}>
                <View style={[styles.catTag, { borderColor: categoryColors[selectedSpot.category] }]}>
                  <View style={[styles.catTagDot, { backgroundColor: categoryColors[selectedSpot.category] }]} />
                  <Text style={[styles.catTagText, { color: categoryColors[selectedSpot.category] }]}>
                    {selectedSpot.category.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.feelingText}>{getSoundLevelLabel(selectedSpot)}</Text>
              </View>

              <Text style={styles.floatTitle} numberOfLines={2}>{selectedSpot.name}</Text>

              {liveInfoById[selectedSpot.id]?.tip ? (
                <Text style={styles.floatTip} numberOfLines={2}>{liveInfoById[selectedSpot.id].tip}</Text>
              ) : null}

              <View style={styles.floatFooter}>
                <Text style={styles.floatCTA}>Open details</Text>
                <Navigation color={Colors.cyan} size={16} />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050812',
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    gap: 6,
  },
  headerBrand: {
    color: Colors.cyan,
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: 4,
  },
  brandUnderline: {
    width: 38,
    height: 1.5,
    backgroundColor: Colors.cyan,
    opacity: 0.7,
  },
  headerCoord: {
    color: Colors.mist,
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  centerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47,255,224,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(47,255,224,0.3)',
  },
  filterRow: {
    gap: 8,
    paddingRight: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(10,13,28,0.6)',
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterText: {
    color: Colors.cloud,
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  markerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  markerRing: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  markerDot: {
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  floatCard: {
    position: 'absolute',
    left: 18,
    right: 18,
  },
  floatCardInner: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  floatGlass: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  floatGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowOpacity: 0.8,
    shadowRadius: 50,
    shadowOffset: { width: 0, height: 0 },
    backgroundColor: 'transparent',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  floatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingRight: 30,
  },
  catTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  catTagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  catTagText: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  feelingText: {
    color: Colors.mist,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  floatTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '900' as const,
    lineHeight: 26,
    marginBottom: 6,
  },
  floatTip: {
    color: Colors.cloud,
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.8,
    marginBottom: 12,
  },
  floatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  floatCTA: {
    color: Colors.cyan,
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 1.5,
  },
  webScroll: { flex: 1 },
  webScrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 140,
    gap: 8,
  },
  webMapHint: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 14,
  },
  webHintTitle: {
    color: Colors.cyan,
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 2,
    marginBottom: 6,
  },
  webHintText: {
    color: Colors.cloud,
    fontSize: 13,
    lineHeight: 19,
  },
  webRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  webRowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  webRowTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  webRowSub: {
    color: Colors.mist,
    fontSize: 12,
    marginTop: 2,
  },
  webRowLink: {
    padding: 8,
  },
  // placeholders for unused previous styles referenced nowhere now removed
  markerOuter: { width: 0, height: 0 },
  markerInner: { width: 0, height: 0 },
});
