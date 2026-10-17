import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import Card from '@/components/Card';
import { getScanHistory, clearAllHistory, getSettings, saveSettings } from '@/utils/storage';
import { AppSettings } from '@/types/prescription';

export default function ProfileScreen() {
  const router = useRouter();
  const [totalScans, setTotalScans] = useState(0);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [settings, setSettingsState] = useState<AppSettings>({ language: 'en', largeText: false, simpleMode: false, ttsEnabled: false });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const [history, s] = await Promise.all([getScanHistory(), getSettings()]);
    setTotalScans(history.length);
    setTotalMedicines(history.reduce((acc, item) => acc + item.medicineCount, 0));
    setSettingsState(s);
  };

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettingsState(updated);
    await saveSettings({ [key]: value });
  };

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will permanently delete all scan history, chat, and saved data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: async () => { await clearAllHistory(); setTotalScans(0); setTotalMedicines(0); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* App Card */}
        <Card variant="elevated" padding="lg" style={styles.appCard}>
          <View style={styles.appInfo}>
            <View style={styles.appIconWrap}>
              <Ionicons name="medical" size={28} color={Colors.textInverse} />
            </View>
            <View style={styles.appDetails}>
              <Text style={styles.appName}>GetMedGo</Text>
              <Text style={styles.appVersion}>Version 2.0.0</Text>
            </View>
          </View>
          <Text style={styles.appDesc}>
            AI-powered prescription reader with medicine search, drug interaction checker, and smart health assistant.
          </Text>
        </Card>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard value={totalScans} label="Scans" icon="scan-outline" />
          <StatCard value={totalMedicines} label="Medicines" icon="medical-outline" />
          <StatCard value={totalScans > 0 ? Math.round(totalMedicines / totalScans) : 0} label="Avg/Scan" icon="analytics-outline" />
        </View>

        {/* Quick Actions */}
        <MenuSection title="Quick Actions">
          <MenuItem icon="scan-outline" label="Scan Prescription" onPress={() => router.push('/scan')} />
          <MenuDivider />
          <MenuItem icon="search-outline" label="Search Medicine" onPress={() => router.push('/(tabs)/search')} />
          <MenuDivider />
          <MenuItem icon="chatbubbles-outline" label="AI Assistant" onPress={() => router.push('/(tabs)/chat')} />
          <MenuDivider />
          <MenuItem icon="time-outline" label="Scan History" onPress={() => router.push('/(tabs)/history')} detail={`${totalScans}`} />
        </MenuSection>

        {/* Accessibility Settings */}
        <MenuSection title="Accessibility">
          <SettingToggle
            icon="language-outline"
            label="Hindi Language"
            desc="Show summaries in Hindi"
            value={settings.language === 'hi'}
            onToggle={(val) => updateSetting('language', val ? 'hi' : 'en')}
          />
          <MenuDivider />
          <SettingToggle
            icon="text-outline"
            label="Large Text"
            desc="Larger fonts for readability"
            value={settings.largeText}
            onToggle={(val) => updateSetting('largeText', val)}
          />
          <MenuDivider />
          <SettingToggle
            icon="accessibility-outline"
            label="Simple Mode"
            desc="Simplified interface for elderly users"
            value={settings.simpleMode}
            onToggle={(val) => updateSetting('simpleMode', val)}
          />
        </MenuSection>

        {/* About */}
        <MenuSection title="About">
          <MenuItem icon="information-circle-outline" label="How It Works"
            onPress={() => Alert.alert('How GetMedGo Works',
              '1. Take a photo of your prescription\n2. AI analyzes handwriting & text\n3. Get clear breakdown of each medicine\n4. View side effects, precautions, alternatives\n5. Ask AI chatbot any medicine questions\n6. Search any medicine for detailed info',
              [{ text: 'Got it' }])} />
          <MenuDivider />
          <MenuItem icon="shield-checkmark-outline" label="Privacy & Disclaimer"
            onPress={() => Alert.alert('Privacy & Disclaimer',
              'GetMedGo processes prescription images using AI for informational purposes only.\n\n- Images are NOT stored on any server\n- All data stored locally on your device\n- NOT a substitute for medical advice\n\nAlways consult your doctor or pharmacist.',
              [{ text: 'Understood' }])} />
          <MenuDivider />
          <MenuItem icon="code-slash-outline" label="Built By" detail="Shubham Shukla" onPress={() => {}} />
          <MenuDivider />
          <MenuItem icon="star-outline" label="App Version" detail="2.0.0" onPress={() => {}} />
        </MenuSection>

        {/* Data */}
        <MenuSection title="Data">
          <MenuItem icon="trash-outline" label="Clear All Data" onPress={handleClearData} destructive />
        </MenuSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with care for better health understanding</Text>
          <Text style={styles.footerVersion}>GetMedGo v2.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ value, label, icon }: { value: number; label: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={18} color={Colors.primary} style={{ marginBottom: Spacing.xs }} />
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.menuSection}>
      <Text style={styles.menuSectionTitle}>{title}</Text>
      <Card variant="default" padding="none">{children}</Card>
    </View>
  );
}

