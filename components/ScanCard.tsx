import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Alert,
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
import { ScanHistoryItem } from '@/types/prescription';

interface ScanCardProps {
  item: ScanHistoryItem;
  onPress: () => void;
  onDelete?: (id: string) => void;
  style?: ViewStyle;
}

export default function ScanCard({
  item,
  onPress,
  onDelete,
  style,
}: ScanCardProps) {
  // Use analyzedAt first, then fall back to date.
  const dateValue = item.analyzedAt || item.date;
  const parsedDate = dateValue ? new Date(dateValue) : null;
  const isValidDate =
    parsedDate !== null && !Number.isNaN(parsedDate.getTime());

  const formattedDate = isValidDate
    ? parsedDate!.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Date unavailable';

  const formattedTime = isValidDate
    ? parsedDate!.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const handleDelete = () => {
    if (!onDelete) return;

    Alert.alert(
      'Delete prescription?',
      'This scan will be removed from your history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(item.id),
        },
      ]
    );
  };

  return (
    <Card variant="elevated" padding="md">
      <View style={styles.row}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          style={styles.mainContent}
          accessibilityRole="button"
          accessibilityLabel={`Open prescription scanned on ${formattedDate}`}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name="document-text"
              size={24}
              color={Colors.primary}
            />
          </View>

          <View style={styles.content}>
            <View style={styles.topRow}>
              <Text style={styles.date}>{formattedDate}</Text>

              <Badge
                text={`${item.medicineCount} medicine${
                  item.medicineCount !== 1 ? 's' : ''
                }`}
                variant="info"
              />
            </View>

            <Text style={styles.summary} numberOfLines={2}>
              {item.summary || 'No summary available'}
            </Text>

            {formattedTime ? (
              <Text style={styles.time}>{formattedTime}</Text>
            ) : null}
          </View>
        </TouchableOpacity>

        {onDelete ? (
          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.7}
            style={styles.deleteButton}
            accessibilityRole="button"
            accessibilityLabel="Delete this prescription"
            hitSlop={8}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={Colors.error}
            />
          </TouchableOpacity>
        ) : null}

        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.textTertiary}
          style={styles.chevron}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  date: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  summary: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    lineHeight: Typography.caption * Typography.lineHeightNormal,
  },
  time: {
    fontSize: Typography.tiny,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  deleteButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: Spacing.xs,
  },
});