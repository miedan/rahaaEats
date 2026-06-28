import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { SPACING, RADII } from '../constants/spacing';
import { PrimaryButton } from './PrimaryButton';
import { ApiError } from '../services/api';
import { createFoodRating } from '../services/rating.service';
import { uploadReviewPhoto } from '../services/upload.service';

const MAX_PHOTOS = 3;

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  orderId: string;
  menuItemId: string;
}

export function RateFoodModal({ visible, onClose, onSubmitted, orderId, menuItemId }: Props) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<'prompt' | 'writing'>('prompt');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleStarPress(star: number) {
    setRating(star);
    if (phase === 'prompt') setPhase('writing');
  }

  async function pickPhoto() {
    if (photoUris.length >= MAX_PHOTOS) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setPhotoUris((prev) => [...prev, result.assets[0].uri]);
  }

  function removePhoto(index: number) {
    setPhotoUris((prev) => prev.filter((_, i) => i !== index));
  }

  function reset() {
    setPhase('prompt');
    setRating(0);
    setComment('');
    setPhotoUris([]);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      const uploadedUrls = await Promise.all(photoUris.map((uri) => uploadReviewPhoto(uri)));
      await createFoodRating({
        orderId,
        menuItemId,
        rating,
        comment: comment.trim() || undefined,
        photoUrl: uploadedUrls[0],
      });
      reset();
      onSubmitted();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Try again.';
      Alert.alert('Could not submit your rating', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      {phase === 'prompt' ? (
        <View style={styles.promptBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
          <View style={styles.promptCard}>
            <Text style={styles.title}>Did you like the food!</Text>
            <Text style={styles.subtitle}>
              Please rate this food so, that we can improve it!
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => handleStarPress(star)} hitSlop={8}>
                  <Ionicons
                    name="star"
                    size={40}
                    color={star <= rating ? COLORS.ratingAmber : COLORS.borderDefault}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.sheetBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + SPACING.lg }]}>
            <View style={styles.bar} />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.title}>Did you like the food!</Text>
              <Text style={[styles.subtitle, { marginBottom: SPACING.md }]}>
                Please rate this food so, that we can improve it!
              </Text>

              <View style={[styles.starsRow, { marginBottom: SPACING.md }]}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => handleStarPress(star)} hitSlop={8}>
                    <Ionicons
                      name="star"
                      size={40}
                      color={star <= rating ? COLORS.ratingAmber : COLORS.borderDefault}
                    />
                  </Pressable>
                ))}
              </View>

              <TextInput
                style={styles.textArea}
                value={comment}
                onChangeText={setComment}
                placeholder="Write details (optional)"
                placeholderTextColor={COLORS.inactiveText}
                multiline
                textAlignVertical="top"
              />

              <Text style={[styles.attachLabel, { marginTop: SPACING.md }]}>
                Attach photos (Optional)
              </Text>
              <View style={styles.photosRow}>
                {photoUris.map((uri, index) => (
                  <View key={uri} style={styles.photoSlot}>
                    <Image source={{ uri }} style={styles.photoImage} contentFit="cover" />
                    <Pressable style={styles.photoRemove} onPress={() => removePhoto(index)}>
                      <Ionicons name="close" size={14} color={COLORS.white} />
                    </Pressable>
                  </View>
                ))}
                {photoUris.length < MAX_PHOTOS && (
                  <Pressable style={styles.photoSlot} onPress={pickPhoto}>
                    <Ionicons name="camera-outline" size={24} color={COLORS.iconDefault} />
                  </Pressable>
                )}
              </View>

              <View style={{ marginTop: SPACING.lg }}>
                <PrimaryButton
                  title="Rate"
                  onPress={handleSubmit}
                  disabled={rating === 0}
                  loading={isSubmitting}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  promptBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(159,161,158,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  promptCard: {
    width: '100%',
    backgroundColor: COLORS.elementBackground,
    borderRadius: RADII.md,
    padding: SPACING.xl,
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: COLORS.elementBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    maxHeight: '90%',
  },
  bar: {
    width: 100,
    height: 4,
    borderRadius: 16,
    backgroundColor: COLORS.disabledBackground,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: COLORS.headingText,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.paragraphText,
    lineHeight: 20,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: SPACING.xs,
  },
  textArea: {
    minHeight: 120,
    borderWidth: 2,
    borderColor: COLORS.borderPrimary,
    borderRadius: RADII.sm,
    padding: SPACING.md,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.paragraphText,
    textAlignVertical: 'top',
  },
  attachLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.paragraphText,
  },
  photosRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    flexWrap: 'wrap',
  },
  photoSlot: {
    width: 86,
    height: 65,
    borderRadius: RADII.xs,
    backgroundColor: COLORS.layer1Background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  photoImage: {
    width: 86,
    height: 65,
    borderRadius: RADII.xs,
  },
  photoRemove: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.headingText,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
