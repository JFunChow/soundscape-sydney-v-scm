import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react-native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  duration: string;
}

function AudioPlayerComponent({ audioUrl, title, duration }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return () => {
      console.log('[audio-player] cleaning up sound');
      if (soundRef.current) {
        void soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying, pulseAnim]);

  const loadAndPlay = useCallback(async () => {
    try {
      console.log('[audio-player] loading audio', audioUrl);
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              setPosition(status.positionMillis ?? 0);
              setTotalDuration(status.durationMillis ?? 0);
              setIsLoaded(true);
              if (status.didJustFinish) {
                setIsPlaying(false);
              }
            }
          }
        );
        soundRef.current = sound;
      } else {
        await soundRef.current.playAsync();
      }
      setIsPlaying(true);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('[audio-player] error loading audio', error);
    }
  }, [audioUrl]);

  const pause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const seek = useCallback(async (offset: number) => {
    if (soundRef.current && isLoaded) {
      const newPos = Math.max(0, Math.min(position + offset, totalDuration));
      await soundRef.current.setPositionAsync(newPos);
      void Haptics.selectionAsync();
    }
  }, [isLoaded, position, totalDuration]);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? (position / totalDuration) * 100 : 0;

  return (
    <View style={styles.container} testID="audio-player">
      <View style={styles.header}>
        <Volume2 color={Colors.cyan} size={16} />
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.duration}>{isLoaded ? formatTime(position) : '0:00'} / {isLoaded ? formatTime(totalDuration) : duration}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` as string }]} />
      </View>

      <View style={styles.controls}>
        <Pressable onPress={() => seek(-15000)} style={styles.seekButton} testID="seek-back">
          <SkipBack color={Colors.cloud} size={18} />
        </Pressable>

        <Pressable
          onPress={isPlaying ? pause : loadAndPlay}
          style={styles.playButton}
          testID="play-pause"
        >
          <Animated.View style={[styles.playButtonInner, { transform: [{ scale: pulseAnim }] }]}>
            {isPlaying ? (
              <Pause color={Colors.ink} size={22} fill={Colors.ink} />
            ) : (
              <Play color={Colors.ink} size={22} fill={Colors.ink} />
            )}
          </Animated.View>
        </Pressable>

        <Pressable onPress={() => seek(15000)} style={styles.seekButton} testID="seek-forward">
          <SkipForward color={Colors.cloud} size={18} />
        </Pressable>
      </View>
    </View>
  );
}

export const AudioPlayer = memo(AudioPlayerComponent);

const styles = StyleSheet.create({
  container: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(99,230,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(99,230,255,0.2)',
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  duration: {
    color: Colors.cloud,
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.cyan,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  seekButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  playButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cyan,
  },
});
