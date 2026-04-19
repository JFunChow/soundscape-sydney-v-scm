import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Crosshair, ExternalLink, MapPin, Navigation } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryPill } from '@/components/category-pill';
import { Colors } from '@/constants/colors';
import {
  categoryColors,
  getAverageSoundLevel,
  getSoundLevelDisplay,
  getSoundLevelLabel,
  SoundCategory,
  soundCategories,
  soundSpots,
} from '@/data/sound-spots';

let MapView: any = null;
let Marker: any = null;
let Callout: any = null;
let PROVIDER_DEFAULT: any = null;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Callout = maps.Callout;
  PROVIDER_DEFAULT = maps.PROVIDER_DEFAULT;
}

const SYDNEY_REGION = {
  latitude: -33.8688,
  longitude: 151.2093,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0B1724' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0B1724' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8CA3B8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#07111C' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#13273A' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0F2218' }] },
];

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
    console.log('[map] centering on Sydney');
    mapRef.current?.animateToRegion(SYDNEY_REGION, 600);
  }, []);

  const handleMarkerPress = useCallback((spotId: string) => {
    console.log('[map] marker pressed', spotId);
    setSelectedSpotId(spotId);
  }, []);

  const selectedSpot = useMemo(() => {
    return soundSpots.find((s) => s.id === selectedSpotId);
  }, [selectedSpotId]);

  const openInGoogleMaps = useCallback((lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.screen}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <View style={styles.topBarContent}>
            <View>
              <Text style={styles.topTitle}>Sound Map</Text>
              <Text style={styles.topSubtitle}>{filteredSpots.length} locations in Sydney</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollWeb}>
            <CategoryPill label="All" isActive={selectedCategory === 'All'} onPress={() => setSelectedCategory('All')} />
            {soundCategories.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                isActive={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
              />
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.webListScroll}
          contentContainerStyle={[styles.webListContent, { paddingTop: insets.top + 120 }]}
        >
          {filteredSpots.map((spot) => {
            const avgLevel = getAverageSoundLevel(spot);
            const levelDisplay = getSoundLevelDisplay(spot);
            const levelLabel = getSoundLevelLabel(spot);
            return (
              <Pressable
                key={spot.id}
                onPress={() => router.push(`/spots/${spot.id}`)}
                style={styles.webSpotCard}
              >
                <LinearGradient
                  colors={['rgba(19,39,58,0.95)', 'rgba(11,23,36,0.95)']}
                  style={styles.webSpotCardGrad}
                >
                  <View style={styles.webSpotRow}>
                    <View style={[styles.markerOuter, { borderColor: categoryColors[spot.category] }]}>
                      <View style={[styles.markerInner, { backgroundColor: categoryColors[spot.category] }]}>
                        <MapPin color={Colors.ink} size={14} />
                      </View>
                    </View>
                    <View style={styles.webSpotInfo}>
                      <Text style={styles.webSpotTitle}>{spot.name}</Text>
                      <Text style={styles.webSpotSub}>
                        {spot.category}{avgLevel > 0 ? ` · ${levelLabel} · ${levelDisplay}` : ''}
                      </Text>
                    </View>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        openInGoogleMaps(spot.coordinates.latitude, spot.coordinates.longitude);
                      }}
                      style={styles.webMapLink}
                    >
                      <ExternalLink color={Colors.cyan} size={16} />
                    </Pressable>
                  </View>
                </LinearGradient>
              </Pressable>
            );
          })}
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
        customMapStyle={mapStyle}
        testID="sound-map"
      >
        {filteredSpots.map((spot) => {
          const avgLevel = getAverageSoundLevel(spot);
          return (
            <Marker
              key={spot.id}
              coordinate={spot.coordinates}
              onPress={() => handleMarkerPress(spot.id)}
              tracksViewChanges={false}
            >
              <View style={[styles.markerOuter, { borderColor: categoryColors[spot.category] }]}>
                <View style={[styles.markerInner, { backgroundColor: categoryColors[spot.category] }]}>
                  <MapPin color={Colors.ink} size={14} />
                </View>
              </View>
              <Callout tooltip onPress={() => router.push(`/spots/${spot.id}`)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{spot.name}</Text>
                  <Text style={styles.calloutSub}>{spot.category}{avgLevel > 0 ? ` · ${avgLevel} dB` : ''}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topBarContent}>
          <View>
            <Text style={styles.topTitle}>Sound Map</Text>
            <Text style={styles.topSubtitle}>{filteredSpots.length} locations in Sydney</Text>
          </View>
          <View style={styles.topActions}>
            <Pressable onPress={centerOnSydney} style={styles.actionButton} testID="center-button">
              <Crosshair color={Colors.white} size={18} />
            </Pressable>
          </View>
        </View>

        <View style={styles.categoryScroll}>
          <CategoryPill label="All" isActive={selectedCategory === 'All'} onPress={() => setSelectedCategory('All')} />
          {soundCategories.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              isActive={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          ))}
        </View>
      </View>

      {selectedSpot ? (
        <Pressable
          onPress={() => router.push(`/spots/${selectedSpot.id}`)}
          style={[styles.bottomCard, { bottom: 110 + insets.bottom }]}
          testID="selected-spot-card"
        >
          <LinearGradient
            colors={['rgba(19,39,58,0.98)', 'rgba(11,23,36,0.98)']}
            style={styles.bottomCardGrad}
          >
            <View style={styles.bottomCardContent}>
              <View style={[styles.categoryDot, { backgroundColor: categoryColors[selectedSpot.category] }]} />
              <View style={styles.bottomCardText}>
                <Text style={styles.bottomCardTitle}>{selectedSpot.name}</Text>
                <Text style={styles.bottomCardSub}>
                  {selectedSpot.category} · {getSoundLevelLabel(selectedSpot)}
                </Text>
              </View>
              <Navigation color={Colors.cyan} size={20} />
            </View>
          </LinearGradient>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.night,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: 'rgba(7,17,28,0.85)',
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  topTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '900',
  },
  topSubtitle: {
    color: Colors.cloud,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 0,
  },
  markerOuter: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,17,28,0.7)',
  },
  markerInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callout: {
    backgroundColor: Colors.slate,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 220,
  },
  calloutTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  calloutSub: {
    color: Colors.cloud,
    fontSize: 12,
    marginTop: 2,
  },
  bottomCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  bottomCardGrad: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bottomCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bottomCardText: {
    flex: 1,
    gap: 4,
  },
  bottomCardTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  bottomCardSub: {
    color: Colors.cloud,
    fontSize: 13,
  },
  categoryScrollWeb: {
    flexGrow: 0,
  },
  webListScroll: {
    flex: 1,
  },
  webListContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 12,
  },
  webSpotCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  webSpotCardGrad: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  webSpotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  webSpotInfo: {
    flex: 1,
    gap: 4,
  },
  webSpotTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  webSpotSub: {
    color: Colors.cloud,
    fontSize: 13,
  },
  webMapLink: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
