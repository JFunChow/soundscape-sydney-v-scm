import { Play } from 'lucide-react-native';
import React, { memo, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

interface VideoEmbedProps {
  videoUrl: string;
  is360?: boolean;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function VideoEmbedComponent({ videoUrl, is360 = false }: VideoEmbedProps) {
  const [pressed, setPressed] = useState<boolean>(false);
  const youtubeId = getYouTubeId(videoUrl);

  const openVideo = () => {
    console.log('[video-embed] opening video', videoUrl);
    if (Platform.OS === 'web') {
      window.open(videoUrl, '_blank');
    } else {
      void Linking.openURL(videoUrl);
    }
  };

  return (
    <Pressable
      onPress={openVideo}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.container, pressed ? styles.pressed : null]}
      testID="video-embed"
    >
      <View style={styles.thumbnailWrap}>
        {youtubeId ? (
          <View style={styles.thumbnail}>
            <View style={styles.playOverlay}>
              <View style={styles.playCircle}>
                <Play color={Colors.ink} size={28} fill={Colors.ink} />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.thumbnail}>
            <View style={styles.playOverlay}>
              <View style={styles.playCircle}>
                <Play color={Colors.ink} size={28} fill={Colors.ink} />
              </View>
            </View>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>
          {is360 ? '360° Video' : 'Video'}
        </Text>
        <Text style={styles.hint}>
          {is360
            ? 'Tap to open immersive 360° experience on YouTube'
            : 'Tap to watch on YouTube'}
        </Text>
      </View>
    </Pressable>
  );
}

export const VideoEmbed = memo(VideoEmbedComponent);

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  thumbnailWrap: {
    width: '100%',
    height: 180,
    overflow: 'hidden',
  },
  thumbnail: {
    flex: 1,
    backgroundColor: 'rgba(11,23,36,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  info: {
    padding: 16,
    gap: 4,
  },
  label: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  hint: {
    color: Colors.cloud,
    fontSize: 13,
    lineHeight: 18,
  },
});
