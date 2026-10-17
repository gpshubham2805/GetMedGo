import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { sharePrescriptionPdf } from '@/utils/pdfReport';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from '@/constants/theme';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import MedicineCard from '@/components/MedicineCard';
import {
  getScanResult,
  deleteScanResult,
} from '@/utils/storage';
import { PrescriptionResult } from '@/types/prescription';

const DEMO_PRESCRIPTION: PrescriptionResult = {
  id: 'demo-prescription',
  imageUri: '',
  doctorName: 'Dr. Amit Sharma',
  patientName: 'Rahul Kumar',
  date: '2026-09-07',
  diagnosis: 'Fever and throat infection',
  category: 'General Medicine',

  medicines: [
    {
      name: 'Azithromycin 500 mg',
      dosage: '500 mg',
      frequency: 'Once daily',
      duration: '3 days',
      timing: 'After food',
      purpose: 'Treats bacterial infections',
      genericName: 'Azithromycin',
      brandName: 'Azithral',
      isGeneric: false,
      category: 'Antibiotic',
      sideEffects: ['Nausea', 'Stomach upset'],
      precautions: [
        'Take after food',
        'Complete the full course',
      ],
      interactions: [],
      allergyWarnings: [],
      replacements: ['Azithromycin'],
    },
    {
      name: 'Paracetamol 500 mg',
      dosage: '500 mg',
      frequency: 'Every 6 hours as needed',
      duration: '3 days',
      timing: 'After food',
      purpose: 'Reduces fever and pain',
      genericName: 'Paracetamol',
      brandName: 'Crocin',
      isGeneric: false,
      category: 'Painkiller',
      sideEffects: ['Nausea'],
      precautions: [
        'Do not exceed the recommended daily dose',
      ],
      interactions: [],
      allergyWarnings: [],
      replacements: ['Paracetamol'],
    },
  ],

  instructions: [
    'Drink plenty of water.',
    'Take medicines exactly as prescribed.',
    'Get adequate rest.',
  ],

  warnings: [
    'Do not stop the antibiotic course early.',
    'Consult your doctor if symptoms worsen.',
  ],

  testsAndExaminations: [
    {
      name: 'Complete Blood Count (CBC)',
      details:
        'Blood test to check white blood cells, red blood cells, hemoglobin and other blood components.',
      timing: 'Within 2–3 days',
    },
    {
      name: 'Throat Swab',
      details:
        'A throat sample may be tested to identify the cause of the throat infection.',
      timing: 'If fever or throat symptoms persist',
    },
    {
      name: 'Chest X-Ray',
      details:
        'Imaging examination that may be recommended if cough, breathing difficulty or chest symptoms develop.',
      timing: 'As advised by doctor',
    },
  ],

  summary:
    'The prescription is for treatment of fever and throat infection. Two medicines have been prescribed for symptom control and infection treatment.',

  summaryHindi:
    'यह पर्चा बुखार और गले के संक्रमण के इलाज के लिए है। दो दवाएं संक्रमण और लक्षणों को नियंत्रित करने के लिए दी गई हैं।',

  analyzedAt: new Date().toISOString(),

  drugInteractions: [],

  duplicateMedicines: [],
};

