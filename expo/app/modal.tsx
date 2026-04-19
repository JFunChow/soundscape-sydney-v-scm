import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Layers3, Mic2, X } from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

export default function ModalScreen() {
  return (
    <Modal animationType="fade" transparent visible onRequestClose={() => router.back()}>
      <Pressable style={styles.overlay} onPress={() => router.back()} testID="close-modal-overlay">
        <Pressable style={styles.sheet} onPress={() => undefined} testID="product-overview-modal">
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>Product direction</Text>
              <Text style={styles.title}>This is now a real mobile app base, not a Glide wrapper.</Text>
            </View>
            <Pressable onPress={() => router.back()} style={styles.closeButton} testID="close-modal-button">
              <X color={Colors.white} size={18} />
            </Pressable>
          </View>

          <View style={styles.pointCard}>
            <Mic2 color={Colors.cyan} size={18} />
            <View style={styles.pointCopy}>
              <Text style={styles.pointTitle}>What you can fully own</Text>
              <Text style={styles.pointText}>UI, data models, favorites, future auth, CMS, map layers, audio playback, submissions, moderation, analytics.</Text>
            </View>
          </View>

          <View style={styles.pointCard}>
            <Layers3 color={Colors.gold} size={18} />
            <View style={styles.pointCopy}>
              <Text style={styles.pointTitle}>Next recommended build steps</Text>
              <Text style={styles.pointText}>1) real map layer, 2) audio player, 3) admin/backend, 4) user upload flow, 5) App Store-ready polish and content pipeline.</Text>
            </View>
          </View>
        </Pressable>
      </Pressable>
      <StatusBar style="light" />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 18, 0.76)',
    justifyContent: 'flex-end',
    padding: 18,
  },
  sheet: {
    borderRadius: 30,
    padding: 22,
    backgroundColor: Colors.slate,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  kicker: {
    color: Colors.cyan,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    color: Colors.white,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    maxWidth: 260,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pointCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  pointCopy: {
    flex: 1,
    gap: 6,
  },
  pointTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  pointText: {
    color: Colors.cloud,
    fontSize: 13,
    lineHeight: 19,
  },
});
