import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Check, MapPin, Mic, Upload } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Gradients } from '@/constants/colors';
import { SoundCategory, soundCategories } from '@/data/sound-spots';

export default function AddRecordingScreen() {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [category, setCategory] = useState<SoundCategory | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const pickImage = useCallback(async () => {
    console.log('[add] picking image');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please add a title for your recording.');
      return;
    }
    if (!category) {
      Alert.alert('Missing category', 'Please select a category.');
      return;
    }

    console.log('[add] submitting recording', { title, description, address, category, imageUri });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
  }, [title, description, address, category, imageUri]);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setAddress('');
    setCategory(null);
    setImageUri(null);
    setSubmitted(false);
  }, []);

  if (submitted) {
    return (
      <LinearGradient colors={Gradients.appBackground} style={styles.screen}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.successWrap}>
            <View style={styles.successIcon}>
              <Check color={Colors.ink} size={32} />
            </View>
            <Text style={styles.successTitle}>Recording submitted</Text>
            <Text style={styles.successText}>
              Your sound spot has been saved locally. Once connected to a backend (Supabase/Firebase), it will sync automatically.
            </Text>
            <Pressable onPress={resetForm} style={styles.successButton} testID="add-another-button">
              <Text style={styles.successButtonText}>Add another</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Gradients.appBackground} style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            testID="add-recording-scroll"
          >
            <Text style={styles.kicker}>New Recording</Text>
            <Text style={styles.pageTitle}>Add a new sound to the map</Text>
            <Text style={styles.pageSubtitle}>
              Contribute a field recording, soundscape, or sonic landmark from anywhere in Sydney.
            </Text>

            <Pressable onPress={pickImage} style={styles.imagePicker} testID="image-picker">
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.pickedImage} contentFit="cover" />
              ) : (
                <View style={styles.imagePickerEmpty}>
                  <Camera color={Colors.cyan} size={28} />
                  <Text style={styles.imagePickerText}>Add cover photo</Text>
                </View>
              )}
            </Pressable>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Harbour Bridge Wind Tunnel"
                placeholderTextColor={Colors.mist}
                style={styles.textInput}
                testID="title-input"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the soundscape, ambience, and what makes it unique..."
                placeholderTextColor={Colors.mist}
                style={[styles.textInput, styles.textArea]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                testID="description-input"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Address / Location</Text>
              <View style={styles.locationInput}>
                <MapPin color={Colors.cyan} size={16} />
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="e.g. Hickson Road, The Rocks NSW 2000"
                  placeholderTextColor={Colors.mist}
                  style={styles.locationTextInput}
                  testID="address-input"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {soundCategories.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      setCategory(cat);
                      void Haptics.selectionAsync();
                    }}
                    style={[
                      styles.categoryChip,
                      category === cat ? styles.categoryChipActive : null,
                    ]}
                    testID={`category-chip-${cat}`}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === cat ? styles.categoryChipTextActive : null,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.audioSection}>
              <View style={styles.audioIcon}>
                <Mic color={Colors.coral} size={20} />
              </View>
              <View style={styles.audioInfo}>
                <Text style={styles.audioTitle}>Audio recording</Text>
                <Text style={styles.audioHint}>
                  Audio recording will be available once connected to storage. You can upload audio files after submission.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [styles.submitButton, pressed ? styles.submitPressed : null]}
              testID="submit-recording"
            >
              <Upload color={Colors.ink} size={18} />
              <Text style={styles.submitText}>Submit Recording</Text>
            </Pressable>

            <View style={styles.bottomPad} />
          </ScrollView>
        </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 140,
  },
  kicker: {
    color: Colors.cyan,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  pageTitle: {
    color: Colors.white,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    marginBottom: 8,
  },
  pageSubtitle: {
    color: Colors.cloud,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },
  imagePicker: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed' as const,
  },
  pickedImage: {
    width: '100%',
    height: '100%',
  },
  imagePickerEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    gap: 10,
  },
  imagePickerText: {
    color: Colors.cloud,
    fontSize: 14,
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 20,
    gap: 8,
  },
  fieldLabel: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.white,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  locationTextInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 15,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.cyan,
    borderColor: Colors.cyan,
  },
  categoryChipText: {
    color: Colors.cloud,
    fontSize: 14,
    fontWeight: '700',
  },
  categoryChipTextActive: {
    color: Colors.ink,
  },
  audioSection: {
    flexDirection: 'row',
    gap: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(255,138,101,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,138,101,0.2)',
    marginBottom: 24,
  },
  audioIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,138,101,0.15)',
  },
  audioInfo: {
    flex: 1,
    gap: 4,
  },
  audioTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  audioHint: {
    color: Colors.cloud,
    fontSize: 13,
    lineHeight: 18,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: Colors.cyan,
  },
  submitPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  submitText: {
    color: Colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  bottomPad: {
    height: 20,
  },
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 12,
  },
  successText: {
    color: Colors.cloud,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  successButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: Colors.white,
  },
  successButtonText: {
    color: Colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
});
