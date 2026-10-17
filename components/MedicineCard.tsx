import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Colors,
  Typography,
  BorderRadius,
  Spacing,
} from '@/constants/theme';
import Card from './Card';
import Badge from './Badge';
import { Medicine } from '@/types/prescription';

interface MedicineCardProps {
  medicine: Medicine;
  index: number;
}

export default function MedicineCard({
  medicine,
  index,
}: MedicineCardProps) {
  const [expanded, setExpanded] = useState(false);

  const categoryLower = medicine.category?.toLowerCase();

  const categoryVariant =
    categoryLower === 'antibiotic'
      ? 'warning'
      : categoryLower === 'painkiller'
      ? 'info'
      : 'neutral';

  const hasAllergyWarnings =
    !!medicine.allergyWarnings &&
    medicine.allergyWarnings.length > 0;

  const hasPrecautions =
    !!medicine.precautions &&
    medicine.precautions.length > 0;

  const hasSideEffects =
    !!medicine.sideEffects &&
    medicine.sideEffects.length > 0;

  const hasInteractions =
    !!medicine.interactions &&
    medicine.interactions.length > 0;

  const hasAlternatives =
    !!medicine.replacements &&
    medicine.replacements.length > 0;

  return (
    <Card variant="outlined" padding="md">
      {/* Medicine Header */}
      <View style={styles.header}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>
            {index + 1}
          </Text>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.name}>
            {medicine.name}
          </Text>

          <View style={styles.nameMeta}>
            {medicine.genericName &&
              medicine.genericName !== medicine.name && (
                <Text style={styles.genericLabel}>
                  Generic: {medicine.genericName}
                </Text>
              )}

            {medicine.brandName && (
              <Text style={styles.brandLabel}>
                Brand: {medicine.brandName}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Category */}
      {medicine.category && (
        <View style={styles.categoryRow}>
          <Badge
            text={medicine.category}
            variant={categoryVariant}
          />

          {medicine.isGeneric !== undefined && (
            <Badge
              text={
                medicine.isGeneric
                  ? 'Generic'
                  : 'Branded'
              }
              variant={
                medicine.isGeneric
                  ? 'success'
                  : 'neutral'
              }
            />
          )}
        </View>
      )}

      {/* Purpose */}
      {medicine.purpose && (
        <View style={styles.purposeRow}>
          <Ionicons
            name="information-circle"
            size={17}
            color={Colors.info}
          />

          <View style={styles.purposeContent}>
            <Text style={styles.purposeLabel}>
              Purpose
            </Text>

            <Text style={styles.purposeText}>
              {medicine.purpose}
            </Text>
          </View>
        </View>
      )}

      {/* Main Medicine Schedule */}
      <View style={styles.scheduleCard}>
        <View style={styles.scheduleHeader}>
          <View style={styles.scheduleHeaderLeft}>
            <Ionicons
              name="medical-outline"
              size={17}
              color={Colors.primary}
            />

            <Text style={styles.scheduleTitle}>
              How to Take
            </Text>
          </View>

          <Text style={styles.scheduleHint}>
            Follow prescription
          </Text>
        </View>

        <View style={styles.scheduleGrid}>
          <ScheduleItem
            icon="medkit-outline"
            label="Dose"
            value={
              medicine.dosage || 'Not specified'
            }
          />

          <ScheduleItem
            icon="repeat-outline"
            label="Frequency"
            value={
              medicine.frequency || 'Not specified'
            }
          />

          <ScheduleItem
            icon="restaurant-outline"
            label="Timing"
            value={
              medicine.timing || 'Not specified'
            }
          />

          <ScheduleItem
            icon="calendar-outline"
            label="Duration"
            value={
              medicine.duration || 'Not specified'
            }
          />
        </View>
      </View>

      {/* ------------------------------------------------------------ */}
      {/* SAFETY PRIORITY 1 — ALLERGY WARNINGS                         */}
      {/* ------------------------------------------------------------ */}

      {hasAllergyWarnings && (
        <View style={styles.allergyBanner}>
          <View style={styles.allergyIcon}>
            <Ionicons
              name="warning"
              size={18}
              color="#B91C1C"
            />
          </View>

          <View style={styles.alertContent}>
            <View style={styles.alertTitleRow}>
              <Text style={styles.allergyTitle}>
                Allergy Warning
              </Text>

              <View style={styles.urgentBadge}>
                <Text style={styles.urgentBadgeText}>
                  IMPORTANT
                </Text>
              </View>
            </View>

            {medicine.allergyWarnings!.map(
              (warning, i) => (
                <View
                  key={i}
                  style={styles.allergyItem}
                >
                  <View style={styles.allergyDot} />

                  <Text style={styles.allergyText}>
                    {warning}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>
      )}

      {/* ------------------------------------------------------------ */}
      {/* SAFETY PRIORITY 2 — PRECAUTIONS                              */}
      {/* ------------------------------------------------------------ */}

      {hasPrecautions && (
        <SafetySection
          icon="shield-checkmark-outline"
          title="Precautions"
          subtitle="Important before taking this medicine"
          color="#B45309"
          backgroundColor="#FFFBEB"
          borderColor="#FDE68A"
          items={medicine.precautions!}
        />
      )}

      {/* ------------------------------------------------------------ */}
      {/* SAFETY PRIORITY 3 — SIDE EFFECTS                             */}
      {/* ------------------------------------------------------------ */}

      {hasSideEffects && (
        <SafetySection
          icon="information-circle-outline"
          title="Possible Side Effects"
          subtitle="Common effects that may occur"
          color="#92400E"
          backgroundColor={Colors.warningLight}
          borderColor="#FCD34D"
          items={medicine.sideEffects!}
        />
      )}

      {/* ------------------------------------------------------------ */}
      {/* Additional Safety Summary                                   */}
      {/* ------------------------------------------------------------ */}

      {(hasInteractions || hasAlternatives) && (
        <View style={styles.additionalSafety}>
          {hasInteractions && (
            <View style={styles.additionalSafetyItem}>
              <View
                style={[
                  styles.additionalSafetyIcon,
                  styles.interactionIcon,
                ]}
              >
                <Ionicons
                  name="git-compare-outline"
                  size={16}
                  color="#6D28D9"
                />
              </View>

              <View style={styles.additionalSafetyText}>
                <Text
                  style={styles.additionalSafetyTitle}
                >
                  Drug Interactions
                </Text>

                <Text
                  style={styles.additionalSafetyHint}
                >
                  {medicine.interactions!.length}{' '}
                  interaction
                  {medicine.interactions!.length === 1
                    ? ''
                    : 's'} detected
                </Text>
              </View>
            </View>
          )}

          {hasAlternatives && (
            <View style={styles.additionalSafetyItem}>
              <View
                style={[
                  styles.additionalSafetyIcon,
                  styles.alternativeIcon,
                ]}
              >
                <Ionicons
                  name="swap-horizontal-outline"
                  size={16}
                  color={Colors.success}
                />
              </View>

              <View style={styles.additionalSafetyText}>
                <Text
                  style={styles.additionalSafetyTitle}
                >
                  Alternatives Available
                </Text>

                <Text
                  style={styles.additionalSafetyHint}
                >
                  {medicine.replacements!.length}{' '}
                  alternative
                  {medicine.replacements!.length === 1
                    ? ''
                    : 's'} listed
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Expandable Additional Details */}
      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.expandButtonLeft}>
          <Ionicons
            name="list-outline"
            size={16}
            color={Colors.primary}
          />

          <Text style={styles.expandButtonText}>
            {expanded
              ? 'Hide additional details'
              : 'View all medicine details'}
          </Text>
        </View>

        <Ionicons
          name={
            expanded
              ? 'chevron-up'
              : 'chevron-down'
          }
          size={16}
          color={Colors.primary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedSection}>
          {/* Medicine Information */}
          {(medicine.genericName ||
            medicine.brandName ||
            medicine.category) && (
            <View style={styles.detailSection}>
              <View
                style={styles.detailSectionHeader}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={16}
                  color={Colors.primary}
                />

                <Text
                  style={styles.detailSectionTitle}
                >
                  Medicine Information
                </Text>
              </View>

              {medicine.genericName && (
                <InfoRow
                  label="Generic Name"
                  value={medicine.genericName}
                />
              )}

              {medicine.brandName && (
                <InfoRow
                  label="Brand Name"
                  value={medicine.brandName}
                />
              )}

              {medicine.category && (
                <InfoRow
                  label="Category"
                  value={medicine.category}
                />
              )}

              {medicine.isGeneric !== undefined && (
                <InfoRow
                  label="Type"
                  value={
                    medicine.isGeneric
                      ? 'Generic medicine'
                      : 'Branded medicine'
                  }
                />
              )}
            </View>
          )}

          {/* Full Precautions */}
          {hasPrecautions && (
            <DetailList
              icon="shield-checkmark-outline"
              title="Precautions"
              subtitle="Important safety information"
              items={medicine.precautions!}
              color="#B45309"
              backgroundColor="#FFFBEB"
            />
          )}

          {/* Full Side Effects */}
          {hasSideEffects && (
            <DetailList
              icon="information-circle-outline"
              title="Possible Side Effects"
              subtitle="Common effects that may occur"
              items={medicine.sideEffects!}
              color="#92400E"
              backgroundColor={Colors.warningLight}
            />
          )}

          {/* Full Allergy Warnings */}
          {hasAllergyWarnings && (
            <DetailList
              icon="alert-circle-outline"
              title="Allergy Warnings"
              subtitle="Review before taking this medicine"
              items={medicine.allergyWarnings!}
              color="#B91C1C"
              backgroundColor={Colors.errorLight}
            />
          )}

          {/* Interactions */}
          {hasInteractions && (
            <DetailList
              icon="git-compare-outline"
              title="Drug Interactions"
              subtitle="Potential medicine interactions"
              items={medicine.interactions!}
              color="#6D28D9"
              backgroundColor="#F5F3FF"
            />
          )}

          {/* Alternatives */}
          {hasAlternatives && (
            <DetailList
              icon="swap-horizontal-outline"
              title="Generic Alternatives"
              subtitle="Discuss alternatives with your doctor"
              items={medicine.replacements!}
              color={Colors.success}
              backgroundColor={Colors.successLight}
            />
          )}
        </View>
      )}
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Schedule Item                                                              */
/* -------------------------------------------------------------------------- */

function ScheduleItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.scheduleItem}>
      <View style={styles.scheduleIcon}>
        <Ionicons
          name={icon}
          size={17}
          color={Colors.primary}
        />
      </View>

      <View style={styles.scheduleText}>
        <Text style={styles.scheduleLabel}>
          {label}
        </Text>

        <Text
          style={styles.scheduleValue}
          numberOfLines={3}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Safety Section                                                             */
/* -------------------------------------------------------------------------- */

function SafetySection({
  icon,
  title,
  subtitle,
  color,
  backgroundColor,
  borderColor,
  items,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  items: string[];
}) {
  return (
    <View
      style={[
        styles.safetySection,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <View style={styles.safetySectionHeader}>
        <View
          style={[
            styles.safetySectionIcon,
            { borderColor },
          ]}
        >
          <Ionicons
            name={icon}
            size={17}
            color={color}
          />
        </View>

        <View style={styles.safetySectionTitleWrap}>
          <Text
            style={[
              styles.safetySectionTitle,
              { color },
            ]}
          >
            {title}
          </Text>

          <Text style={styles.safetySectionSubtitle}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.safetySectionList}>
        {items.map((item, index) => (
          <View
            key={index}
            style={styles.safetySectionItem}
          >
            <View
              style={[
                styles.safetyDot,
                { backgroundColor: color },
              ]}
            />

            <Text style={styles.safetyText}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Info Row                                                                   */
/* -------------------------------------------------------------------------- */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoRowLabel}>
        {label}
      </Text>

      <Text style={styles.infoRowValue}>
        {value}
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Detail List                                                                */
/* -------------------------------------------------------------------------- */

function DetailList({
  icon,
  title,
  subtitle,
  items,
  color,
  backgroundColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  items: string[];
  color: string;
  backgroundColor: string;
}) {
  return (
    <View
      style={[
        styles.detailSafetyBox,
        { backgroundColor },
      ]}
    >
      <View style={styles.detailSectionHeader}>
        <Ionicons
          name={icon}
          size={16}
          color={color}
        />

        <View style={styles.detailTitleWrap}>
          <Text style={styles.detailSectionTitle}>
            {title}
          </Text>

          <Text style={styles.detailSubtitle}>
            {subtitle}
          </Text>
        </View>
      </View>

      {items.map((item, index) => (
        <View
          key={index}
          style={styles.detailBulletRow}
        >
          <View
            style={[
              styles.detailBullet,
              { backgroundColor: color },
            ]}
          />

          <Text style={styles.detailBulletText}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },

  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  numberText: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.bold,
    color: Colors.textInverse,
  },

  headerText: {
    flex: 1,
    paddingRight: Spacing.sm,
  },

  name: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    lineHeight: 22,
  },

  nameMeta: {
    marginTop: 3,
    gap: 2,
  },

  genericLabel: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },

  brandLabel: {
    fontSize: Typography.caption,
    color: Colors.textTertiary,
  },

  /* Category */
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    marginLeft: 36 + Spacing.md,
  },

  /* Purpose */
  purposeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.infoLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },

  purposeContent: {
    flex: 1,
  },

  purposeLabel: {
    fontSize: Typography.tiny,
    fontWeight: Typography.semibold,
    color: '#1E40AF',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  purposeText: {
    fontSize: Typography.caption,
    color: '#1E40AF',
    lineHeight: 18,
  },

  /* Schedule */
  scheduleCard: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },

  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },

  scheduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  scheduleTitle: {
    fontSize: Typography.caption,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  scheduleHint: {
    fontSize: Typography.tiny,
    color: Colors.textTertiary,
  },

  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },

  scheduleItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },

  scheduleIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scheduleText: {
    flex: 1,
  },

  scheduleLabel: {
    fontSize: Typography.tiny,
    color: Colors.textSecondary,
    marginBottom: 2,
  },

  scheduleValue: {
    fontSize: Typography.caption,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    lineHeight: 17,
  },

  /* Allergy */
  allergyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.errorLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },

  allergyIcon: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  alertContent: {
    flex: 1,
  },

  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: 4,
  },

  allergyTitle: {
    fontSize: Typography.caption,
    fontWeight: Typography.bold,
    color: '#991B1B',
  },

  urgentBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },

  urgentBadgeText: {
    fontSize: 8,
    fontWeight: Typography.bold,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  allergyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: 3,
  },

  allergyDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#DC2626',
    marginTop: 7,
  },

  allergyText: {
    flex: 1,
    fontSize: Typography.caption,
    color: '#991B1B',
    lineHeight: 18,
  },

  /* Safety sections */
  safetySection: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },

  safetySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  safetySectionIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  safetySectionTitleWrap: {
    flex: 1,
  },

  safetySectionTitle: {
    fontSize: Typography.caption,
    fontWeight: Typography.bold,
  },

  safetySectionSubtitle: {
    fontSize: Typography.tiny,
    color: Colors.textSecondary,
    marginTop: 1,
  },

  safetySectionList: {
    marginTop: Spacing.sm,
    gap: 5,
  },

  safetySectionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },

  safetyDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 7,
  },

  safetyText: {
    flex: 1,
    fontSize: Typography.caption,
    color: Colors.textPrimary,
    lineHeight: 18,
  },

  /* Additional safety summary */
  additionalSafety: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },

  additionalSafetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  additionalSafetyIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  interactionIcon: {
    backgroundColor: '#EDE9FE',
  },

  alternativeIcon: {
    backgroundColor: Colors.successLight,
  },

  additionalSafetyText: {
    flex: 1,
  },

  additionalSafetyTitle: {
    fontSize: Typography.caption,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },

  additionalSafetyHint: {
    fontSize: Typography.tiny,
    color: Colors.textSecondary,
    marginTop: 1,
  },

  /* Expand */
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },

  expandButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  expandButtonText: {
    fontSize: Typography.caption,
    color: Colors.primary,
    fontWeight: Typography.semibold,
  },

  /* Expanded details */
  expandedSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.lg,
  },

  detailSection: {
    gap: Spacing.sm,
  },

  detailSectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },

  detailTitleWrap: {
    flex: 1,
  },

  detailSectionTitle: {
    fontSize: Typography.caption,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  detailSubtitle: {
    fontSize: Typography.tiny,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  detailSafetyBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
    gap: Spacing.md,
  },

  infoRowLabel: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },

  infoRowValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: Typography.caption,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },

  detailBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },

  detailBullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 6,
  },

  detailBulletText: {
    flex: 1,
    fontSize: Typography.caption,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
});