export default function DetailScreen() {
  const router = useRouter();
  const { id } =
    useLocalSearchParams<{ id: string }>();

  const [result, setResult] =
    useState<PrescriptionResult | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [showImage, setShowImage] =
    useState(false);

  const [showHindi, setShowHindi] =
    useState(false);

  useEffect(() => {
    if (id === 'demo-prescription') {
      setResult(DEMO_PRESCRIPTION);
      setLoading(false);
    } else if (id) {
      loadResult();
    }
  }, [id]);

  const loadResult = async () => {
    try {
      const data = await getScanResult(id!);
      setResult(data);
    } catch (error) {
      console.error(
        'Failed to load scan:',
        error
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Share prescription as PDF
   */
  const handleShare = async () => {
    if (!result) return;

    try {
      await sharePrescriptionPdf(result);
    } catch (error) {
      console.error(
        'PDF sharing failed:',
        error
      );

      Alert.alert(
        'Unable to Share',
        'Could not create or share the prescription PDF. Please try again.'
      );
    }
  };

  /*
   * Export prescription as plain text
   */
  const handleExportText = async () => {
    if (!result) return;

    const testSection =
      result.testsAndExaminations &&
      result.testsAndExaminations.length > 0
        ? [
            '',
            'TESTS & EXAMINATIONS:',
            '---------------------',
            ...result.testsAndExaminations.map(
              (test, i) =>
                `${i + 1}. ${test.name}\n` +
                `   Details: ${test.details}\n` +
                `   Timing: ${test.timing}`
            ),
          ]
        : [];

    const text = [
      'PRESCRIPTION DETAILS',
      '====================',
      `Doctor: ${
        result.doctorName || 'N/A'
      }`,
      `Patient: ${
        result.patientName || 'N/A'
      }`,
      `Prescription Date: ${result.date}`,
      `Scanned On: ${new Date(
        result.analyzedAt
      ).toLocaleString('en-IN')}`,
      `Diagnosis: ${
        result.diagnosis || 'N/A'
      }`,
      `Category: ${
        result.category || 'general'
      }`,
      '',
      'MEDICINES:',
      '----------',

      ...result.medicines.map(
        (m, i) =>
          `${i + 1}. ${m.name}\n` +
          `   Generic: ${
            m.genericName || 'N/A'
          }\n` +
          `   Brand: ${
            m.brandName || 'N/A'
          }\n` +
          `   Dose: ${m.dosage}\n` +
          `   Frequency: ${m.frequency}\n` +
          `   Timing: ${m.timing}\n` +
          `   Duration: ${m.duration}\n` +
          `   Purpose: ${
            m.purpose || 'N/A'
          }\n` +
          `   Side Effects: ${
            (m.sideEffects || []).join(
              ', '
            ) || 'N/A'
          }\n` +
          `   Precautions: ${
            (m.precautions || []).join(
              ', '
            ) || 'N/A'
          }\n` +
          `   Allergy Warnings: ${
            (m.allergyWarnings || []).join(
              ', '
            ) || 'None reported'
          }\n` +
          `   Alternatives: ${
            (m.replacements || []).join(
              ', '
            ) || 'N/A'
          }`
      ),

      ...testSection,

      '',
      'INSTRUCTIONS:',
      '-------------',
      ...(result.instructions || []).map(
        (i) => `• ${i}`
      ),

      '',
      'WARNINGS:',
      '---------',
      ...(result.warnings || []).map(
        (w) => `• ${w}`
      ),

      '',
      'SUMMARY:',
      '--------',
      result.summary,

      '',
      'Generated by GetMedGo — For informational purposes only.',
    ].join('\n');

    try {
      await Share.share({
        message: text,
        title: 'Full Prescription — GetMedGo',
      });
    } catch (error) {
      console.error(
        'Text sharing failed:',
        error
      );

      Alert.alert(
        'Unable to Share',
        'Could not share the prescription text. Please try again.'
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Scan',
      'This will permanently remove this scan from your history.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await deleteScanResult(id);
              router.back();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />
      </View>
    );
  }

  if (!result) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.loadingContainer}
        >
          <Ionicons
            name="document-text-outline"
            size={48}
            color={Colors.textTertiary}
          />

          <Text style={styles.errorText}>
            Scan not found
          </Text>

          <TouchableOpacity
            onPress={() => router.back()}
          >
            <Text
              style={styles.goBackText}
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const scannedDate = new Date(
    result.analyzedAt
  ).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const scannedDateTime = new Date(
    result.analyzedAt
  ).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconBtn}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
        >
          Scan Details
        </Text>

        <View
          style={styles.headerActions}
        >
          <TouchableOpacity
            onPress={handleShare}
            style={styles.iconBtn}
          >
            <Ionicons
              name="share-outline"
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={styles.iconBtn}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={Colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* Meta badges */}
        <View
          style={styles.metaBadges}
        >
          <Badge
            text={`Scanned ${scannedDate}`}
            variant="neutral"
            icon="calendar-outline"
          />

          {result.category && (
            <Badge
              text={result.category}
              variant="info"
            />
          )}

          {result.diagnosis && (
            <Badge
              text={result.diagnosis}
              variant="success"
              icon="medical"
            />
          )}
        </View>

        {/* Export Actions */}
        <View
          style={styles.actionRow}
        >
          <ActionBtn
            icon="document-outline"
            label="Share PDF"
            onPress={handleShare}
            color={Colors.primary}
          />

          <ActionBtn
            icon="document-text-outline"
            label="Export Text"
            onPress={handleExportText}
            color="#7C3AED"
          />

          <ActionBtn
            icon="chatbubbles-outline"
            label="Ask AI"
            onPress={() =>
              router.push(
                '/(tabs)/chat'
              )
            }
            color={Colors.success}
          />
        </View>

        {/* Image Toggle */}
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() =>
            setShowImage(!showImage)
          }
          activeOpacity={0.7}
        >
          <View
            style={styles.toggleLeft}
          >
            <Ionicons
              name="image-outline"
              size={18}
              color={Colors.textSecondary}
            />

            <Text
              style={styles.toggleText}
            >
              {showImage ? 'Hide' : 'View'} Original Prescription
            </Text>
          </View>

          <Ionicons
            name={
              showImage
                ? 'chevron-up'
                : 'chevron-down'
            }
            size={18}
            color={Colors.textTertiary}
          />
        </TouchableOpacity>

        {showImage && (
          <View
            style={styles.imageWrap}
          >
            {result.imageUri ? (
              <Image
                source={{
                  uri: result.imageUri,
                }}
                style={
                  styles.prescriptionImage
                }
              />
            ) : (
              <View
                style={
                  styles.noImageContainer
                }
              >
                <Ionicons
                  name="image-outline"
                  size={42}
                  color={
                    Colors.textTertiary
                  }
                />

                <Text
                  style={
                    styles.noImageText
                  }
                >
                  Original prescription image unavailable
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Prescription Information */}
        <Card
          variant="outlined"
          padding="lg"
          style={
            styles.prescriptionInfoCard
          }
        >
          <Text
            style={styles.cardSectionTitle}
          >
            Prescription Information
          </Text>

          <View style={styles.infoGrid}>
            {/* Patient */}
            <View style={styles.infoItem}>
              <View
                style={styles.infoIcon}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={Colors.primary}
                />
              </View>

              <View
                style={styles.infoTextWrap}
              >
                <Text
                  style={styles.infoLabel}
                >
                  Patient Name
                </Text>

                <Text
                  style={styles.infoValue}
                >
                  {result.patientName ||
                    'Not mentioned'}
                </Text>
              </View>
            </View>

            {/* Doctor */}
            <View style={styles.infoItem}>
              <View
                style={styles.infoIcon}
              >
                <Ionicons
                  name="medical-outline"
                  size={18}
                  color={Colors.primary}
                />
              </View>

              <View
                style={styles.infoTextWrap}
              >
                <Text
                  style={styles.infoLabel}
                >
                  Doctor Name
                </Text>

                <Text
                  style={styles.infoValue}
                >
                  {result.doctorName ||
                    'Not mentioned'}
                </Text>
              </View>
            </View>

            {/* Prescription Date */}
            <View style={styles.infoItem}>
              <View
                style={styles.infoIcon}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={Colors.primary}
                />
              </View>

              <View
                style={styles.infoTextWrap}
              >
                <Text
                  style={styles.infoLabel}
                >
                  Prescription Date
                </Text>

                <Text
                  style={styles.infoValue}
                >
                  {result.date ||
                    'Not mentioned'}
                </Text>

                <Text
                  style={styles.infoHint}
                >
                  Date written on prescription
                </Text>
              </View>
            </View>

            {/* Scanned On */}
            <View style={styles.infoItem}>
              <View
                style={styles.infoIcon}
              >
                <Ionicons
                  name="scan-outline"
                  size={18}
                  color={Colors.primary}
                />
              </View>

              <View
                style={styles.infoTextWrap}
              >
                <Text
                  style={styles.infoLabel}
                >
                  Scanned On
                </Text>

                <Text
                  style={styles.infoValue}
                >
                  {scannedDateTime}
                </Text>

                <Text
                  style={styles.infoHint}
                >
                  Processed by GetMedGo
                </Text>
              </View>
            </View>
          </View>

          {/* Diagnosis */}
          {result.diagnosis && (
            <View
              style={styles.diagnosisRow}
            >
              <Text
                style={styles.infoLabel}
              >
                Diagnosis
              </Text>

              <Text
                style={styles.infoValue}
              >
                {result.diagnosis}
              </Text>
            </View>
          )}
        </Card>

        {/* Summary with Hindi toggle */}
        <Card
          variant="elevated"
          padding="lg"
          style={styles.card}
        >
          <View
            style={styles.cardHeader}
          >
            <View
              style={styles.cardHeaderLeft}
            >
              <Ionicons
                name="bulb"
                size={18}
                color={Colors.secondary}
              />

              <Text
                style={styles.cardTitle}
              >
                Summary
              </Text>
            </View>

            {result.summaryHindi && (
              <TouchableOpacity
                style={[
                  styles.langBtn,
                  showHindi &&
                    styles.langBtnActive,
                ]}
                onPress={() =>
                  setShowHindi(!showHindi)
                }
              >
                <Text
                  style={[
                    styles.langBtnText,
                    showHindi &&
                      styles.langBtnTextActive,
                  ]}
                >
                  {showHindi
                    ? 'ENG'
                    : 'हिंदी'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text
            style={styles.summaryText}
          >
            {showHindi &&
            result.summaryHindi
              ? result.summaryHindi
              : result.summary}
          </Text>

          {result.doctorName && (
            <Badge
              text={result.doctorName}
              variant="neutral"
              icon="person"
            />
          )}
        </Card>

        {/* Drug Interactions */}
        {result.drugInteractions &&
          result.drugInteractions.length >
            0 && (
            <View
              style={styles.interactionCard}
            >
              <View
                style={styles.rowGap}
              >
                <Ionicons
                  name="git-compare"
                  size={18}
                  color="#7C3AED"
                />

                <Text
                  style={
                    styles.interactionTitle
                  }
                >
                  Drug Interactions
                </Text>
              </View>

              {result.drugInteractions.map(
                (di, i) => (
                  <View
                    key={i}
                    style={
                      styles.interactionItem
                    }
                  >
                    <Badge
                      text={di.severity}
                      variant={
                        di.severity ===
                        'severe'
                          ? 'error'
                          : di.severity ===
                            'moderate'
                          ? 'warning'
                          : 'success'
                      }
                    />

                    <Text
                      style={
                        styles.interactionDrugs
                      }
                    >
                      {di.drug1} +{' '}
                      {di.drug2}
                    </Text>

                    <Text
                      style={
                        styles.interactionDesc
                      }
                    >
                      {di.description}
                    </Text>
                  </View>
                )
              )}
            </View>
          )}

        {/* Duplicate Medicines */}
        {result.duplicateMedicines &&
          result.duplicateMedicines.length >
            0 && (
            <View
              style={
                styles.duplicateCard
              }
            >
              <Ionicons
                name="copy-outline"
                size={16}
                color={Colors.warning}
              />

              <View
                style={
                  styles.duplicateContent
                }
              >
                <Text
                  style={
                    styles.duplicateTitle
                  }
                >
                  Duplicate Medicines Detected
                </Text>

                <Text
                  style={
                    styles.duplicateDesc
                  }
                >
                  {result.duplicateMedicines.join(
                    ', '
                  )}
                </Text>
              </View>
            </View>
          )}

        {/* Medicines */}
        <Text
          style={styles.sectionTitle}
        >
          Medicines (
          {result.medicines.length})
        </Text>

        <View
          style={styles.medicineList}
        >
          {result.medicines.map(
            (medicine, index) => (
              <MedicineCard
                key={index}
                medicine={medicine}
                index={index}
              />
            )
          )}
        </View>

        {/* Tests & Examinations */}
        {result.testsAndExaminations &&
          result.testsAndExaminations.length >
            0 && (
            <>
              <Text
                style={styles.sectionTitle}
              >
                Tests & Examinations (
                {
                  result
                    .testsAndExaminations
                    .length
                }
                )
              </Text>

              <View
                style={styles.testList}
              >
                {result.testsAndExaminations.map(
                  (test, index) => (
                    <TestCard
                      key={index}
                      test={test}
                      index={index}
                    />
                  )
                )}
              </View>
            </>
          )}

        {/* Instructions */}
        {result.instructions &&
          result.instructions.length >
            0 && (
            <>
              <Text
                style={styles.sectionTitle}
              >
                Instructions
              </Text>

              <Card
                variant="outlined"
                padding="md"
                style={styles.card}
              >
                {result.instructions.map(
                  (inst, i) => (
                    <View
                      key={i}
                      style={
                        styles.bulletRow
                      }
                    >
                      <View
                        style={
                          styles.bulletDot
                        }
                      />

                      <Text
                        style={
                          styles.bulletText
                        }
                      >
                        {inst}
                      </Text>
                    </View>
                  )
                )}
              </Card>
            </>
          )}

        {/* Warnings */}
        {result.warnings &&
          result.warnings.length >
            0 && (
            <>
              <Text
                style={styles.sectionTitle}
              >
                Warnings
              </Text>

              <View
                style={styles.warningCard}
              >
                {result.warnings.map(
                  (w, i) => (
                    <View
                      key={i}
                      style={
                        styles.warningRow
                      }
                    >
                      <Ionicons
                        name="warning"
                        size={16}
                        color="#DC2626"
                      />

                      <Text
                        style={
                          styles.warningText
                        }
                      >
                        {w}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </>
          )}

        {/* Disclaimer */}
        <View
          style={styles.disclaimer}
        >
          <Ionicons
            name="information-circle-outline"
            size={14}
            color={Colors.textTertiary}
          />

          <Text
            style={styles.disclaimerText}
          >
            AI-generated analysis for informational
            purposes only. Always consult your doctor.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* Action Button */
function ActionBtn({
  icon,
  label,
  onPress,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <TouchableOpacity
      style={styles.actionBtn}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.actionBtnIcon,
          {
            backgroundColor:
              color + '18',
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={color}
        />
      </View>

      <Text
        style={[
          styles.actionBtnText,
          { color },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* Test Card */
function TestCard({
  test,
  index,
}: {
  test: {
    name: string;
    details: string;
    timing: string;
  };
  index: number;
}) {
  return (
    <Card
      variant="outlined"
      padding="md"
      style={styles.testCard}
    >
      <View
        style={styles.testHeader}
      >
        <View
          style={styles.testNumberBadge}
        >
          <Text
            style={styles.testNumberText}
          >
            {index + 1}
          </Text>
        </View>

        <View
          style={styles.testTitleWrap}
        >
          <Text
            style={styles.testName}
          >
            {test.name}
          </Text>

          <View
            style={styles.testLabelRow}
          >
            <Ionicons
              name="flask-outline"
              size={13}
              color={Colors.primary}
            />

            <Text
              style={styles.testLabel}
            >
              Recommended examination
            </Text>
          </View>
        </View>
      </View>

      <View
        style={styles.testDetailsBox}
      >
        <Text
          style={
            styles.testDetailsLabel
          }
        >
          Details
        </Text>

        <Text
          style={styles.testDetails}
        >
          {test.details}
        </Text>
      </View>

      <View
        style={styles.testTimingRow}
      >
        <View
          style={styles.testTimingIcon}
        >
          <Ionicons
            name="time-outline"
            size={17}
            color={Colors.primary}
          />
        </View>

        <View
          style={styles.testTimingContent}
        >
          <Text
            style={styles.testTimingLabel}
          >
            When to do it
          </Text>

          <Text
            style={styles.testTimingValue}
          >
            {test.timing}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
  },

  errorText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },

  goBackText: {
    fontSize: Typography.body,
    color: Colors.primary,
    fontWeight: Typography.semibold,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor:
      Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },

  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  /* Content */
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.massive,
  },

  metaBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },

  /* Action buttons */
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },

  actionBtnIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionBtnText: {
    fontSize: Typography.tiny,
    fontWeight: Typography.semibold,
    textAlign: 'center',
  },

  /* Prescription image */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  toggleText: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },

  imageWrap: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    backgroundColor:
      Colors.surfaceSecondary,
  },

  prescriptionImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },

  noImageContainer: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },

  noImageText: {
    fontSize: Typography.bodySmall,
    color: Colors.textTertiary,
  },

  /* General cards */
  card: {
    marginBottom: Spacing.lg,
  },

  /* Prescription information */
  prescriptionInfoCard: {
    marginBottom: Spacing.lg,
  },

  cardSectionTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },

  infoGrid: {
    gap: Spacing.lg,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor:
      Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  infoTextWrap: {
    flex: 1,
  },

  infoLabel: {
    fontSize: Typography.tiny,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
    marginBottom: 3,
  },

  infoValue: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },

  infoHint: {
    fontSize: Typography.tiny,
    color: Colors.textTertiary,
    marginTop: 2,
  },

  diagnosisRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
  },

  /* Summary */
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },

  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  cardTitle: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  langBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  langBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  langBtnText: {
    fontSize: Typography.tiny,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
  },

  langBtnTextActive: {
    color: Colors.textInverse,
  },

  summaryText: {
    fontSize: Typography.body,
    color: Colors.textPrimary,
    lineHeight: 26,
    marginBottom: Spacing.lg,
  },

  /* Interactions */
  rowGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  interactionCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  interactionTitle: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semibold,
    color: '#5B21B6',
  },

  interactionItem: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },

  interactionDrugs: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semibold,
    color: '#5B21B6',
  },

  interactionDesc: {
    fontSize: Typography.caption,
    color: '#6D28D9',
    lineHeight: 18,
  },

  /* Duplicate medicines */
  duplicateCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor:
      Colors.warningLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  duplicateContent: {
    flex: 1,
  },

  duplicateTitle: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semibold,
    color: '#92400E',
  },

  duplicateDesc: {
    fontSize: Typography.caption,
    color: '#92400E',
    marginTop: 2,
  },

  /* Medicines */
  sectionTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },

  medicineList: {
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },

  /* Tests */
  testList: {
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },

  testCard: {
    backgroundColor: Colors.surface,
  },

  testHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },

  testNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor:
      Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  testNumberText: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },

  testTitleWrap: {
    flex: 1,
  },

  testName: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    lineHeight: 22,
  },

  testLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },

  testLabel: {
    fontSize: Typography.tiny,
    color: Colors.primary,
    fontWeight: Typography.medium,
  },

  testDetailsBox: {
    backgroundColor:
      Colors.surfaceSecondary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },

  testDetailsLabel: {
    fontSize: Typography.tiny,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },

  testDetails: {
    fontSize: Typography.caption,
    color: Colors.textPrimary,
    lineHeight: 19,
  },

  testTimingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  testTimingIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor:
      Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  testTimingContent: {
    flex: 1,
  },

  testTimingLabel: {
    fontSize: Typography.tiny,
    color: Colors.textSecondary,
    marginBottom: 2,
  },

  testTimingValue: {
    fontSize: Typography.caption,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },

  /* Instructions */
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },

  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 7,
  },

  bulletText: {
    flex: 1,
    fontSize: Typography.bodySmall,
    color: Colors.textPrimary,
    lineHeight: 22,
  },

  /* Warnings */
  warningCard: {
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },

  warningText: {
    flex: 1,
    fontSize: Typography.bodySmall,
    color: '#991B1B',
    lineHeight: 22,
  },

  /* Disclaimer */
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  disclaimerText: {
    flex: 1,
    fontSize: Typography.caption,
    color: Colors.textTertiary,
    lineHeight: 18,
  },
});