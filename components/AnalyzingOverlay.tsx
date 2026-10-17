import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface AnalyzingOverlayProps {
  visible: boolean;
}

export default function AnalyzingOverlay({
  visible,
}: AnalyzingOverlayProps) {
  const pulse = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    if (!visible) return;

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.07,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    const progressAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 0.9,
          duration: 1600,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0.25,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    pulseAnimation.start();
    progressAnimation.start();

    return () => {
      pulseAnimation.stop();
      progressAnimation.stop();
    };
  }, [visible, pulse, progress]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* Centered animated prescription icon */}
        <Animated.View
          style={[
            styles.iconCircle,
            { transform: [{ scale: pulse }] },
          ]}
        >
          <View style={styles.iconInner}>
            <Ionicons
              name="document-text"
              size={54}
              color={Colors.primary}
            />
            <View style={styles.scanBadge}>
              <Ionicons
                name="sparkles"
                size={17}
                color="#FFFFFF"
              />
            </View>
          </View>
        </Animated.View>

        {/* Status label */}
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            AI ANALYSIS IN PROGRESS
          </Text>
        </View>

        <Text style={styles.title}>
          Analyzing Prescription
        </Text>

        <Text style={styles.subtitle}>
          Reading medicines, dosages, and instructions...
        </Text>

        {/* Animated progress indicator */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <View style={styles.footer}>
          <Ionicons
            name="shield-checkmark"
            size={20}
            color={Colors.primary}
          />
          <Text style={styles.footerText}>
            Your prescription is being processed
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 999,
    elevation: 20,
  },

  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 26,
    paddingTop: 34,
    paddingBottom: 30,
    alignItems: 'center',
    elevation: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },

  iconCircle: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: '#E8FBFC',
    borderWidth: 2,
    borderColor: '#D0F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  iconInner: {
    width: 112,
    height: 112,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scanBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAFBF4',
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 9,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0D9488',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: '#11786F',
  },

  title: {
    fontSize: Typography.h4,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: Typography.body,
    color: '#526174',
    textAlign: 'center',
    lineHeight: 29,
    marginBottom: 28,
  },

  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 24,
  },

  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  footerText: {
    flexShrink: 1,
    fontSize: Typography.caption,
    color: '#64748B',
    textAlign: 'center',
  },
});