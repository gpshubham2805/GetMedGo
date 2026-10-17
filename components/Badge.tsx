import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: Colors.successLight, text: '#065F46' },
  warning: { bg: Colors.warningLight, text: '#92400E' },
  error: { bg: Colors.errorLight, text: '#991B1B' },
  info: { bg: Colors.infoLight, text: '#1E40AF' },
  neutral: { bg: Colors.surfaceSecondary, text: Colors.textSecondary },
};

export default function Badge({ text, variant = 'neutral', icon, style }: BadgeProps) {
  const colors = variantColors[variant];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }, style]}>
      {icon && (
        <Ionicons
          name={icon}
          size={12}
          color={colors.text}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  text: {
    fontSize: Typography.caption,
    fontWeight: Typography.medium,
  },
});
