import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AlertTriangle, Info, Mic, MicOff } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { Colors } from '@/constants/colors';

const DECIBEL_METER_URL = 'https://jfunchow.github.io/S-Sydney-Built-in-Decibel-Meter/SS.html';

type LevelCategory = { label: string; color: string; description: string };

const CATEGORIES: { threshold: number; cat: LevelCategory }[] = [
  { threshold: 40, cat: { label: 'WHISPER', color: Colors.cyan, description: 'Quieter than a library. A held breath before sound begins.' } },
  { threshold: 55, cat: { label: 'QUIET', color: Colors.teal, description: 'Rustling leaves, distant conversation. A gentle backdrop.' } },
  { threshold: 70, cat: { label: 'MODERATE', color: Colors.gold, description: 'Normal conversation, steady traffic. The everyday pulse of a city.' } },
  { threshold: 85, cat: { label: 'LIVELY', color: Colors.coral, description: 'Busy cafe, light rail passing. Expressive and kinetic.' } },
  { threshold: 999, cat: { label: 'LOUD', color: Colors.neon, description: 'Heavy traffic, crowds. Prolonged exposure may affect hearing.' } },
];

function categoryFor(db: number): LevelCategory {
  for (const { threshold, cat } of CATEGORIES) {
    if (db < threshold) return cat;
  }
  return CATEGORIES[CATEGORIES.length - 1].cat;
}

const HISTORY_LEN = 60;

