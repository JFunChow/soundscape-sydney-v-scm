import { LinearGradient } from 'expo-linear-gradient';
import { Activity } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { Colors, Gradients } from '@/constants/colors';

const DECIBEL_METER_URL = 'https://jfunchow.github.io/S-Sydney-Built-in-Decibel-Meter/SS.html';

export default function MeterScreen() {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  if (Platform.OS === 'web') {
    return (
      <LinearGradient colors={Gradients.appBackground} style={styles.screen}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <Activity color={Colors.coral} size={22} />
            <Text style={styles.title}>Decibel Meter</Text>
          </View>
          <View style={styles.webFallback}>
            <iframe
              src={DECIBEL_METER_URL}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: 16 } as React.CSSProperties}
              allow="microphone"
            />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Gradients.appBackground} style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Activity color={Colors.coral} size={22} />
          <Text style={styles.title}>Decibel Meter</Text>
        </View>
        <Text style={styles.subtitle}>Measure sound levels in real-time using your device microphone</Text>
        <View style={styles.webviewContainer}>
          {isLoading ? (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Loading meter...</Text>
            </View>
          ) : null}
          <WebView
            ref={webViewRef}
            source={{ uri: DECIBEL_METER_URL }}
            style={styles.webview}
            onLoadEnd={() => setIsLoading(false)}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            mediaCapturePermissionGrantType="grant"
            javaScriptEnabled
            domStorageEnabled
            testID="decibel-webview"
          />
        </View>
        <Pressable
          onPress={() => webViewRef.current?.reload()}
          style={styles.reloadButton}
          testID="reload-meter"
        >
          <Text style={styles.reloadText}>Reload Meter</Text>
        </Pressable>
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
    marginBottom: 6,
  },
  title: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: Colors.cloud,
    fontSize: 13,
    marginBottom: 16,
  },
  webviewContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.night,
  },
  loadingText: {
    color: Colors.cloud,
    fontSize: 15,
    fontWeight: '600',
  },
  reloadButton: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 100,
  },
  reloadText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  webFallback: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 100,
  },
});
