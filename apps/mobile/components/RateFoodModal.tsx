import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  orderId: string;
  menuItemId: string;
}

export function RateFoodModal({ visible, onClose, onSubmitted, orderId, menuItemId }: Props) {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  function reset() {
    setRating(0);
    setComment('');
    setPhotoUri(null);
  }

  async function handleSubmit() {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      const photoUrl = photoUri ? await uploadReviewPhoto(photoUri) : undefined;
      await createFoodRating({ orderId, menuItemId, rating, comment: comment || undefined, photoUrl });
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + SPACING.lg }]}>
        <View style={styles.bar} />
        <Text style={styles.title}>Did you like the food!</Text>
        <Text style={styles.subtitle}>Please rate this food so, that we can improve it!</Text>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating(star)} hitSlop={8}>
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
          placeholderTextColor={COLORS.paragraphText}
          multiline
        />

        <Text style={styles.attachLabel}>Attach photos (Optional)</Text>
        {photoUri ? (
          <View style={styles.photoSlot}>
            <Image source={{ uri: photoUri }} style={styles.photoImage} contentFit="cover" />
            <Pressable style={styles.photoRemove} onPress={() => setPhotoUri(null)}>
              <Ionicons name="close" size={14} color={COLORS.white} />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.photoSlot} onPress={pickPhoto}>
            <Ionicons name="camera-outline" size={24} color={COLORS.iconDefault} />
          </Pressable>
        )}

        <PrimaryButton title="Rate" onPress={handleSubmit} disabled={rating === 0} loading={isSubmitting} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: COLORS.elementBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
  },
  bar: {
    width: 100,
    height: 4,
    borderRadius: 16,
    backgroundColor: COLORS.disabledBackground,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: COLORS.headingText,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.paragraphText,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  textArea: {
    minHeight: 120,
    maxHeight: 188,
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
  photoSlot: {
    width: 86,
    height: 65,
    borderRadius: RADII.xs,
    backgroundColor: COLORS.layer1Background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.headingText,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
