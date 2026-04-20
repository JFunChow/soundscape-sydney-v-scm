import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Crosshair, ExternalLink, MapPin, Navigation, Navigation2, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import {
  categoryColors,
  getSoundLevelLabel,
  liveInfoById,
  SoundCategory,
  soundCategories,
  SoundSpot,
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

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#05060F' }] },
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'labels', stylers: [{ visibility: 'off' }] },
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

function haversine(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function NeonMarker({ color, size = 12, focused }: { color: string; size?: number; focused?: boolean }) {
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
        pointerEvents="none"
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
          {
            width: focused ? size * 1.5 : size,
            height: focused ? size * 1.5 : size,
            borderRadius: (focused ? size * 1.5 : size) / 2,
            backgroundColor: color,
            shadowColor: color,
            borderWidth: focused ? 2 : 0,
            borderColor: Colors.white,
          },
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
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const filteredSpots = useMemo(() => {
    if (selectedCategory === 'All') return soundSpots;
    return soundSpots.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  const nearbySpots = useMemo(() => {
    if (!userLocation) return [] as (SoundSpot & { distance: number })[];
    return soundSpots
      .map((s) => ({ ...s, distance: haversine(userLocation, s.coordinates) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }, [userLocation]);

  const requestLocation = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
            },
            (err) => {
              console.log('[map] web geo error', err);
              setLocationError('Location unavailable');
            }
          );
        }
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (e) {
      console.log('[map] location error', e);
      setLocationError('Location unavailable');
    }
  }, []);

  useEffect(() => {
    void requestLocation();
  }, [requestLocation]);

  const centerOnSydney = useCallback(() => {
    mapRef.current?.animateToRegion(SYDNEY_REGION, 600);
  }, []);

  const centerOnUser = useCallback(() => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        { ...userLocation, latitudeDelta: 0.04, longitudeDelta: 0.04 },
        600
      );
    } else {
      void requestLocation();
    }
  }, [userLocation, requestLocation]);

  const selectedSpot = useMemo(() => soundSpots.find((s) => s.id === selectedSpotId), [selectedSpotId]);

  const openInGoogleMaps = useCallback((lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    void Linking.openURL(url);
  }, []);

  const navigateTo = useCallback((spot: SoundSpot) => {
    const { latitude, longitude } = spot.coordinates;
    const url = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}`,
      android: `google.navigation:q=${latitude},${longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
    });
    if (url) void Linking.openURL(url);
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
          <Text style={styles.headerCoord} numberOfLines={1}>
            {userLocation
              ? `${userLocation.latitude.toFixed(4)}°  ${userLocation.longitude.toFixed(4)}°`
              : '33.8688° S · 151.2093° E'}
          </Text>
        </View>
        <View style={styles.headerBtns}>
          <Pressable onPress={centerOnUser} style={styles.centerBtn} testID="locate-me-button">
            <Navigation2 color={Colors.cyan} size={15} />
          </Pressable>
          <Pressable onPress={centerOnSydney} style={styles.centerBtn} testID="center-button">
            <Crosshair color={Colors.cyan} size={15} />
          </Pressable>
        </View>
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
              {cat !== 'All' ? <View style={[styles.filterDot, { backgroundColor: color }]} /> : null}
              <Text style={[styles.filterText, active && { color }]} numberOfLines={1}>{cat}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderNearby = () => {
    if (selectedSpot) return null;
    if (nearbySpots.length === 0) return null;
    return (
      <View style={[styles.nearbyWrap, { bottom: 110 + insets.bottom }]} pointerEvents="box-none">
        <Text style={styles.nearbyLabel}>NEARBY SOUNDSCAPES</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nearbyList}>
          {nearbySpots.map((spot) => {
            const color = categoryColors[spot.category];
            return (
              <Pressable
                key={spot.id}
                onPress={() => router.push(`/spots/${spot.id}`)}
                style={styles.nearbyCard}
                testID={`nearby-${spot.id}`}
              >
                <View style={[styles.nearbyDot, { backgroundColor: color, shadowColor: color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.nearbyName} numberOfLines={1}>{spot.name}</Text>
                  <Text style={styles.nearbyMeta} numberOfLines={1}>
                    {formatDistance(spot.distance)} · {spot.category}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.screen}>
        <LinearGradient colors={['#050812', '#0E0B28', '#1B0B2E']} style={StyleSheet.absoluteFill} />
        {renderHeader()}
        <ScrollView
          style={styles.webScroll}
          contentContainerStyle={[styles.webScrollContent, { paddingTop: insets.top + 180 }]}
        >
          <View style={styles.webMapHint}>
            <Text style={styles.webHintTitle}>Interactive map</Text>
            <Text style={styles.webHintText}>
              Open on iOS or Android to view the live neon map and use real-time location. Tap any spot below to explore.
            </Text>
          </View>
          {filteredSpots.map((spot) => (
            <Pressable
              key={spot.id}
              onPress={() => router.push(`/spots/${spot.id}`)}
              style={styles.webRow}
            >
              <View style={[styles.webRowDot, { backgroundColor: categoryColors[spot.category], shadowColor: categoryColors[spot.category] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.webRowTitle} numberOfLines={2}>{spot.name}</Text>
                <Text style={styles.webRowSub} numberOfLines={1}>{spot.category} · {getSoundLevelLabel(spot)}</Text>
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
            onPress={(e: any) => {
              e?.stopPropagation?.();
              console.log('[map] marker tap -> detail', spot.id);
              router.push(`/spots/${spot.id}`);
            }}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 0.5 }}
            stopPropagation
            testID={`marker-${spot.id}`}
          >
            <NeonMarker
              color={categoryColors[spot.category]}
              size={selectedSpotId === spot.id ? 14 : 10}
              focused={selectedSpotId === spot.id}
            />
          </Marker>
        ))}
      </MapView>

      <LinearGradient
        colors={['rgba(5,8,18,0.92)', 'rgba(5,8,18,0.6)', 'rgba(5,8,18,0)']}
        style={[styles.topVignette, { height: insets.top + 180 }]}
        pointerEvents="none"
      />

      {renderHeader()}

      <LinearGradient
        colors={['rgba(5,8,18,0)', 'rgba(5,8,18,0.85)']}
        style={[styles.bottomVignette, { height: 220 + insets.bottom }]}
        pointerEvents="none"
      />

      {renderNearby()}

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
                <Text style={styles.feelingText}>
                  {userLocation
                    ? formatDistance(haversine(userLocation, selectedSpot.coordinates))
                    : getSoundLevelLabel(selectedSpot)}
                </Text>
              </View>

              <Text style={styles.floatTitle} numberOfLines={2}>{selectedSpot.name}</Text>

              {liveInfoById[selectedSpot.id]?.tip ? (
                <Text style={styles.floatTip} numberOfLines={2}>{liveInfoById[selectedSpot.id].tip}</Text>
              ) : null}

              <View style={styles.floatFooter}>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    navigateTo(selectedSpot);
                  }}
                  style={styles.floatNavBtn}
                  hitSlop={8}
                >
                  <Navigation color={Colors.cyan} size={13} />
                  <Text style={styles.floatNavText}>NAVIGATE</Text>
                </Pressable>
                <Text style={styles.floatCTA}>OPEN DETAILS →</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      ) : null}

      {locationError ? (
        <View style={[styles.errorBanner, { top: insets.top + 150 }]} pointerEvents="none">
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050812' },
  topVignette: { position: 'absolute', top: 0, left: 0, right: 0 },
  bottomVignette: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  header: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 22, paddingBottom: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  headerLeft: { gap: 6, flex: 1, paddingRight: 10 },
  headerBrand: { color: Colors.cyan, fontSize: 18, fontWeight: '900' as const, letterSpacing: 4 },
  brandUnderline: { width: 38, height: 1.5, backgroundColor: Colors.cyan, opacity: 0.7 },
  headerCoord: { color: Colors.mist, fontSize: 10, fontWeight: '600' as const, letterSpacing: 1.5, marginTop: 2 },
  headerBtns: { flexDirection: 'row', gap: 8 },
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
  filterRow: { gap: 8, paddingRight: 20 },
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
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterText: { color: Colors.cloud, fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.5 },
  markerBox: { alignItems: 'center', justifyContent: 'center', width: 44, height: 44 },
  markerRing: { position: 'absolute', borderWidth: 1.5 },
  markerDot: { shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
  nearbyWrap: { position: 'absolute', left: 0, right: 0 },
  nearbyLabel: {
    color: Colors.mist,
    fontSize: 10,
    fontWeight: '900' as const,
    letterSpacing: 2,
    paddingHorizontal: 22,
    marginBottom: 10,
  },
  nearbyList: { paddingHorizontal: 18, gap: 10 },
  nearbyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(5,8,18,0.85)',
    minWidth: 200,
    maxWidth: 260,
  },
  nearbyDot: { width: 8, height: 8, borderRadius: 4, shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
  nearbyName: { color: Colors.white, fontSize: 13, fontWeight: '800' as const },
  nearbyMeta: { color: Colors.mist, fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.8, marginTop: 2 },
  floatCard: { position: 'absolute', left: 18, right: 18 },
  floatCardInner: { borderRadius: 24, overflow: 'hidden' },
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
  catTagDot: { width: 5, height: 5, borderRadius: 2.5 },
  catTagText: { fontSize: 10, fontWeight: '800' as const, letterSpacing: 1 },
  feelingText: { color: Colors.mist, fontSize: 11, fontWeight: '700' as const, letterSpacing: 1, textTransform: 'uppercase' as const },
  floatTitle: { color: Colors.white, fontSize: 22, fontWeight: '900' as const, lineHeight: 26, marginBottom: 6 },
  floatTip: { color: Colors.cloud, fontSize: 12, lineHeight: 17, opacity: 0.8, marginBottom: 12 },
  floatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  floatNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(47,255,224,0.3)',
    backgroundColor: 'rgba(47,255,224,0.08)',
  },
  floatNavText: { color: Colors.cyan, fontSize: 10, fontWeight: '900' as const, letterSpacing: 1.5 },
  floatCTA: { color: Colors.cyan, fontSize: 11, fontWeight: '800' as const, letterSpacing: 1.5 },
  errorBanner: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,209,102,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,209,102,0.4)',
  },
  errorText: { color: Colors.gold, fontSize: 11, fontWeight: '700' as const },
  webScroll: { flex: 1 },
  webScrollContent: { paddingHorizontal: 18, paddingBottom: 140, gap: 8 },
  webMapHint: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 14,
  },
  webHintTitle: { color: Colors.cyan, fontSize: 12, fontWeight: '800' as const, letterSpacing: 2, marginBottom: 6 },
  webHintText: { color: Colors.cloud, fontSize: 13, lineHeight: 19 },
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
  webRowTitle: { color: Colors.white, fontSize: 15, fontWeight: '700' as const },
  webRowSub: { color: Colors.mist, fontSize: 12, marginTop: 2 },
  webRowLink: { padding: 8 },
});