export default function MeterScreen() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [rawDb, setRawDb] = useState<number>(0);
  const [smoothedDb, setSmoothedDb] = useState<number>(0);
  const [history, setHistory] = useState<number[]>([]);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const smoothedRef = useRef<number>(0);
  const peakRef = useRef<number>(0);
  const [peak, setPeak] = useState<number>(0);

  const pulse = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ring, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(ring, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, [ring]);

  useEffect(() => {
    Animated.timing(pulse, {
      toValue: Math.min(1, Math.max(0, (smoothedDb - 30) / 60)),
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [smoothedDb, pulse]);

  const stop = useCallback(async () => {
    try {
      const rec = recordingRef.current;
      recordingRef.current = null;
      setIsRecording(false);
      if (rec) {
        await rec.stopAndUnloadAsync().catch(() => {});
      }
    } catch (e) {
      console.log('[meter] stop error', e);
    }
  }, []);

  const start = useCallback(async () => {
    try {
      console.log('[meter] requesting mic permission');
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.LOW_QUALITY,
        isMeteringEnabled: true,
        android: {
          ...Audio.RecordingOptionsPresets.LOW_QUALITY.android,
          extension: '.3gp',
        },
        ios: {
          ...Audio.RecordingOptionsPresets.LOW_QUALITY.ios,
          extension: '.caf',
        },
      });
      rec.setProgressUpdateInterval(120);
      rec.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording) return;
        const metering = status.metering;
        if (typeof metering !== 'number') return;
        // metering is in dBFS (negative). Approximate SPL: map -60..0 dBFS -> 30..100 dBA
        const clamped = Math.max(-60, Math.min(0, metering));
        const approxSpl = 30 + ((clamped + 60) / 60) * 70;

        // exponential smoothing
        const alpha = 0.25;
        smoothedRef.current = smoothedRef.current === 0
          ? approxSpl
          : smoothedRef.current * (1 - alpha) + approxSpl * alpha;

        setRawDb(approxSpl);
        setSmoothedDb(smoothedRef.current);
        setHistory((prev) => {
          const next = [...prev, smoothedRef.current];
          if (next.length > HISTORY_LEN) next.shift();
          return next;
        });
        if (approxSpl > peakRef.current) {
          peakRef.current = approxSpl;
          setPeak(approxSpl);
        }
      });
      await rec.startAsync();
      recordingRef.current = rec;
      setIsRecording(true);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      console.log('[meter] start error', e);
      setPermissionDenied(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      void stop();
    };
  }, [stop]);

  const category = useMemo(() => categoryFor(smoothedDb), [smoothedDb]);
  const avg = useMemo(() => {
    if (history.length === 0) return 0;
    return history.reduce((a, b) => a + b, 0) / history.length;
  }, [history]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.screen}>
        <LinearGradient colors={['#050812', '#0E0B28', '#1B0B2E']} style={StyleSheet.absoluteFill} />
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.webHeader}>
            <Text style={styles.brand}>DECIBEL</Text>
            <View style={styles.brandLine} />
            <Text style={styles.brandMeta}>Built-in · Sydney</Text>
          </View>
          <View style={styles.webFrameWrap}>
            <iframe
              src={DECIBEL_METER_URL}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: 24 } as React.CSSProperties}
              allow="microphone"
              title="Decibel Meter"
            />
          </View>
          <Text style={styles.disclaimer}>Readings are approximate and depend on the device microphone.</Text>
        </SafeAreaView>
      </View>
    );
  }

  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const innerScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] });

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#050812', '#0A0D1C', '#160B28']} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.brand}>DECIBEL</Text>
            <View style={styles.brandLine} />
            <Text style={styles.brandMeta}>BUILT-IN · SYDNEY</Text>
          </View>

          <Text style={styles.kicker}>LIVE ENVIRONMENTAL SOUND</Text>
          <Text style={styles.title}>Listen to{'\n'}the room.</Text>

          <View style={styles.meterWrap}>
            <Animated.View
              style={[
                styles.meterRing,
                { borderColor: category.color, transform: [{ scale: ringScale }], opacity: isRecording ? ringOpacity : 0.2 },
              ]}
            />
            <Animated.View
              style={[
                styles.meterInner,
                {
                  backgroundColor: `${category.color}14`,
                  borderColor: category.color,
                  shadowColor: category.color,
                  transform: [{ scale: innerScale }],
                },
              ]}
            >
              <Text style={[styles.dbNumber, { color: Colors.white }]}>
                {isRecording ? Math.round(smoothedDb) : '—'}
              </Text>
              <Text style={styles.dbUnit}>dBA (approx)</Text>
            </Animated.View>
          </View>

          <View style={[styles.categoryPill, { borderColor: category.color, backgroundColor: `${category.color}18` }]}>
            <View style={[styles.categoryDot, { backgroundColor: category.color, shadowColor: category.color }]} />
            <Text style={[styles.categoryText, { color: category.color }]}>{category.label}</Text>
          </View>

          <Text style={styles.categoryDescription}>{category.description}</Text>

          {/* Waveform history */}
          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyLabel}>LAST {HISTORY_LEN} READINGS</Text>
              <Text style={styles.historyMeta}>
                AVG {isRecording && avg > 0 ? `${Math.round(avg)} dBA` : '—'}  ·  PEAK {peak > 0 ? `${Math.round(peak)}` : '—'}
              </Text>
            </View>
            <View style={styles.bars}>
              {Array.from({ length: HISTORY_LEN }).map((_, i) => {
                const v = history[i] ?? 0;
                const h = Math.max(3, Math.min(1, (v - 30) / 60) * 62);
                const c = categoryFor(v).color;
                return (
                  <View
                    key={`bar-${i}`}
                    style={[
                      styles.bar,
                      {
                        height: v > 0 ? h : 3,
                        backgroundColor: v > 0 ? c : 'rgba(255,255,255,0.08)',
                      },
                    ]}
                  />
                );
              })}
            </View>
            <View style={styles.scaleRow}>
              <Text style={styles.scaleText}>30</Text>
              <Text style={styles.scaleText}>60</Text>
              <Text style={styles.scaleText}>90 dBA</Text>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {CATEGORIES.slice(0, 5).map((c) => (
              <View key={c.cat.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: c.cat.color }]} />
                <Text style={styles.legendText}>{c.cat.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.disclaimerBox}>
            <Info color={Colors.mist} size={13} />
            <Text style={styles.disclaimer}>
              Readings are approximate. Smartphone microphones are not calibrated for scientific SPL measurement — values are useful for relative comparisons between environments.
            </Text>
          </View>

          {permissionDenied ? (
            <View style={styles.warnBox}>
              <AlertTriangle color={Colors.gold} size={14} />
              <Text style={styles.warnText}>Microphone permission denied. Enable it in Settings to start listening.</Text>
            </View>
          ) : null}

          <Pressable
            onPress={isRecording ? stop : start}
            style={[styles.button, { borderColor: isRecording ? Colors.neon : Colors.cyan }]}
            testID="meter-toggle"
          >
            {isRecording ? (
              <MicOff color={Colors.neon} size={18} />
            ) : (
              <Mic color={Colors.cyan} size={18} />
            )}
            <Text style={[styles.buttonText, { color: isRecording ? Colors.neon : Colors.cyan }]}>
              {isRecording ? 'STOP LISTENING' : 'START LISTENING'}
            </Text>
          </Pressable>

          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050812' },
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 22 },
  brand: { color: Colors.cyan, fontSize: 13, fontWeight: '900', letterSpacing: 3 },
  brandLine: { flex: 1, height: 1, backgroundColor: 'rgba(47,255,224,0.25)' },
  brandMeta: { color: Colors.mist, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  kicker: { color: Colors.mist, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  title: { color: Colors.white, fontSize: 42, lineHeight: 44, fontWeight: '900', letterSpacing: -1.5, marginBottom: 28 },
  meterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
    marginBottom: 20,
  },
  meterRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1.5,
  },
  meterInner: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowOpacity: 0.8,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  dbNumber: { fontSize: 78, fontWeight: '900', letterSpacing: -3, lineHeight: 82, includeFontPadding: false },
  dbUnit: { color: Colors.mist, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginTop: 4 },
  categoryPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 12,
  },
  categoryDot: { width: 6, height: 6, borderRadius: 3, shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
  categoryText: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  categoryDescription: { textAlign: 'center', color: Colors.cloud, fontSize: 13, lineHeight: 19, paddingHorizontal: 10, marginBottom: 24 },
  historyCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 18,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  historyLabel: { color: Colors.white, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  historyMeta: { color: Colors.mist, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 70,
    gap: 2,
  },
  bar: { flex: 1, borderRadius: 1.5 },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  scaleText: { color: Colors.mist, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { color: Colors.mist, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  disclaimerBox: {
    flexDirection: 'row',
    gap: 9,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
  },
  disclaimer: { flex: 1, color: Colors.mist, fontSize: 11, lineHeight: 16 },
  warnBox: {
    flexDirection: 'row',
    gap: 9,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,209,102,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,209,102,0.25)',
    marginBottom: 14,
  },
  warnText: { flex: 1, color: Colors.gold, fontSize: 12, lineHeight: 17, fontWeight: '600' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(5,8,18,0.6)',
  },
  buttonText: { fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  webHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 22, marginTop: 6, marginBottom: 16 },
  webFrameWrap: { flex: 1, marginHorizontal: 22, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 12 },
});
