import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';

type TestAndExamination = {
  name: string;
  details?: string;
  timing?: string;
};

type Props = {
  tests: TestAndExamination[];
};

export default function TestsAndExaminationsCard({ tests }: Props) {
  // Don't show the card when the prescription contains no tests/examinations.
  if (!tests || tests.length === 0) {
    return null;
  }

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.icon}>🧪</Text>

        <View style={styles.headerText}>
          <Text style={styles.title}>Tests & Examinations</Text>
          <Text style={styles.subtitle}>
            Tests or examinations written on the prescription
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {tests.map((test, index) => (
        <View
          key={`${test.name}-${index}`}
          style={[
            styles.testItem,
            index === tests.length - 1 && styles.lastItem,
          ]}
        >
          <View style={styles.number}>
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.testName}>
              {test.name || 'Test / Examination'}
            </Text>

            {test.details ? (
              <Text style={styles.details}>{test.details}</Text>
            ) : null}

            {test.timing ? (
              <View style={styles.timingContainer}>
                <Text style={styles.timingLabel}>Timing:</Text>
                <Text style={styles.timing}>{test.timing}</Text>
              </View>
            ) : null}
          </View>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    fontSize: 26,
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#6B7280',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },

  testItem: {
    flexDirection: 'row',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  lastItem: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },

  number: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  numberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },

  content: {
    flex: 1,
  },

  testName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  details: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },

  timingContainer: {
    flexDirection: 'row',
    marginTop: 7,
    flexWrap: 'wrap',
  },

  timingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginRight: 4,
  },

  timing: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
  },
});