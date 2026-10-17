import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from '@/constants/theme';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>About GetMedGo</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandCard}>
          <Image
  source={require('../assets/images/getmedgo-logo.png')}
  style={styles.aboutLogo}
  resizeMode="contain"
/>

          <Text style={styles.brandName}>GetMedGo</Text>
          <Text style={styles.tagline}>
            Understand your prescription. Make informed decisions.
          </Text>
          <Text style={styles.version}>Prescription Information App</Text>
        </View>

        <InfoSection
          icon="information-circle-outline"
          title="About the App"
        >
          GetMedGo helps users understand prescription information in
          simpler language. Scan prescriptions, review medicine details,
          search for medicines, and ask the AI assistant general
          medicine-related questions.
        </InfoSection>

        <View style={styles.infoCard}>
          <View style={styles.sectionHeading}>
            <Ionicons
              name="apps-outline"
              size={22}
              color={Colors.primary}
            />
            <Text style={styles.sectionTitle}>Key Features</Text>
          </View>

          <FeatureRow
            icon="camera-outline"
            title="Prescription Scanner"
            description="Take a photo or select a prescription image."
          />
          <FeatureRow
            icon="search-outline"
            title="Medicine Search"
            description="Explore available medicine information."
          />
          <FeatureRow
            icon="chatbubbles-outline"
            title="AI Assistant"
            description="Ask general questions about medicines."
          />
          <FeatureRow
            icon="time-outline"
            title="Scan History"
            description="Review previously saved prescription scans."
          />
          <FeatureRow
            icon="shield-checkmark-outline"
            title="Medicine Safety"
            description="Review available interaction warnings and safety information."
          />
          <FeatureRow
            icon="document-text-outline"
            title="Prescription Reports"
            description="View and share supported prescription reports."
          />
        </View>

        <InfoSection
          icon="list-outline"
          title="How to Use GetMedGo"
        >
          1. Open Scan Prescription.
          {'\n\n'}
          2. Take a clear photo or select an image from your gallery.
          {'\n\n'}
          3. Review the extracted medicine names and instructions.
          {'\n\n'}
          4. Ask questions or revisit saved scans in History.
        </InfoSection>

        <InfoSection
          icon="lock-closed-outline"
          title="Privacy and Data"
        >
          Prescription images and saved scans may contain sensitive
          medical information. Only upload information you are comfortable
          processing through the app. Review the app's actual data
          handling practices before sharing sensitive information.
        </InfoSection>

        <View style={styles.disclaimerCard}>
          <View style={styles.sectionHeading}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color={Colors.error}
            />
            <Text style={styles.disclaimerTitle}>
              Important Medical Disclaimer
            </Text>
          </View>

          <Text style={styles.bodyText}>
            GetMedGo provides informational assistance and does not replace
            a qualified doctor or pharmacist. AI and text recognition can
            make mistakes. Always verify medicine names, strengths,
            dosages, and instructions against the original prescription
            and with a healthcare professional. Never start, stop, or
            change medication based only on information from this app.
            Seek immediate medical care in an emergency.
          </Text>
        </View>

        <InfoSection
          icon="mail-outline"
          title="Contact and Support"
        >
          Official support contact details have not yet been configured.
          Add your verified support email address or website here before
          publishing the app.
        </InfoSection>

        <Text style={styles.footer}>GetMedGo · About</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoSection({
  icon,
  title,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.sectionHeading}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <Text style={styles.bodyText}>{children}</Text>
    </View>
  );
}

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>

      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 42,
  },
  content: {
    padding: Spacing.xxl,
    paddingBottom: Spacing.massive,
    gap: Spacing.lg,
  },
  brandCard: {
    alignItems: 'center',
    padding: Spacing.xxl,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
 aboutLogo: {
  width: 90,
  height: 90,
  borderRadius: 20,
  marginBottom: Spacing.md,
},
  brandName: {
    fontSize: Typography.h2,
    fontWeight: Typography.bold,
    color: Colors.textInverse,
  },
  tagline: {
    marginTop: Spacing.sm,
    fontSize: Typography.bodySmall,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  version: {
    marginTop: Spacing.lg,
    fontSize: Typography.tiny,
    color: 'rgba(255,255,255,0.85)',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    flex: 1,
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  bodyText: {
    fontSize: Typography.bodySmall,
    lineHeight: 23,
    color: Colors.textSecondary,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontSize: Typography.caption,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  disclaimerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disclaimerTitle: {
    flex: 1,
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.error,
  },
  footer: {
    fontSize: Typography.tiny,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});