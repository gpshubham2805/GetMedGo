import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { searchMedicine } from '@/utils/ai';
import { MedicineSearchResult } from '@/types/prescription';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<MedicineSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchMedicine(q);
      setResult(data);
    } catch {
      setResult(null);
    }
    setLoading(false);
  };

  const popularMedicines = [
    'Paracetamol', 'Amoxicillin', 'Cetirizine', 'Azithromycin',
    'Ibuprofen', 'Omeprazole', 'Metformin', 'Pantoprazole',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medicine Search</Text>
        <Text style={styles.headerSubtitle}>
          Look up any medicine for details, uses, and side effects
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search medicine name..."
          placeholderTextColor={Colors.textTertiary}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResult(null); setSearched(false); }}>
            <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <Ionicons name="arrow-forward" size={18} color={Colors.textInverse} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {!searched && !result && (
          <>
            {/* Popular searches */}
            <Text style={styles.sectionTitle}>Popular Medicines</Text>
            <View style={styles.chipGrid}>
              {popularMedicines.map((med, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.chip}
                  onPress={() => { setQuery(med); }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="medical-outline" size={14} color={Colors.primary} />
                  <Text style={styles.chipText}>{med}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Features info */}
            <View style={styles.featuresList}>
              <FeatureRow icon="flask-outline" title="Uses & Purpose" desc="What the medicine is used for" />
              <FeatureRow icon="warning-outline" title="Side Effects" desc="Common and rare side effects" />
              <FeatureRow icon="shield-outline" title="Precautions" desc="Safety warnings and tips" />
              <FeatureRow icon="git-compare-outline" title="Alternatives" desc="Generic and brand alternatives" />
              <FeatureRow icon="link-outline" title="Interactions" desc="Drug interaction warnings" />
            </View>
          </>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Searching medicine database...</Text>
          </View>
        )}

        {!loading && searched && result && (
          <View style={styles.resultContainer}>
            {/* Medicine Header */}
            <Card variant="elevated" padding="lg" style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={styles.resultIconWrap}>
                  <Ionicons name="medical" size={24} color={Colors.primary} />
                </View>
                <View style={styles.resultHeaderText}>
                  <Text style={styles.resultName}>{result.name}</Text>
                  <Text style={styles.resultGeneric}>{result.genericName}</Text>
                </View>
              </View>
              <Badge text={result.category} variant="info" style={styles.categoryBadge} />
            </Card>

            {/* Dosage */}
            <InfoSection icon="medical-outline" title="Dosage" color={Colors.primary}>
              <Text style={styles.infoText}>{result.dosageInfo}</Text>
            </InfoSection>

            {/* Uses */}
            <InfoSection icon="checkmark-circle-outline" title="Uses" color={Colors.success}>
              {result.uses.map((u, i) => (
                <View key={i} style={styles.listItem}>
                  <View style={[styles.dot, { backgroundColor: Colors.success }]} />
                  <Text style={styles.listText}>{u}</Text>
                </View>
              ))}
            </InfoSection>

            {/* Side Effects */}
            <InfoSection icon="warning-outline" title="Side Effects" color={Colors.warning}>
              {result.sideEffects.map((s, i) => (
                <View key={i} style={styles.listItem}>
                  <View style={[styles.dot, { backgroundColor: Colors.warning }]} />
                  <Text style={styles.listText}>{s}</Text>
                </View>
              ))}
            </InfoSection>

            {/* Precautions */}
            <InfoSection icon="shield-checkmark-outline" title="Precautions" color={Colors.error}>
              {result.precautions.map((p, i) => (
                <View key={i} style={styles.listItem}>
                  <View style={[styles.dot, { backgroundColor: Colors.error }]} />
                  <Text style={styles.listText}>{p}</Text>
                </View>
              ))}
            </InfoSection>

            {/* Interactions */}
            <InfoSection icon="link-outline" title="Drug Interactions" color="#7C3AED">
              {result.interactions.map((int, i) => (
                <View key={i} style={styles.listItem}>
                  <View style={[styles.dot, { backgroundColor: '#7C3AED' }]} />
                  <Text style={styles.listText}>{int}</Text>
                </View>
              ))}
            </InfoSection>

            {/* Alternatives */}
            <InfoSection icon="swap-horizontal-outline" title="Alternatives" color={Colors.info}>
              {result.alternatives.map((a, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.altChip}
                  onPress={() => { setQuery(a); handleSearch(); }}
                >
                  <Ionicons name="arrow-forward-circle-outline" size={16} color={Colors.info} />
                  <Text style={styles.altText}>{a}</Text>
                </TouchableOpacity>
              ))}
            </InfoSection>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.disclaimerText}>
                This information is AI-generated for reference only. Always consult your doctor or pharmacist.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoSection({ icon, title, color, children }: {
  icon: keyof typeof Ionicons.glyphMap; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <Card variant="outlined" padding="md" style={styles.infoSection}>
      <View style={styles.infoHeader}>
        <View style={[styles.infoIconWrap, { backgroundColor: color + '18' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      <View style={styles.infoContent}>{children}</View>
    </Card>
  );
}

function FeatureRow({ icon, title, desc }: {
  icon: keyof typeof Ionicons.glyphMap; title: string; desc: string;
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIconWrap}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  headerTitle: { fontSize: Typography.h2, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.xs },
  headerSubtitle: { fontSize: Typography.bodySmall, color: Colors.textSecondary },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    marginHorizontal: Spacing.xxl, borderRadius: BorderRadius.lg, paddingLeft: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm, ...Shadows.sm,
  },
  searchInput: { flex: 1, fontSize: Typography.body, color: Colors.textPrimary, paddingVertical: Spacing.md },
  searchBtn: {
    width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', margin: 4,
  },
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.massive, paddingTop: Spacing.xl },

  sectionTitle: { fontSize: Typography.h4, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: Spacing.lg },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xxxl },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.primarySurface, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  chipText: { fontSize: Typography.caption, color: Colors.primaryDark, fontWeight: Typography.medium },

  featuresList: { gap: Spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  featureIconWrap: {
    width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: Colors.primarySurface,
    alignItems: 'center', justifyContent: 'center',
  },
  featureTitle: { fontSize: Typography.bodySmall, fontWeight: Typography.semibold, color: Colors.textPrimary },
  featureDesc: { fontSize: Typography.caption, color: Colors.textSecondary },

  loadingContainer: { alignItems: 'center', paddingVertical: Spacing.massive },
  loadingText: { marginTop: Spacing.lg, fontSize: Typography.bodySmall, color: Colors.textSecondary },

  resultContainer: { gap: Spacing.lg },
  resultCard: { marginBottom: 0 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  resultIconWrap: {
    width: 48, height: 48, borderRadius: BorderRadius.md, backgroundColor: Colors.primarySurface,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  resultHeaderText: { flex: 1 },
  resultName: { fontSize: Typography.h3, fontWeight: Typography.bold, color: Colors.textPrimary },
  resultGeneric: { fontSize: Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  categoryBadge: { alignSelf: 'flex-start' },

  infoSection: { marginBottom: 0 },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  infoIconWrap: { width: 32, height: 32, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  infoTitle: { fontSize: Typography.body, fontWeight: Typography.semibold, color: Colors.textPrimary },
  infoContent: { gap: Spacing.sm },
  infoText: { fontSize: Typography.bodySmall, color: Colors.textPrimary, lineHeight: 22 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  listText: { flex: 1, fontSize: Typography.bodySmall, color: Colors.textPrimary, lineHeight: 22 },

  altChip: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.infoLight, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, alignSelf: 'flex-start',
  },
  altText: { fontSize: Typography.caption, color: '#1E40AF', fontWeight: Typography.medium },

  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingTop: Spacing.md },
  disclaimerText: { flex: 1, fontSize: Typography.caption, color: Colors.textTertiary, lineHeight: 18 },
});
