import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from '@/constants/theme';
import Button from '@/components/Button';
import ScanCard from '@/components/ScanCard';
import EmptyState from '@/components/EmptyState';
import { getScanHistory } from '@/utils/storage';
import { ScanHistoryItem } from '@/types/prescription';

export default function HomeScreen() {
  const router = useRouter();
  const [recentScans, setRecentScans] = useState<ScanHistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const history = await getScanHistory();
      setRecentScans(history.slice(0, 3));
    } catch (error) {
      console.error('Failed to load recent scans:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome to</Text>
            <View style={styles.logoRow}>
              <Image
  source={require('../../assets/icon.png')}
  style={styles.appLogo}
  resizeMode="contain"
/>
              <Text style={styles.appName}>GetMedGo</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.aboutBtn}
            onPress={() => router.push('/about')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="About GetMedGo"
          >
            <Ionicons
              name="information-circle-outline"
              size={30}
              color={Colors.primary}
            />
            <Text style={styles.aboutBtnText}>About</Text>
          </TouchableOpacity>
        </View>

        {/* Hero CTA */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/scan')}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroIconWrap}>
                <Ionicons
                  name="camera"
                  size={28}
                  color={Colors.textInverse}
                />
              </View>

              <Text style={styles.heroTitle}>Scan Prescription</Text>
              <Text style={styles.heroSubtitle}>
                Take a photo or upload from gallery to instantly understand
                your medicines
              </Text>

              <View style={styles.heroButton}>
                <Text style={styles.heroButtonText}>Scan Now</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={Colors.primary}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        

        {/* Quick Actions */}
        <View style={styles.quickGrid}>
          <QuickCard
            icon="search"
            label="Search Medicine"
            desc="Find any medicine"
            color="#3B82F6"
            bg="#DBEAFE"
            onPress={() => router.push('/(tabs)/search')}
          />
          <QuickCard
            icon="chatbubbles"
            label="AI Assistant"
            desc="Ask about meds"
            color="#7C3AED"
            bg="#EDE9FE"
            onPress={() => router.push('/(tabs)/chat')}
          />
          <QuickCard
            icon="time"
            label="Scan History"
            desc="Past prescriptions"
            color="#F59E0B"
            bg="#FEF3C7"
            onPress={() => router.push('/(tabs)/history')}
          />
          <QuickCard
            icon="shield-checkmark"
            label="Drug Check"
            desc="Check interactions"
            color="#EF4444"
            bg="#FEE2E2"
            onPress={() => router.push('/(tabs)/search')}
          />
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>

          <View style={styles.stepsContainer}>
            <StepItem
              icon="camera-outline"
              title="Capture"
              desc="Photo or upload"
            />
            <View style={styles.stepLine} />
            <StepItem
              icon="sparkles-outline"
              title="AI Analyze"
              desc="Reads prescription"
            />
            <View style={styles.stepLine} />
            <StepItem
              icon="checkmark-circle-outline"
              title="Understand"
              desc="Plain results"
            />
          </View>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>

          <View style={styles.featuresRow}>
            <FeaturePill icon="language-outline" text="Hindi + English" />
            <FeaturePill
              icon="git-compare-outline"
              text="Generic Alternatives"
            />
            <FeaturePill
              icon="warning-outline"
              text="Drug Interactions"
            />
            <FeaturePill
              icon="alert-circle-outline"
              text="Allergy Alerts"
            />
            <FeaturePill icon="chatbubble-outline" text="AI Chatbot" />
            <FeaturePill icon="share-outline" text="Share Results" />
          </View>
        </View>

        {/* Recent Scans */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>

            {recentScans.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/history')}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentScans.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="No scans yet"
              message="Scan your first prescription to see it here"
              action={
                <Button
                  title="Scan Now"
                  onPress={() => router.push('/scan')}
                  size="sm"
                  icon={
                    <Ionicons
                      name="camera-outline"
                      size={16}
                      color={Colors.textInverse}
                    />
                  }
                />
              }
            />
          ) : (
            <View style={styles.scansList}>
              {recentScans.map((item) => (
                <ScanCard
                  key={item.id}
                  item={item}
                  onPress={() =>
                    router.push({
                      pathname: '/detail',
                      params: { id: item.id },
                    })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickCard({
  icon,
  label,
  desc,
  color,
  bg,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  desc: string;
  color: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.quickCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickCardIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickCardLabel}>{label}</Text>
      <Text style={styles.quickCardDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

function StepItem({
  icon,
  title,
  desc,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepIconWrap}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDesc}>{desc}</Text>
    </View>
  );
}

function FeaturePill({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.featurePill}>
      <Ionicons name={icon} size={14} color={Colors.primary} />
      <Text style={styles.featurePillText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  appLogo: {
  width: 42,
  height: 42,
  borderRadius: 10,
},
  scrollContent: {
    paddingBottom: Spacing.massive,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  greeting: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  appName: {
    fontSize: Typography.h2,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  aboutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primarySurface,
  },
  aboutBtnText: {
    fontSize: Typography.caption,
    fontWeight: Typography.semibold,
    color: Colors.primary,
  },
  
  heroCard: {
    marginHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  heroContent: {
    padding: Spacing.xxl,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.textInverse,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: Typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.textInverse,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  heroButtonText: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semibold,
    color: Colors.primary,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    marginTop: Spacing.xxl,
    rowGap: Spacing.md,
  },
  quickCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  quickCardIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  quickCardLabel: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  quickCardDesc: {
    fontSize: Typography.tiny,
    color: Colors.textTertiary,
  },
  section: {
    marginTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  seeAll: {
    fontSize: Typography.bodySmall,
    color: Colors.primary,
    fontWeight: Typography.medium,
    marginBottom: Spacing.lg,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  stepTitle: {
    fontSize: Typography.caption,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: Typography.tiny,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  stepLine: {
    width: 20,
    height: 2,
    backgroundColor: Colors.primaryLight,
    borderRadius: 1,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  featurePillText: {
    fontSize: Typography.tiny,
    color: Colors.primaryDark,
    fontWeight: Typography.medium,
  },
  scansList: {
    gap: Spacing.md,
  },
});