function MenuDivider() {
  return <View style={styles.menuDivider} />;
}

function MenuItem({ icon, label, detail, onPress, destructive = false }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; detail?: string; onPress: () => void; destructive?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={20} color={destructive ? Colors.error : Colors.textSecondary} />
        <Text style={[styles.menuItemLabel, destructive && { color: Colors.error }]}>{label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {detail && <Text style={styles.menuItemDetail}>{detail}</Text>}
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

function SettingToggle({ icon, label, desc, value, onToggle }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; desc: string; value: boolean; onToggle: (val: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={20} color={Colors.textSecondary} />
        <View>
          <Text style={styles.menuItemLabel}>{label}</Text>
          <Text style={styles.settingDesc}>{desc}</Text>
        </View>
      </View>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: Colors.surfaceTertiary, true: Colors.primaryLight }}
        thumbColor={value ? Colors.primary : Colors.textTertiary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: Spacing.massive },
  header: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  headerTitle: { fontSize: Typography.h2, fontWeight: Typography.bold, color: Colors.textPrimary },

  appCard: { marginHorizontal: Spacing.xxl, marginBottom: Spacing.xxl },
  appInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  appIconWrap: {
    width: 48, height: 48, borderRadius: BorderRadius.md, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  appDetails: {},
  appName: { fontSize: Typography.h4, fontWeight: Typography.bold, color: Colors.textPrimary },
  appVersion: { fontSize: Typography.caption, color: Colors.textTertiary, marginTop: 2 },
  appDesc: { fontSize: Typography.bodySmall, color: Colors.textSecondary, lineHeight: 22 },

  statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.xxl, gap: Spacing.md, marginBottom: Spacing.xxl },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, alignItems: 'center', ...Shadows.sm,
  },
  statNumber: { fontSize: Typography.h2, fontWeight: Typography.bold, color: Colors.primary, marginBottom: Spacing.xs },
  statLabel: { fontSize: Typography.caption, color: Colors.textSecondary, fontWeight: Typography.medium },

  menuSection: { paddingHorizontal: Spacing.xxl, marginBottom: Spacing.xxl },
  menuSectionTitle: {
    fontSize: Typography.caption, fontWeight: Typography.semibold, color: Colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm, marginLeft: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  menuItemRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  menuItemLabel: { fontSize: Typography.body, color: Colors.textPrimary },
  menuItemDetail: { fontSize: Typography.caption, color: Colors.textTertiary },
  menuDivider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.lg },

  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  settingDesc: { fontSize: Typography.tiny, color: Colors.textTertiary, marginTop: 1 },

  footer: { alignItems: 'center', paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.xxl },
  footerText: { fontSize: Typography.caption, color: Colors.textTertiary, textAlign: 'center', marginBottom: Spacing.xs },
  footerVersion: { fontSize: Typography.tiny, color: Colors.textTertiary },
});
