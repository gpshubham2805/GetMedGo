import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from '@/constants/theme';

import Button from '@/components/Button';
import AnalyzingOverlay from '@/components/AnalyzingOverlay';
import { analyzePrescription } from '@/utils/ai';
import { saveScanResult } from '@/utils/storage';

// Use the real backend + Gemini
const USE_MOCK = false;

export default function ScanScreen() {
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // ---------------------------------------------------------
  // CAMERA
  // ---------------------------------------------------------
  const pickFromCamera = async () => {
    const { status } =
      await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera access is needed to scan prescriptions.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // ---------------------------------------------------------
  // GALLERY
  // ---------------------------------------------------------
  const pickFromGallery = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Gallery access is needed to upload prescription images.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // ---------------------------------------------------------
  // ANALYZE PRESCRIPTION
  // ---------------------------------------------------------
  const handleAnalyze = async () => {
    if (!selectedImage) {
      return;
    }

    setAnalyzing(true);

    try {
      let result;

      if (USE_MOCK) {
        // Mock mode is disabled.
        // This is kept only as a safety fallback.
        throw new Error(
          'Mock analysis is disabled. Please use the backend.'
        );
      }

      // Send image to GetMedGo backend
// Backend then sends it to Gemini.
result = await analyzePrescription(selectedImage);

// Make sure every prescription has a stable local ID.
// The backend/Gemini response does not provide one.
const resultWithId = {
  ...result,
  imageUri: selectedImage,
  id:
    result.id ||
    `scan-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
};

// Save result locally
await saveScanResult(resultWithId);

setAnalyzing(false);

// Open result screen
router.replace({
  pathname: '/result',
  params: {
    id: resultWithId.id,
  },
});
    } catch (error) {
      setAnalyzing(false);

      console.error('Prescription analysis error:', error);

      Alert.alert(
        'Analysis Failed',
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // ---------------------------------------------------------
  // RETAKE
  // ---------------------------------------------------------
  const handleRetake = () => {
    setSelectedImage(null);
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <AnalyzingOverlay visible={analyzing} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="close"
            size={24}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Scan Prescription
        </Text>

        <View style={styles.placeholder} />
      </View>

      {selectedImage ? (
        // ---------------------------------------------------
        // PREVIEW MODE
        // ---------------------------------------------------
        <View style={styles.previewContainer}>
          <View style={styles.imagePreviewWrapper}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.imagePreview}
            />

            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleRetake}
            >
              <Ionicons
                name="refresh"
                size={18}
                color={Colors.textInverse}
              />

              <Text style={styles.retakeText}>
                Retake
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.previewInfo}>
            <View style={styles.infoRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.success}
              />

              <Text style={styles.infoText}>
                Image captured successfully
              </Text>
            </View>

            <Text style={styles.infoSubtext}>
              Make sure the prescription text is clear and
              readable for best results.
            </Text>
          </View>

          <View style={styles.previewActions}>
            <Button
              title="Analyze Prescription"
              onPress={handleAnalyze}
              size="lg"
              fullWidth
              icon={
                <Ionicons
                  name="sparkles"
                  size={20}
                  color={Colors.textInverse}
                />
              }
            />
          </View>
        </View>
      ) : (
        // ---------------------------------------------------
        // SELECTION MODE
        // ---------------------------------------------------
        <View style={styles.selectionContainer}>
          <View style={styles.illustrationArea}>
            <View style={styles.illustrationCircle}>
              <Ionicons
                name="document-text-outline"
                size={64}
                color={Colors.primary}
              />
            </View>

            <Text style={styles.illustrationTitle}>
              Upload or capture your prescription
            </Text>

            <Text style={styles.illustrationSubtitle}>
              Our AI will read and simplify it for you
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {/* CAMERA */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={pickFromCamera}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor:
                      Colors.primarySurface,
                  },
                ]}
              >
                <Ionicons
                  name="camera"
                  size={28}
                  color={Colors.primary}
                />
              </View>

              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>
                  Take Photo
                </Text>

                <Text style={styles.optionDesc}>
                  Use camera to capture
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>

            {/* GALLERY */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={pickFromGallery}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor: '#EDE9FE',
                  },
                ]}
              >
                <Ionicons
                  name="images"
                  size={28}
                  color="#7C3AED"
                />
              </View>

              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>
                  Choose from Gallery
                </Text>

                <Text style={styles.optionDesc}>
                  Upload existing image
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>
              Tips for best results
            </Text>

            <TipItem text="Place prescription on a flat surface" />

            <TipItem text="Ensure good lighting, avoid shadows" />

            <TipItem text="Include the full prescription in frame" />

            <TipItem text="Hold steady to avoid blurry images" />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// -----------------------------------------------------------
// TIP ITEM
// -----------------------------------------------------------

function TipItem({ text }: { text: string }) {
  return (
    <View style={styles.tipRow}>
      <Ionicons
        name="checkmark-circle"
        size={16}
        color={Colors.success}
      />

      <Text style={styles.tipText}>
        {text}
      </Text>
    </View>
  );
}

// -----------------------------------------------------------
// STYLES
// -----------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },

  placeholder: {
    width: 40,
  },

  // ---------------------------------------------------------
  // SELECTION MODE
  // ---------------------------------------------------------

  selectionContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
  },

  illustrationArea: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },

  illustrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },

  illustrationTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  illustrationSubtitle: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  optionsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },

  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },

  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },

  optionText: {
    flex: 1,
  },

  optionTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },

  optionDesc: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },

  tipsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },

  tipsTitle: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  tipText: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },

  // ---------------------------------------------------------
  // PREVIEW MODE
  // ---------------------------------------------------------

  previewContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
  },

  imagePreviewWrapper: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.lg,
  },

  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.lg,
    resizeMode: 'contain',
    backgroundColor: Colors.surfaceSecondary,
  },

  retakeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },

  retakeText: {
    fontSize: Typography.caption,
    color: Colors.textInverse,
    fontWeight: Typography.medium,
  },

  previewInfo: {
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },

  infoText: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semibold,
    color: '#065F46',
  },

  infoSubtext: {
    fontSize: Typography.caption,
    color: '#065F46',
    marginLeft: 28,
    lineHeight:
      Typography.caption * Typography.lineHeightNormal,
  },

  previewActions: {
    paddingBottom: Spacing.xxxl,
  },
});